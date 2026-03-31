import { createProvider, ToolName, ScanOptions } from '@aiready/core';
import { analyzeConsistency } from './analyzer';
import { calculateConsistencyScore } from './scoring';
import { ConsistencyOptions, ConsistencyIssue } from './types';

/**
 * Naming Consistency Tool Provider
 */
export const NAMING_CONSISTENCY_PROVIDER = createProvider({
  id: ToolName.NamingConsistency,
  alias: ['consistency', 'naming', 'standards'],
  version: '0.16.5',
  defaultWeight: 14,
  async analyzeReport(options: ScanOptions) {
    return analyzeConsistency(options as ConsistencyOptions);
  },
  getResults(report) {
    return report.results;
  },
  getSummary(report) {
    return report.summary;
  },
  score(output, options) {
    const results = output.results || [];
    const allIssues = results.flatMap(
      (r) => r.issues || []
    ) as ConsistencyIssue[];
    const totalFiles = output.summary?.filesAnalyzed || results.length;

    return calculateConsistencyScore(
      allIssues,
      totalFiles,
      options?.costConfig
    );
  },
});
