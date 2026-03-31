import { ToolRegistry } from '@aiready/core';
import { CHANGE_AMPLIFICATION_PROVIDER } from './provider';

// Register with global registry
ToolRegistry.register(CHANGE_AMPLIFICATION_PROVIDER);

export { analyzeChangeAmplification } from './analyzer';
export { calculateChangeAmplificationScore } from './scoring';
export { CHANGE_AMPLIFICATION_PROVIDER };
export type {
  ChangeAmplificationOptions,
  ChangeAmplificationReport,
  ChangeAmplificationIssue,
  FileChangeAmplificationResult,
} from './types';
