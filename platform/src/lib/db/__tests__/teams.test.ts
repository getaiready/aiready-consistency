import { describe, it, expect, vi } from 'vitest';
import { getTeam, getTeamBySlug } from '../teams';
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
  BatchWriteCommand: vi.fn(),
}));

vi.mock('./users', () => ({
  updateUser: vi.fn().mockResolvedValue({}),
  getUser: vi.fn().mockResolvedValue({}),
}));

describe('Team DB Utils', () => {
  it('should get a team', async () => {
    vi.mocked(doc.send).mockResolvedValue({
      Item: { id: 'team-1', name: 'Test Team' },
    });
    const team = await getTeam('team-1');
    expect(team?.id).toBe('team-1');
  });

  it('should get a team by slug', async () => {
    vi.mocked(doc.send).mockResolvedValue({
      Items: [{ id: 'team-1', slug: 'test-team' }],
    });
    const team = await getTeamBySlug('test-team');
    expect(team?.slug).toBe('test-team');
  });
});
