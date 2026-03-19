export type IntakeAnalysisProviderName = "rules" | "mock_ai" | "openai";

export type IntakeAnalysisGovernanceConfig = {
  default_provider: IntakeAnalysisProviderName;
  debug_enabled: boolean;
  openai_max_retries: number;
  openai_failure_threshold: number;
  openai_cool_down_ms: number;
  openai_retry_delay_ms: number;
};

export type IntakeAnalysisGovernanceResolution = {
  effective_config: IntakeAnalysisGovernanceConfig;
  requested_provider: string;
  resolved_provider: IntakeAnalysisProviderName;
  config_adjustments: string[];
  config_warnings: string[];
};

const DEFAULT_CONFIG: IntakeAnalysisGovernanceConfig = {
  default_provider: "rules",
  debug_enabled: false,
  openai_max_retries: 1,
  openai_failure_threshold: 2,
  openai_cool_down_ms: 30_000,
  openai_retry_delay_ms: 20,
};

function parseBoolean(raw: string | undefined): boolean | null {
  if (raw === undefined) return null;
  const value = raw.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(value)) return true;
  if (["0", "false", "no", "off"].includes(value)) return false;
  return null;
}

function clampInt(
  raw: string | undefined,
  params: { key: string; fallback: number; min: number; max: number; adjustments: string[]; warnings: string[] },
): number {
  if (raw === undefined || raw.trim() === "") return params.fallback;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    params.warnings.push(`${params.key} invalid; fallback to ${params.fallback}`);
    return params.fallback;
  }

  const rounded = Math.trunc(parsed);
  if (rounded < params.min) {
    params.adjustments.push(`${params.key} clamped ${rounded} -> ${params.min}`);
    return params.min;
  }

  if (rounded > params.max) {
    params.adjustments.push(`${params.key} clamped ${rounded} -> ${params.max}`);
    return params.max;
  }

  return rounded;
}

function normalizeProvider(raw: string | undefined, fallback: IntakeAnalysisProviderName, warnings: string[]): IntakeAnalysisProviderName {
  const value = (raw || "").trim().toLowerCase();
  if (!value) return fallback;

  if (value === "rules" || value === "mock_ai" || value === "openai") return value;

  warnings.push(`INTAKE_ANALYSIS_PROVIDER invalid (${value}); fallback to ${fallback}`);
  return fallback;
}

export function resolveIntakeAnalysisGovernanceConfig(configuredProviderName?: string): IntakeAnalysisGovernanceResolution {
  const adjustments: string[] = [];
  const warnings: string[] = [];

  const defaultProvider = normalizeProvider(process.env.INTAKE_ANALYSIS_PROVIDER, DEFAULT_CONFIG.default_provider, warnings);
  const requestedProvider = (configuredProviderName || process.env.INTAKE_ANALYSIS_PROVIDER || defaultProvider).trim().toLowerCase() || defaultProvider;
  const resolvedProvider = normalizeProvider(configuredProviderName, defaultProvider, warnings);

  const parsedDebug = parseBoolean(process.env.INTAKE_ANALYSIS_DEBUG);
  const debugEnabled = parsedDebug === null ? DEFAULT_CONFIG.debug_enabled : parsedDebug;

  if (parsedDebug === null && process.env.INTAKE_ANALYSIS_DEBUG !== undefined) {
    warnings.push(`INTAKE_ANALYSIS_DEBUG invalid; fallback to ${DEFAULT_CONFIG.debug_enabled}`);
  }

  const effectiveConfig: IntakeAnalysisGovernanceConfig = {
    default_provider: defaultProvider,
    debug_enabled: debugEnabled,
    openai_max_retries: clampInt(process.env.INTAKE_ANALYSIS_OPENAI_MAX_RETRIES, {
      key: "INTAKE_ANALYSIS_OPENAI_MAX_RETRIES",
      fallback: DEFAULT_CONFIG.openai_max_retries,
      min: 0,
      max: 2,
      adjustments,
      warnings,
    }),
    openai_failure_threshold: clampInt(process.env.INTAKE_ANALYSIS_OPENAI_FAILURE_THRESHOLD, {
      key: "INTAKE_ANALYSIS_OPENAI_FAILURE_THRESHOLD",
      fallback: DEFAULT_CONFIG.openai_failure_threshold,
      min: 1,
      max: 5,
      adjustments,
      warnings,
    }),
    openai_cool_down_ms: clampInt(process.env.INTAKE_ANALYSIS_OPENAI_COOLDOWN_MS, {
      key: "INTAKE_ANALYSIS_OPENAI_COOLDOWN_MS",
      fallback: DEFAULT_CONFIG.openai_cool_down_ms,
      min: 0,
      max: 120_000,
      adjustments,
      warnings,
    }),
    openai_retry_delay_ms: clampInt(process.env.INTAKE_ANALYSIS_OPENAI_RETRY_DELAY_MS, {
      key: "INTAKE_ANALYSIS_OPENAI_RETRY_DELAY_MS",
      fallback: DEFAULT_CONFIG.openai_retry_delay_ms,
      min: 0,
      max: 1_000,
      adjustments,
      warnings,
    }),
  };

  return {
    effective_config: effectiveConfig,
    requested_provider: requestedProvider,
    resolved_provider: resolvedProvider,
    config_adjustments: adjustments,
    config_warnings: warnings,
  };
}
