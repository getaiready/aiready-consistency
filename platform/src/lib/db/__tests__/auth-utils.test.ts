import { describe, it, expect, vi } from 'vitest';
import { createApiKey } from '../auth-utils';
import { doc } from '../client';

vi.mock('../client', () => ({
  doc: {
    send: vi.fn().mockResolvedValue({}),
  },
  getTableName: vi.fn().mockReturnValue('test-table'),
}));

vi.mock('@aws-sdk/lib-dynamodb', () => ({
  PutCommand: vi.fn(),
  GetCommand: vi.fn(),
  QueryCommand: vi.fn(),
  DeleteCommand: vi.fn(),
  UpdateCommand: vi.fn(),
}));

describe('Auth DB Utils', () => {
  describe('createApiKey', () => {
    it('should create an API key with correct format', async () => {
      const { key, apiKeyId } = await createApiKey('user-123', 'My Key');

      expect(key).toMatch(/^ar_[a-f0-9]{64}$/);
      expect(apiKeyId).toBeDefined();
      expect(doc.send).toHaveBeenCalled();
    });
  });
});
