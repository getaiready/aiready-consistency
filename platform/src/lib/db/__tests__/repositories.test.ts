import { describe, it, expect, vi } from 'vitest';
import { createRepository, getRepository } from '../repositories';
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

describe('Repository DB Utils', () => {
  it('should create a repository', async () => {
    const mockRepo: any = {
      id: 'repo-1',
      userId: 'user-1',
      name: 'test-repo',
      url: 'https://github.com/test/repo',
      defaultBranch: 'main',
    };

    const result = await createRepository(mockRepo);
    expect(result.id).toBe('repo-1');
    expect(doc.send).toHaveBeenCalled();
  });

  it('should get a repository', async () => {
    vi.mocked(doc.send).mockResolvedValue({
      Item: { id: 'repo-1', name: 'test' },
    });
    const repo = await getRepository('repo-1');
    expect(repo?.id).toBe('repo-1');
  });
});
