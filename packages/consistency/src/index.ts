import { ToolRegistry } from '@aiready/core';
import { CONSISTENCY_PROVIDER } from './provider';

// Register with global registry
ToolRegistry.register(CONSISTENCY_PROVIDER);

export { analyzeConsistency } from './analyzer';
export function generateSummary(report: any) {
  return report.summary;
}
export { analyzeNamingAST } from './analyzers/naming-ast';
export { analyzeNaming } from './analyzers/naming'; // Legacy regex version
export { detectNamingConventions } from './analyzers/naming-constants';
export { analyzePatterns } from './analyzers/patterns';
export { calculateConsistencyScore } from './scoring';
export { CONSISTENCY_PROVIDER };
export type {
  ConsistencyOptions,
  ConsistencyReport,
  ConsistencyIssue,
  NamingIssue,
  PatternIssue,
  ArchitectureIssue,
} from './types';
