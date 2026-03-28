import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  transport: isDev
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
  base: {
    service: 'clawmore',
    version: process.env.npm_package_version,
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'secret',
      'apiKey',
      'STRIPE_SECRET_KEY',
      'AUTH_SECRET',
    ],
    censor: '[REDACTED]',
  },
});

/**
 * Create a child logger with a specific context.
 * Usage: const log = createLogger('billing');
 *        log.info('checkout created', { userId, priceId });
 */
export function createLogger(context: string) {
  return logger.child({ context });
}
