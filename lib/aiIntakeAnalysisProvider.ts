import {
  type AnalysisLeadInput,
  type IntakeAnalysisResult,
  buildRuleBasedIntakeAnalysis,
} from "./aiIntakeAnalysisRules";

export type IntakeAnalysisProviderName = "rules" | "mock_ai" | "openai";

export type IntakeAnalysisProvider = {
  name: IntakeAnalysisProviderName;
  analyze: (lead: AnalysisLeadInput) => IntakeAnalysisResult;
};

const rulesProvider: IntakeAnalysisProvider = {
  name: "rules",
  analyze: (lead) => buildRuleBasedIntakeAnalysis(lead),
};

const mockAiProvider: IntakeAnalysisProvider = {
  name: "mock_ai",
  analyze: (lead) => {
    const result = buildRuleBasedIntakeAnalysis(lead);
    return {
      ...result,
      analysis_version: "phase2-step3-mock-ai-placeholder",
    };
  },
};

const providers: Partial<Record<IntakeAnalysisProviderName, IntakeAnalysisProvider>> = {
  rules: rulesProvider,
  mock_ai: mockAiProvider,
};

export function resolveIntakeAnalysisProviderName(configuredProviderName?: string): IntakeAnalysisProviderName {
  const normalized = (configuredProviderName || "").trim().toLowerCase();

  if (normalized === "rules" || normalized === "mock_ai" || normalized === "openai") {
    return normalized;
  }

  return "rules";
}

export function getIntakeAnalysisProvider(configuredProviderName?: string): IntakeAnalysisProvider {
  const name = resolveIntakeAnalysisProviderName(configuredProviderName || process.env.INTAKE_ANALYSIS_PROVIDER);

  const provider = providers[name];
  if (provider) {
    return provider;
  }

  return rulesProvider;
}

export function runIntakeAnalysisWithProvider(lead: AnalysisLeadInput, configuredProviderName?: string): IntakeAnalysisResult {
  const provider = getIntakeAnalysisProvider(configuredProviderName);

  try {
    return provider.analyze(lead);
  } catch {
    return rulesProvider.analyze(lead);
  }
}
