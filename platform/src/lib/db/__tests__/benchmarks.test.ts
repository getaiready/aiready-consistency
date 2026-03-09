import { describe, it, expect, vi } from 'vitest';
import { getIndustryBenchmarks } from '../benchmarks';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

vi.mock('sst', () => ({
  Resource: {
    MainTable: { name: 'test-table' },
  },
}));

vi.mock('@aws-sdk/lib-dynamodb', async () => {
  const actual = await vi.importActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: vi.fn().mockReturnValue({
        send: vi.fn(),
      }),
    },
  };
});

describe('Benchmarks DB Utils', () => {
  it('should calculate percentiles correctly', async () => {
    const docClient = DynamoDBDocumentClient.from({} as any);
    vi.mocked(docClient.send).mockResolvedValue({
      Items: [
        { id: 'repo-1', score: 90 },
        { id: 'repo-2', score: 50 },
        { id: 'repo-3', score: 70 },
        { id: 'repo-4', score: 30 },
      ],
    });

    const benchmarks = await getIndustryBenchmarks('repo-1');

    expect(benchmarks?.totalRepos).toBe(4);
    expect(benchmarks?.averageScore).toBe(60);
    expect(benchmarks?.percentile).toBe(25); // Top 25% (3 below out of 4) -> 75th percentile -> Top 25%
    expect(benchmarks?.rank).toBe('High');
  });
});
