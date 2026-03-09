import { describe, it, expect, vi } from 'vitest';
import { createAnalysis } from '../analysis';
import { doc } from '../client';
import { updateRepositoryScore } from '../repositories';

vi.mock('../client', () => ({
  doc: {
    send: vi.fn().mockResolvedValue({}),
  },
  getTableName: vi.fn().mockReturnValue('test-table'),
}));

vi.mock('../repositories', () => ({
  updateRepositoryScore: vi.fn().mockResolvedValue({}),
}));

vi.mock('@aws-sdk/lib-dynamodb', () => ({
  PutCommand: vi.fn(),
  QueryCommand: vi.fn(),
  UpdateCommand: vi.fn(),
}));

describe('Analysis DB Utils', () => {
  it('should create analysis and update repository score if completed', async () => {
    const mockAnalysis: any = {
      repoId: 'repo-1',
      timestamp: '2024-01-01',
      aiScore: 80,
      status: 'completed',
    };

    await createAnalysis(mockAnalysis);

    expect(doc.send).toHaveBeenCalled();
    expect(updateRepositoryScore).toHaveBeenCalledWith('repo-1', 80);
  });

  it('should not update repository score if analysis is processing', async () => {
    const mockAnalysis: any = {
      repoId: 'repo-1',
      timestamp: '2024-01-01',
      aiScore: 80,
      status: 'processing',
    };

    vi.clearAllMocks();
    await createAnalysis(mockAnalysis);

    expect(updateRepositoryScore).not.toHaveBeenCalled();
  });
});
