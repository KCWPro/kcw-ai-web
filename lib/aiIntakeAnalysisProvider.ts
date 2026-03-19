import { runOpenAiIntakeAnalysis } from "./aiIntakeAnalysisOpenAI";
import {
  type AnalysisLeadInput,
  type IntakeAnalysisResult,
  buildRuleBasedIntakeAnalysis,
} from "./aiIntakeAnalysisRules";

export type IntakeAnalysisProviderName = "rules" | "mock_ai" | "openai";

export type IntakeAnalysisProvider = {
  name: IntakeAnalysisProviderName;
  analyze: (lead: AnalysisLeadInput) => Promise<IntakeAnalysisResult>;
};

const rulesProvider: IntakeAnalysisProvider = {
  name: "rules",
  analyze: async (lead) => buildRuleBasedIntakeAnalysis(lead),
};

const mockAiProvider: IntakeAnalysisProvider = {
  name: "mock_ai",
  analyze: async (lead) => {
    const result = buildRuleBasedIntakeAnalysis(lead);
    return {
      ...result,
      analysis_version: "phase2-step3-mock-ai-placeholder",
    };
  },
};

const openAiProvider: IntakeAnalysisProvider = {
  name: "openai",
  analyze: async (lead) => runOpenAiIntakeAnalysis(lead),
};

const providers: Partial<Record<IntakeAnalysisProviderName, IntakeAnalysisProvider>> = {
  rules: rulesProvider,
  mock_ai: mockAiProvider,
  openai: openAiProvider,
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

export async function runIntakeAnalysisWithProvider(
  lead: AnalysisLeadInput,
  configuredProviderName?: string,
): Promise<IntakeAnalysisResult> {
  const provider = getIntakeAnalysisProvider(configuredProviderName);

  try {
    return await provider.analyze(lead);
  } catch {
    return rulesProvider.analyze(lead);
  }
}
