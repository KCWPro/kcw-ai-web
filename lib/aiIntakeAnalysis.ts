import { runIntakeAnalysisWithProvider } from "./aiIntakeAnalysisProvider";
import type { AnalysisLeadInput } from "./aiIntakeAnalysisRules";

export type {
  AnalysisLeadInput,
  InfoCompletenessLevel,
  IntakeAnalysisResult,
  IssueClassification,
  SuggestedPriceBand,
  SuggestedPriceRange,
} from "./aiIntakeAnalysisRules";

export type { IntakeAnalysisProvider, IntakeAnalysisProviderName } from "./aiIntakeAnalysisProvider";

export function buildIntakeAnalysis(lead: AnalysisLeadInput) {
  return runIntakeAnalysisWithProvider(lead);
}
