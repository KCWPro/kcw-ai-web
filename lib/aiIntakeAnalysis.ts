import { runIntakeAnalysisWithAudit, runIntakeAnalysisWithProvider } from "./aiIntakeAnalysisProvider";
import type { AnalysisLeadInput } from "./aiIntakeAnalysisRules";

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

export function buildIntakeAnalysis(lead: AnalysisLeadInput) {
  return runIntakeAnalysisWithProvider(lead);
}

export function buildIntakeAnalysisWithAudit(lead: AnalysisLeadInput) {
  return runIntakeAnalysisWithAudit(lead);
}
