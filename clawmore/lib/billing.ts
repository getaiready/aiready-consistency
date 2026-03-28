import Stripe from 'stripe';
import { Resource } from 'sst';
import { createLogger } from './logger';

const log = createLogger('billing');

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-01-27-acacia' as any,
    });
  }
  return stripeClient;
}

/**
 * Creates a Stripe Checkout Session for the $29.00/mo Platform Subscription.
 * This also authorizes the 'off_session' auto-recharges for AI tokens.
 */
export interface PlatformSubscriptionOpts {
  customerId?: string;
  userEmail: string;
  userName?: string;
  repoName?: string;
  coEvolutionOptIn?: boolean;
  tier?: 'starter' | 'pro' | 'team';
  successUrl: string;
  cancelUrl: string;
}

const TIER_CONFIG: Record<
  string,
  { priceKey: string; amount: number; name: string }
> = {
  starter: { priceKey: 'PlatformPrice', amount: 2900, name: 'Starter' },
  pro: { priceKey: 'ProPrice', amount: 9900, name: 'Pro' },
  team: { priceKey: 'TeamPrice', amount: 29900, name: 'Team' },
};

export async function createPlatformSubscriptionSession(
  opts: PlatformSubscriptionOpts
) {
  const {
    customerId,
    userEmail,
    userName = 'Valued Client',
    repoName,
    coEvolutionOptIn = false,
    tier = 'pro',
    successUrl,
    cancelUrl,
  } = opts;

  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.pro;
  const priceId = (Resource as any)[tierConfig.priceKey]?.id;

  // Auto-generate repo name if not provided
  const finalRepoName =
    repoName || `serverlessclaw-instance-${Date.now().toString(36)}`;

  return await getStripe().checkout.sessions.create({
    customer: customerId,
    customer_email: customerId ? undefined : userEmail,
    payment_method_types: ['card'],
    line_items: [
      priceId
        ? { price: priceId, quantity: 1 }
        : {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `ClawMore ${tierConfig.name}`,
                description:
                  'Managed AWS infrastructure, AI-powered fixes, CI/CD integration, and dashboard.',
              },
              unit_amount: tierConfig.amount,
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
    ],
    mode: 'subscription',
    payment_intent_data: {
      setup_future_usage: 'off_session', // CRITICAL: Authorizes auto-recharges
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: 'platform_subscription',
      tier,
      coEvolutionOptIn: coEvolutionOptIn ? 'true' : 'false',
      userEmail,
      userName,
      repoName: finalRepoName,
    },
    subscription_data: {
      description: `ClawMore Managed - ${userEmail}`,
      metadata: {
        coEvolutionOptIn: coEvolutionOptIn ? 'true' : 'false',
        userEmail,
        userName,
        repoName: finalRepoName,
      },
    },
  });
}

/**
 * Reports usage for a metered subscription item (e.g., the Evolution Tax).
 */
export async function reportMeteredUsage(
  subscriptionItemId: string,
  quantity: number = 1
) {
  try {
    await (getStripe().subscriptionItems as any).createUsageRecord(
      subscriptionItemId,
      {
        quantity,
        timestamp: Math.floor(Date.now() / 1000),
        action: 'increment',
      }
    );
    log.info({ subscriptionItemId, quantity }, 'Metered usage reported');
  } catch (error) {
    log.error(
      { err: error, subscriptionItemId },
      'Failed to report metered usage'
    );
    throw error;
  }
}

/**
 * Adds a one-time charge (invoice item) to the customer's next invoice.
 */
export async function reportOverageCharge(
  customerId: string,
  amountInCents: number,
  description: string
) {
  try {
    await getStripe().invoiceItems.create({
      customer: customerId,
      amount: amountInCents,
      currency: 'usd',
      description,
    });
    log.info(
      { customerId, amountCents: amountInCents },
      'Overage charge reported'
    );
  } catch (error) {
    log.error({ err: error, customerId }, 'Failed to report overage charge');
    throw error;
  }
}

/**
 * Creates a Stripe Checkout Session for a pre-paid "AI Fuel Pack".
 */
export async function createFuelPackCheckout(
  customerId: string,
  successUrl: string,
  cancelUrl: string
) {
  // Use the linked price ID from SST if it exists
  const priceId = (Resource as any).FuelPackPrice?.id;

  return await getStripe().checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      priceId
        ? { price: priceId, quantity: 1 }
        : {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'ClawMore AI Credit Pack ($10)',
                description: '$10 top-up for AI-powered code fixes.',
              },
              unit_amount: 1000,
            },
            quantity: 1,
          },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: 'fuel_pack_refill',
      amountCents: '1000',
    },
  });
}
