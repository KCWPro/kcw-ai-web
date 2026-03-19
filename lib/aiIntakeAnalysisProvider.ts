import { OpenAiIntakeError, runOpenAiIntakeAnalysis } from "./aiIntakeAnalysisOpenAI";
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

export type IntakeAnalysisRunStatus = "success" | "fallback_success" | "failed";

export type IntakeAnalysisErrorCategory =
  | "invalid_provider"
  | "missing_config"
  | "provider_not_implemented"
  | "provider_execution_error"
  | "invalid_provider_output"
  | "unknown";

export type IntakeAnalysisFallbackReason =
  | "none"
  | "invalid_provider"
  | "missing_config"
  | "provider_not_implemented"
  | "provider_execution_error"
  | "invalid_provider_output"
  | "unknown";

export type IntakeAnalysisAttempt = {
  provider: IntakeAnalysisProviderName;
  status: "success" | "failed";
  duration_ms: number;
  error_category: IntakeAnalysisErrorCategory | null;
};

export type IntakeAnalysisAudit = {
  requested_provider: string;
  resolved_provider: IntakeAnalysisProviderName;
  final_provider: IntakeAnalysisProviderName;
  status: IntakeAnalysisRunStatus;
  fallback_used: boolean;
  fallback_reason: IntakeAnalysisFallbackReason;
  duration_ms: number;
  error_category: IntakeAnalysisErrorCategory | null;
  analysis_version: string;
  timestamp: string;
  provider_attempts: IntakeAnalysisAttempt[];
};

export type IntakeAnalysisWithAudit = {
  result: IntakeAnalysisResult;
  audit: IntakeAnalysisAudit;
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

function nowMs() {
  return Date.now();
}

function isDebugEnabled() {
  return (process.env.INTAKE_ANALYSIS_DEBUG || "").trim().toLowerCase() === "true";
}

function classifyError(error: unknown): IntakeAnalysisErrorCategory {
  if (error instanceof OpenAiIntakeError) {
    if (error.category === "missing_config") return "missing_config";
    if (error.category === "provider_execution_error") return "provider_execution_error";
    if (error.category === "invalid_provider_output") return "invalid_provider_output";
  }

  if (error instanceof Error) {
    const text = error.message.toLowerCase();
    if (text.includes("missing")) return "missing_config";
    if (text.includes("not implemented")) return "provider_not_implemented";
    if (text.includes("invalid")) return "invalid_provider_output";
  }

  return "unknown";
}

function categoryToFallbackReason(category: IntakeAnalysisErrorCategory): IntakeAnalysisFallbackReason {
  if (category === "missing_config") return "missing_config";
  if (category === "provider_not_implemented") return "provider_not_implemented";
  if (category === "provider_execution_error") return "provider_execution_error";
  if (category === "invalid_provider_output") return "invalid_provider_output";
  if (category === "invalid_provider") return "invalid_provider";
  return "unknown";
}

function resolveRequestedProvider(configuredProviderName?: string): string {
  return (configuredProviderName || process.env.INTAKE_ANALYSIS_PROVIDER || "rules").trim().toLowerCase() || "rules";
}

export function resolveIntakeAnalysisProviderName(configuredProviderName?: string): IntakeAnalysisProviderName {
  const normalized = resolveRequestedProvider(configuredProviderName);

  if (normalized === "rules" || normalized === "mock_ai" || normalized === "openai") {
    return normalized;
  }

  return "rules";
}

export function getIntakeAnalysisProvider(configuredProviderName?: string): IntakeAnalysisProvider {
  const name = resolveIntakeAnalysisProviderName(configuredProviderName);
  const provider = providers[name];

  if (provider) {
    return provider;
  }

  return rulesProvider;
}

export async function runIntakeAnalysisWithAudit(
  lead: AnalysisLeadInput,
  configuredProviderName?: string,
): Promise<IntakeAnalysisWithAudit> {
  const start = nowMs();
  const timestamp = new Date().toISOString();
  const requestedProvider = resolveRequestedProvider(configuredProviderName);
  const resolvedProvider = resolveIntakeAnalysisProviderName(configuredProviderName);
  const attempts: IntakeAnalysisAttempt[] = [];
  const providerExists = !!providers[resolvedProvider];

  if (!providerExists) {
    const fallbackStart = nowMs();
    const fallbackResult = await rulesProvider.analyze(lead);
    const fallbackDuration = nowMs() - fallbackStart;

    attempts.push({
      provider: resolvedProvider,
      status: "failed",
      duration_ms: 0,
      error_category: "provider_not_implemented",
    });
    attempts.push({
      provider: "rules",
      status: "success",
      duration_ms: fallbackDuration,
      error_category: null,
    });

    return {
      result: fallbackResult,
      audit: {
        requested_provider: requestedProvider,
        resolved_provider: resolvedProvider,
        final_provider: "rules",
        status: "fallback_success",
        fallback_used: true,
        fallback_reason: "provider_not_implemented",
        duration_ms: nowMs() - start,
        error_category: "provider_not_implemented",
        analysis_version: fallbackResult.analysis_version,
        timestamp,
        provider_attempts: attempts,
      },
    };
  }

  const provider = providers[resolvedProvider] as IntakeAnalysisProvider;

  try {
    const providerStart = nowMs();
    const result = await provider.analyze(lead);
    attempts.push({
      provider: provider.name,
      status: "success",
      duration_ms: nowMs() - providerStart,
      error_category: null,
    });

    const invalidRequestedProvider = requestedProvider !== resolvedProvider;

    const audit: IntakeAnalysisAudit = {
      requested_provider: requestedProvider,
      resolved_provider: resolvedProvider,
      final_provider: provider.name,
      status: invalidRequestedProvider ? "fallback_success" : "success",
      fallback_used: invalidRequestedProvider,
      fallback_reason: invalidRequestedProvider ? "invalid_provider" : "none",
      duration_ms: nowMs() - start,
      error_category: invalidRequestedProvider ? "invalid_provider" : null,
      analysis_version: result.analysis_version,
      timestamp,
      provider_attempts: attempts,
    };

    if (isDebugEnabled() && invalidRequestedProvider) {
      console.warn("[intake-analysis] provider resolved with fallback", audit);
    }

    return { result, audit };
  } catch (error: unknown) {
    const category = classifyError(error);

    attempts.push({
      provider: provider.name,
      status: "failed",
      duration_ms: 0,
      error_category: category,
    });

    try {
      const fallbackStart = nowMs();
      const fallbackResult = await rulesProvider.analyze(lead);
      attempts.push({
        provider: "rules",
        status: "success",
        duration_ms: nowMs() - fallbackStart,
        error_category: null,
      });

      const audit: IntakeAnalysisAudit = {
        requested_provider: requestedProvider,
        resolved_provider: resolvedProvider,
        final_provider: "rules",
        status: "fallback_success",
        fallback_used: true,
        fallback_reason: categoryToFallbackReason(category),
        duration_ms: nowMs() - start,
        error_category: category,
        analysis_version: fallbackResult.analysis_version,
        timestamp,
        provider_attempts: attempts,
      };

      if (isDebugEnabled()) {
        console.warn("[intake-analysis] provider fallback triggered", audit);
      }

      return {
        result: fallbackResult,
        audit,
      };
    } catch {
      const audit: IntakeAnalysisAudit = {
        requested_provider: requestedProvider,
        resolved_provider: resolvedProvider,
        final_provider: resolvedProvider,
        status: "failed",
        fallback_used: true,
        fallback_reason: categoryToFallbackReason(category),
        duration_ms: nowMs() - start,
        error_category: category,
        analysis_version: "phase2-step5-failed",
        timestamp,
        provider_attempts: attempts,
      };

      if (isDebugEnabled()) {
        console.error("[intake-analysis] provider failed without fallback", audit);
      }

      throw new Error("Intake analysis failed without safe fallback");
    }
  }
}

export async function runIntakeAnalysisWithProvider(
  lead: AnalysisLeadInput,
  configuredProviderName?: string,
): Promise<IntakeAnalysisResult> {
  const { result } = await runIntakeAnalysisWithAudit(lead, configuredProviderName);
  return result;
}
