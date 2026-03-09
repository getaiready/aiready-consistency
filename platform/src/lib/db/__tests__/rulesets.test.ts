import { describe, it, expect, vi } from 'vitest';
import { getRuleset } from '../rulesets';
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
  UpdateCommand: vi.fn(),
}));

describe('Ruleset DB Utils', () => {
  it('should get a ruleset', async () => {
    vi.mocked(doc.send).mockResolvedValue({
      Item: { teamId: 'team-1', enforcement: 'strict' },
    });
    const ruleset = await getRuleset('team-1');
    expect(ruleset?.teamId).toBe('team-1');
    expect(ruleset?.enforcement).toBe('strict');
  });
});
