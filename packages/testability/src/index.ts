import { ToolRegistry } from '@aiready/core';
import { TESTABILITY_PROVIDER } from './provider';

// Register with global registry
ToolRegistry.register(TESTABILITY_PROVIDER);

export { analyzeTestability } from './analyzer';
export { calculateTestabilityScore } from './scoring';
export { TESTABILITY_PROVIDER };
export type {
  TestabilityOptions,
  TestabilityReport,
  TestabilityIssue,
} from './types';
