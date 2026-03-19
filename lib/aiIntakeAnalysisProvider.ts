import {
  resolveIntakeAnalysisGovernanceConfig,
  type IntakeAnalysisGovernanceConfig,
  type IntakeAnalysisProviderName,
} from "./aiIntakeAnalysisGovernanceConfig";
import { OpenAiIntakeError, runOpenAiIntakeAnalysis } from "./aiIntakeAnalysisOpenAI";
import {
  type AnalysisLeadInput,
  type IntakeAnalysisResult,
  buildRuleBasedIntakeAnalysis,
} from "./aiIntakeAnalysisRules";

export type { IntakeAnalysisProviderName } from "./aiIntakeAnalysisGovernanceConfig";

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
  | "circuit_open"
  | "unknown";

export type IntakeAnalysisCircuitState = "closed" | "open" | "half_open";

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
  retry_used: boolean;
  retry_count: number;
  circuit_breaker_state: IntakeAnalysisCircuitState;
  circuit_breaker_triggered: boolean;
  skipped_provider_reason: "none" | "circuit_open";
  effective_governance_config: Pick<
    IntakeAnalysisGovernanceConfig,
    "default_provider" | "debug_enabled" | "openai_max_retries" | "openai_failure_threshold" | "openai_cool_down_ms"
  >;
  config_adjustments: string[];
  config_warnings: string[];
};

export type IntakeAnalysisWithAudit = {
  result: IntakeAnalysisResult;
  audit: IntakeAnalysisAudit;
};

type ProviderCircuitState = {
  state: IntakeAnalysisCircuitState;
  consecutive_failures: number;
  opened_at: number | null;
  last_failure_category: IntakeAnalysisErrorCategory | null;
};

const providerRuntimeState: Record<IntakeAnalysisProviderName, ProviderCircuitState> = {
  rules: { state: "closed", consecutive_failures: 0, opened_at: null, last_failure_category: null },
  mock_ai: { state: "closed", consecutive_failures: 0, opened_at: null, last_failure_category: null },
  openai: { state: "closed", consecutive_failures: 0, opened_at: null, last_failure_category: null },
};

export function __resetProviderRuntimeGovernanceForTests() {
  providerRuntimeState.openai = {
    state: "closed",
    consecutive_failures: 0,
    opened_at: null,
    last_failure_category: null,
  };
}

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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function getCircuitState(
  providerName: IntakeAnalysisProviderName,
  config: IntakeAnalysisGovernanceConfig,
): IntakeAnalysisCircuitState {
  const state = providerRuntimeState[providerName];

  if (providerName !== "openai") {
    return "closed";
  }

  if (state.state !== "open") {
    return state.state;
  }

  if (!state.opened_at) {
    return state.state;
  }

  const elapsed = nowMs() - state.opened_at;
  if (elapsed >= config.openai_cool_down_ms) {
    state.state = "half_open";
    return "half_open";
  }

  return "open";
}

function recordCircuitFailure(
  providerName: IntakeAnalysisProviderName,
  category: IntakeAnalysisErrorCategory,
  config: IntakeAnalysisGovernanceConfig,
) {
  if (providerName !== "openai") {
    return;
  }

  const circuit = providerRuntimeState.openai;

  if (category === "missing_config" || category === "invalid_provider") {
    return;
  }

  circuit.consecutive_failures += 1;
  circuit.last_failure_category = category;

  if (circuit.consecutive_failures >= config.openai_failure_threshold) {
    circuit.state = "open";
    circuit.opened_at = nowMs();
  }
}

function recordCircuitSuccess(providerName: IntakeAnalysisProviderName) {
  if (providerName !== "openai") {
    return;
  }

  providerRuntimeState.openai = {
    state: "closed",
    consecutive_failures: 0,
    opened_at: null,
    last_failure_category: null,
  };
}

function shouldRetry(category: IntakeAnalysisErrorCategory, providerName: IntakeAnalysisProviderName) {
  if (providerName !== "openai") {
    return false;
  }

  return category === "provider_execution_error" || category === "unknown";
}

function selectProviderName(configuredProviderName?: string): {
  requestedProvider: string;
  resolvedProvider: IntakeAnalysisProviderName;
  governance: ReturnType<typeof resolveIntakeAnalysisGovernanceConfig>;
} {
  const governance = resolveIntakeAnalysisGovernanceConfig(configuredProviderName);
  return {
    requestedProvider: governance.requested_provider,
    resolvedProvider: governance.resolved_provider,
    governance,
  };
}

export function resolveIntakeAnalysisProviderName(configuredProviderName?: string): IntakeAnalysisProviderName {
  return selectProviderName(configuredProviderName).resolvedProvider;
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
  const { requestedProvider, resolvedProvider, governance } = selectProviderName(configuredProviderName);
  const effectiveConfig = governance.effective_config;
  const attempts: IntakeAnalysisAttempt[] = [];

  const debugEnabled = effectiveConfig.debug_enabled;
  const providerExists = !!providers[resolvedProvider];

  const buildAudit = (
    result: IntakeAnalysisResult,
    params: {
      finalProvider: IntakeAnalysisProviderName;
      status: IntakeAnalysisRunStatus;
      fallbackUsed: boolean;
      fallbackReason: IntakeAnalysisFallbackReason;
      errorCategory: IntakeAnalysisErrorCategory | null;
      retryCount: number;
      circuitTriggered: boolean;
      skippedProviderReason: "none" | "circuit_open";
    },
  ): IntakeAnalysisAudit => ({
    requested_provider: requestedProvider,
    resolved_provider: resolvedProvider,
    final_provider: params.finalProvider,
    status: params.status,
    fallback_used: params.fallbackUsed,
    fallback_reason: params.fallbackReason,
    duration_ms: nowMs() - start,
    error_category: params.errorCategory,
    analysis_version: result.analysis_version,
    timestamp,
    provider_attempts: attempts,
    retry_used: params.retryCount > 0,
    retry_count: params.retryCount,
    circuit_breaker_state: getCircuitState("openai", effectiveConfig),
    circuit_breaker_triggered: params.circuitTriggered,
    skipped_provider_reason: params.skippedProviderReason,
    effective_governance_config: {
      default_provider: effectiveConfig.default_provider,
      debug_enabled: effectiveConfig.debug_enabled,
      openai_max_retries: effectiveConfig.openai_max_retries,
      openai_failure_threshold: effectiveConfig.openai_failure_threshold,
      openai_cool_down_ms: effectiveConfig.openai_cool_down_ms,
    },
    config_adjustments: governance.config_adjustments,
    config_warnings: governance.config_warnings,
  });

  if (!providerExists) {
    const fallbackStart = nowMs();
    const fallbackResult = await rulesProvider.analyze(lead);
    attempts.push({ provider: "rules", status: "success", duration_ms: nowMs() - fallbackStart, error_category: null });

    return {
      result: fallbackResult,
      audit: buildAudit(fallbackResult, {
        finalProvider: "rules",
        status: "fallback_success",
        fallbackUsed: true,
        fallbackReason: "provider_not_implemented",
        errorCategory: "provider_not_implemented",
        retryCount: 0,
        circuitTriggered: false,
        skippedProviderReason: "none",
      }),
    };
  }

  const provider = providers[resolvedProvider] as IntakeAnalysisProvider;

  if (resolvedProvider === "openai" && getCircuitState("openai", effectiveConfig) === "open") {
    const fallbackStart = nowMs();
    const fallbackResult = await rulesProvider.analyze(lead);
    attempts.push({ provider: "rules", status: "success", duration_ms: nowMs() - fallbackStart, error_category: null });

    const audit = buildAudit(fallbackResult, {
      finalProvider: "rules",
      status: "fallback_success",
      fallbackUsed: true,
      fallbackReason: "circuit_open",
      errorCategory: "provider_execution_error",
      retryCount: 0,
      circuitTriggered: true,
      skippedProviderReason: "circuit_open",
    });

    if (debugEnabled) {
      console.warn("[intake-analysis] circuit open, skipping provider", audit);
    }

    return { result: fallbackResult, audit };
  }

  let retryCount = 0;

  const maxRetries = resolvedProvider === "openai" ? effectiveConfig.openai_max_retries : 0;

  for (let attemptIndex = 0; attemptIndex <= maxRetries; attemptIndex += 1) {
    const attemptStart = nowMs();

    try {
      const result = await provider.analyze(lead);
      attempts.push({
        provider: provider.name,
        status: "success",
        duration_ms: nowMs() - attemptStart,
        error_category: null,
      });

      recordCircuitSuccess(provider.name);

      const invalidRequestedProvider = requestedProvider !== resolvedProvider;
      const audit = buildAudit(result, {
        finalProvider: provider.name,
        status: invalidRequestedProvider ? "fallback_success" : "success",
        fallbackUsed: invalidRequestedProvider,
        fallbackReason: invalidRequestedProvider ? "invalid_provider" : "none",
        errorCategory: invalidRequestedProvider ? "invalid_provider" : null,
        retryCount,
        circuitTriggered: false,
        skippedProviderReason: "none",
      });

      if (debugEnabled && (invalidRequestedProvider || retryCount > 0 || getCircuitState("openai", effectiveConfig) === "half_open")) {
        console.warn("[intake-analysis] provider execution summary", audit);
      }

      return { result, audit };
    } catch (error: unknown) {
      const category = classifyError(error);
      attempts.push({
        provider: provider.name,
        status: "failed",
        duration_ms: nowMs() - attemptStart,
        error_category: category,
      });

      const canRetry = shouldRetry(category, provider.name) && attemptIndex < maxRetries;
      if (canRetry) {
        retryCount += 1;

        if (effectiveConfig.openai_retry_delay_ms > 0) {
          await sleep(effectiveConfig.openai_retry_delay_ms);
        }

        continue;
      }

      recordCircuitFailure(provider.name, category, effectiveConfig);

      const fallbackStart = nowMs();
      const fallbackResult = await rulesProvider.analyze(lead);
      attempts.push({ provider: "rules", status: "success", duration_ms: nowMs() - fallbackStart, error_category: null });

      const audit = buildAudit(fallbackResult, {
        finalProvider: "rules",
        status: "fallback_success",
        fallbackUsed: true,
        fallbackReason: categoryToFallbackReason(category),
        errorCategory: category,
        retryCount,
        circuitTriggered: getCircuitState("openai", effectiveConfig) === "open",
        skippedProviderReason: "none",
      });

      if (debugEnabled) {
        console.warn("[intake-analysis] provider fallback triggered", audit);
      }

      return { result: fallbackResult, audit };
    }
  }

  const fallbackResult = await rulesProvider.analyze(lead);
  const audit = buildAudit(fallbackResult, {
    finalProvider: "rules",
    status: "fallback_success",
    fallbackUsed: true,
    fallbackReason: "unknown",
    errorCategory: "unknown",
    retryCount,
    circuitTriggered: false,
    skippedProviderReason: "none",
  });

  return { result: fallbackResult, audit };
}

export async function runIntakeAnalysisWithProvider(
  lead: AnalysisLeadInput,
  configuredProviderName?: string,
): Promise<IntakeAnalysisResult> {
  const { result } = await runIntakeAnalysisWithAudit(lead, configuredProviderName);
  return result;
}
