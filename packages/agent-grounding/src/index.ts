import { ToolRegistry } from '@aiready/core';
import { AGENT_GROUNDING_PROVIDER } from './provider';

// Register with global registry
ToolRegistry.register(AGENT_GROUNDING_PROVIDER);

export { analyzeAgentGrounding } from './analyzer';
export { calculateGroundingScore } from './scoring';
export { AGENT_GROUNDING_PROVIDER };
export type {
  AgentGroundingOptions,
  AgentGroundingReport,
  AgentGroundingIssue,
} from './types';
