import { runIntakeAnalysisWithAudit, runIntakeAnalysisWithProvider } from "./aiIntakeAnalysisProvider";
import type { AnalysisLeadInput } from "./aiIntakeAnalysisRules";

/**
 * Phase 2 stable public contract:
 * - buildIntakeAnalysis: default stable entry for business-layer usage
 * - buildIntakeAnalysisWithAudit: advanced internal entry for operational/debug usage
 *
 * NOTE:
 * Provider/governance files are runtime internals and should not be imported
 * directly by feature code when this module can be used instead.
 */
export type {
  AnalysisLeadInput,
  InfoCompletenessLevel,
  IntakeAnalysisResult,
  IssueClassification,
  SuggestedPriceBand,
  SuggestedPriceRange,
} from "./aiIntakeAnalysisRules";

export type {
  IntakeAnalysisAudit,
  IntakeAnalysisErrorCategory,
  IntakeAnalysisFallbackReason,
  IntakeAnalysisProvider,
  IntakeAnalysisProviderName,
  IntakeAnalysisRunStatus,
} from "./aiIntakeAnalysisProvider";

// Runtime governance/policy types are exported for internal tooling/tests.
// Business feature code should depend on buildIntakeAnalysis(...) instead.
export type {
  IntakeAnalysisGovernanceConfig,
  IntakeAnalysisGovernancePolicy,
  IntakeAnalysisGovernanceResolution,
  IntakeAnalysisPolicyName,
} from "./aiIntakeAnalysisGovernanceConfig";

export function buildIntakeAnalysis(lead: AnalysisLeadInput) {
  return runIntakeAnalysisWithProvider(lead);
}

export function buildIntakeAnalysisWithAudit(lead: AnalysisLeadInput) {
  return runIntakeAnalysisWithAudit(lead);
}
