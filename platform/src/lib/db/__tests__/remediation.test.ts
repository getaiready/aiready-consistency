import { describe, it, expect, vi } from 'vitest';
import { getRemediation } from '../remediation';
import { doc } from '../client';

vi.mock('../client', () => ({
  doc: {
    send: vi.fn().mockResolvedValue({}),
  },
  getTableName: vi.fn().mockReturnValue('test-table'),
}));

vi.mock('@aws-sdk/lib-dynamodb', () => ({
  PutCommand: vi.fn(),
  QueryCommand: vi.fn(),
  UpdateCommand: vi.fn(),
}));

describe('Remediation DB Utils', () => {
  it('should get a remediation by ID', async () => {
    vi.mocked(doc.send).mockResolvedValue({
      Items: [{ id: 'rem-1', title: 'Fix it' }],
    });
    const rem = await getRemediation('rem-1');
    expect(rem?.id).toBe('rem-1');
  });
});
