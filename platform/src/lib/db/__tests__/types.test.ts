import { describe, it, expect } from 'vitest';
import { Analysis } from '../types';

describe('DB Types', () => {
  it('should allow creating a partial analysis for testing', () => {
    const analysis: Partial<Analysis> = {
      id: 'analysis-1',
      aiScore: 85,
      status: 'completed',
    };

    expect(analysis.id).toBe('analysis-1');
    expect(analysis.aiScore).toBe(85);
  });
});
