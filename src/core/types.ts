import type { Severity } from '../context-rules';

export type PatternType =
  | 'function'
  | 'class-method'
  | 'api-handler'
  | 'validator'
  | 'utility'
  | 'component'
  | 'unknown';

export interface DuplicatePattern {
  file1: string;
  file2: string;
  line1: number;
  line2: number;
  endLine1: number;
  endLine2: number;
  similarity: number;
  snippet: string;
  patternType: PatternType;
  tokenCost: number;
  linesOfCode: number;
  severity: Severity;
  reason?: string;
  suggestion?: string;
  matchedRule?: string;
}

export interface FileContent {
  file: string;
  content: string;
}

export interface DetectionOptions {
  minSimilarity: number;
  minLines: number;
  batchSize?: number;
  approx?: boolean;
  minSharedTokens?: number;
  maxCandidatesPerBlock?: number;
  maxComparisons?: number;
  streamResults?: boolean;
  onProgress?: (processed: number, total: number, message: string) => void;
}

export interface CodeBlock {
  content: string;
  startLine: number;
  endLine: number;
  file: string;
  normalized: string;
  patternType: PatternType;
  tokenCost: number;
  linesOfCode: number;
}
