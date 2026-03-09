import { describe, it, expect, vi } from 'vitest';
import { createUser, getUser } from '../users';
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
  UpdateCommand: vi.fn(),
}));

describe('User DB Utils', () => {
  it('should create a user', async () => {
    const mockUser: any = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
    };

    const result = await createUser(mockUser);
    expect(result.id).toBe('user-1');
    expect(doc.send).toHaveBeenCalled();
  });

  it('should get a user', async () => {
    vi.mocked(doc.send).mockResolvedValue({
      Item: { id: 'user-1', email: 'test@example.com' },
    });
    const user = await getUser('user-1');
    expect(user?.id).toBe('user-1');
  });
});
