import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}));

vi.mock('@aws-sdk/client-ses', () => {
  class MockSESClient {
    send = mockSend;
    constructor() {}
  }
  class MockSendEmailCommand {
    Destination: any;
    Source!: string;
    Message: any;
    constructor(args: any) {
      Object.assign(this, args);
    }
  }
  return { SESClient: MockSESClient, SendEmailCommand: MockSendEmailCommand };
});

import {
  sendApprovalEmail,
  sendWelcomeEmail,
  sendPaymentFailedEmail,
  sendSubscriptionCancelledEmail,
} from './email';

describe('email service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendApprovalEmail', () => {
    it('should send approval email with login link', async () => {
      await sendApprovalEmail('user@example.com', 'Jane');

      expect(mockSend).toHaveBeenCalledTimes(1);
      const cmd = mockSend.mock.calls[0][0];
      expect(cmd.Destination.ToAddresses).toEqual(['user@example.com']);
      expect(cmd.Message.Subject.Data).toBe(
        'Your ClawMore Account is Approved'
      );
      expect(cmd.Message.Body.Html.Data).toContain('Jane');
      expect(cmd.Message.Body.Html.Data).toContain('/login');
      expect(cmd.Message.Body.Text.Data).toContain('Jane');
    });

    it('should escape HTML in user name', async () => {
      await sendApprovalEmail(
        'user@example.com',
        '<script>alert("xss")</script>'
      );

      const cmd = mockSend.mock.calls[0][0];
      expect(cmd.Message.Body.Html.Data).not.toContain('<script>');
      expect(cmd.Message.Body.Html.Data).toContain('&lt;script&gt;');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with dashboard link and credits info', async () => {
      await sendWelcomeEmail('new@example.com', 'Bob');

      expect(mockSend).toHaveBeenCalledTimes(1);
      const cmd = mockSend.mock.calls[0][0];
      expect(cmd.Destination.ToAddresses).toEqual(['new@example.com']);
      expect(cmd.Message.Subject.Data).toBe('Welcome to ClawMore');
      expect(cmd.Message.Body.Html.Data).toContain('Bob');
      expect(cmd.Message.Body.Html.Data).toContain('$5');
      expect(cmd.Message.Body.Html.Data).toContain('/dashboard');
      expect(cmd.Message.Body.Html.Data).toContain('3 repositories');
    });
  });

  describe('sendPaymentFailedEmail', () => {
    it('should send payment failed email with billing link', async () => {
      await sendPaymentFailedEmail('fail@example.com', 'Alice');

      expect(mockSend).toHaveBeenCalledTimes(1);
      const cmd = mockSend.mock.calls[0][0];
      expect(cmd.Destination.ToAddresses).toEqual(['fail@example.com']);
      expect(cmd.Message.Subject.Data).toBe('Action Required: Payment Failed');
      expect(cmd.Message.Body.Html.Data).toContain('Alice');
      expect(cmd.Message.Body.Html.Data).toContain('Payment Failed');
      expect(cmd.Message.Body.Html.Data).toContain('/dashboard?tab=account');
    });
  });

  describe('sendSubscriptionCancelledEmail', () => {
    it('should send cancellation email with free tier info', async () => {
      await sendSubscriptionCancelledEmail('cancel@example.com', 'Charlie');

      expect(mockSend).toHaveBeenCalledTimes(1);
      const cmd = mockSend.mock.calls[0][0];
      expect(cmd.Destination.ToAddresses).toEqual(['cancel@example.com']);
      expect(cmd.Message.Subject.Data).toBe('ClawMore Subscription Cancelled');
      expect(cmd.Message.Body.Html.Data).toContain('Charlie');
      expect(cmd.Message.Body.Html.Data).toContain('Subscription Cancelled');
      expect(cmd.Message.Body.Html.Data).toContain('/#pricing');
      expect(cmd.Message.Body.Html.Data).toContain('10 scans per month');
    });
  });

  describe('error handling', () => {
    it('should not throw when SES send fails', async () => {
      mockSend.mockRejectedValue(new Error('SES down'));

      await expect(
        sendApprovalEmail('user@example.com', 'Test')
      ).resolves.not.toThrow();
    });
  });
});
