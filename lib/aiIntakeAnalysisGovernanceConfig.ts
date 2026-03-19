export type IntakeAnalysisProviderName = "rules" | "mock_ai" | "openai";
export type IntakeAnalysisPolicyName = "standard" | "conservative";

export type IntakeAnalysisGovernanceConfig = {
  default_provider: IntakeAnalysisProviderName;
  debug_enabled: boolean;
  openai_max_retries: number;
  openai_failure_threshold: number;
  openai_cool_down_ms: number;
  openai_retry_delay_ms: number;
};

export type IntakeAnalysisGovernancePolicy = {
  policy_name: IntakeAnalysisPolicyName;
  policy_version: "v1";
  policy_defaults: IntakeAnalysisGovernanceConfig;
};

export type IntakeAnalysisGovernanceResolution = {
  effective_config: IntakeAnalysisGovernanceConfig;
  requested_provider: string;
  resolved_provider: IntakeAnalysisProviderName;
  requested_policy: string;
  resolved_policy: IntakeAnalysisPolicyName;
  policy_version: string;
  policy_defaults_applied: IntakeAnalysisGovernanceConfig;
  policy_adjustments: string[];
  config_adjustments: string[];
  config_warnings: string[];
};

const POLICIES: Record<IntakeAnalysisPolicyName, IntakeAnalysisGovernancePolicy> = {
  standard: {
    policy_name: "standard",
    policy_version: "v1",
    policy_defaults: {
      default_provider: "rules",
      debug_enabled: false,
      openai_max_retries: 1,
      openai_failure_threshold: 2,
      openai_cool_down_ms: 30_000,
      openai_retry_delay_ms: 20,
    },
  },
  conservative: {
    policy_name: "conservative",
    policy_version: "v1",
    policy_defaults: {
      default_provider: "rules",
      debug_enabled: false,
      openai_max_retries: 0,
      openai_failure_threshold: 1,
      openai_cool_down_ms: 45_000,
      openai_retry_delay_ms: 0,
    },
  },
};

const DEFAULT_POLICY: IntakeAnalysisPolicyName = "standard";

export function getIntakeAnalysisGovernancePolicy(policyName: IntakeAnalysisPolicyName) {
  return POLICIES[policyName];
}

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

function normalizeProvider(raw: string | undefined, fallback: IntakeAnalysisProviderName, warnings: string[], key: string): IntakeAnalysisProviderName {
  const value = (raw || "").trim().toLowerCase();
  if (!value) return fallback;

  if (value === "rules" || value === "mock_ai" || value === "openai") return value;

  warnings.push(`${key} invalid (${value}); fallback to ${fallback}`);
  return fallback;
}

function normalizePolicy(raw: string | undefined, fallback: IntakeAnalysisPolicyName, policyAdjustments: string[]): IntakeAnalysisPolicyName {
  const value = (raw || "").trim().toLowerCase();
  if (!value) return fallback;

  if (value === "standard" || value === "conservative") return value;

  policyAdjustments.push(`INTAKE_ANALYSIS_POLICY fallback ${value} -> ${fallback}`);
  return fallback;
}

export function resolveIntakeAnalysisGovernanceConfig(
  configuredProviderName?: string,
  configuredPolicyName?: string,
): IntakeAnalysisGovernanceResolution {
  const adjustments: string[] = [];
  const warnings: string[] = [];
  const policyAdjustments: string[] = [];

  const requestedPolicy = (configuredPolicyName || process.env.INTAKE_ANALYSIS_POLICY || DEFAULT_POLICY).trim().toLowerCase() || DEFAULT_POLICY;
  const resolvedPolicy = normalizePolicy(configuredPolicyName || process.env.INTAKE_ANALYSIS_POLICY, DEFAULT_POLICY, policyAdjustments);
  const policy = getIntakeAnalysisGovernancePolicy(resolvedPolicy);

  const policyDefaults = { ...policy.policy_defaults };

  const envProvider = normalizeProvider(
    process.env.INTAKE_ANALYSIS_PROVIDER,
    policyDefaults.default_provider,
    warnings,
    "INTAKE_ANALYSIS_PROVIDER",
  );

  const requestedProvider = (configuredProviderName || process.env.INTAKE_ANALYSIS_PROVIDER || envProvider).trim().toLowerCase() || envProvider;
  const resolvedProvider = normalizeProvider(configuredProviderName, envProvider, warnings, "configured_provider_name");

  const parsedDebug = parseBoolean(process.env.INTAKE_ANALYSIS_DEBUG);
  const debugEnabled = parsedDebug === null ? policyDefaults.debug_enabled : parsedDebug;

  if (parsedDebug === null && process.env.INTAKE_ANALYSIS_DEBUG !== undefined) {
    warnings.push(`INTAKE_ANALYSIS_DEBUG invalid; fallback to ${policyDefaults.debug_enabled}`);
  }

  const effectiveConfig: IntakeAnalysisGovernanceConfig = {
    default_provider: envProvider,
    debug_enabled: debugEnabled,
    openai_max_retries: clampInt(process.env.INTAKE_ANALYSIS_OPENAI_MAX_RETRIES, {
      key: "INTAKE_ANALYSIS_OPENAI_MAX_RETRIES",
      fallback: policyDefaults.openai_max_retries,
      min: 0,
      max: 2,
      adjustments,
      warnings,
    }),
    openai_failure_threshold: clampInt(process.env.INTAKE_ANALYSIS_OPENAI_FAILURE_THRESHOLD, {
      key: "INTAKE_ANALYSIS_OPENAI_FAILURE_THRESHOLD",
      fallback: policyDefaults.openai_failure_threshold,
      min: 1,
      max: 5,
      adjustments,
      warnings,
    }),
    openai_cool_down_ms: clampInt(process.env.INTAKE_ANALYSIS_OPENAI_COOLDOWN_MS, {
      key: "INTAKE_ANALYSIS_OPENAI_COOLDOWN_MS",
      fallback: policyDefaults.openai_cool_down_ms,
      min: 0,
      max: 120_000,
      adjustments,
      warnings,
    }),
    openai_retry_delay_ms: clampInt(process.env.INTAKE_ANALYSIS_OPENAI_RETRY_DELAY_MS, {
      key: "INTAKE_ANALYSIS_OPENAI_RETRY_DELAY_MS",
      fallback: policyDefaults.openai_retry_delay_ms,
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
    requested_policy: requestedPolicy,
    resolved_policy: resolvedPolicy,
    policy_version: policy.policy_version,
    policy_defaults_applied: policyDefaults,
    policy_adjustments: policyAdjustments,
    config_adjustments: adjustments,
    config_warnings: warnings,
  };
}
