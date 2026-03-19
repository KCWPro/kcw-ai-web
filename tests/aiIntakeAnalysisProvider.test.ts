import assert from "node:assert/strict";
import { buildIntakeAnalysis } from "../lib/aiIntakeAnalysis";
import { __setOpenAiIntakeRunnerForTests } from "../lib/aiIntakeAnalysisOpenAI";
import {
  __resetProviderRuntimeGovernanceForTests,
  getIntakeAnalysisProvider,
  resolveIntakeAnalysisProviderName,
  runIntakeAnalysisWithAudit,
  runIntakeAnalysisWithProvider,
} from "../lib/aiIntakeAnalysisProvider";

const sampleLead = {
  service_type: "Water heater replacement",
  urgency: "medium",
  customer_notes: "Water heater leaking and unstable temperature since yesterday, needs replacement.",
  problem_duration: "1 day",
  property_type: "single_family",
  phone: "9165550101",
  city: "Sacramento",
};

const snapshotEnv = {
  INTAKE_ANALYSIS_PROVIDER: process.env.INTAKE_ANALYSIS_PROVIDER,
  INTAKE_ANALYSIS_POLICY: process.env.INTAKE_ANALYSIS_POLICY,
  INTAKE_ANALYSIS_DEBUG: process.env.INTAKE_ANALYSIS_DEBUG,
  INTAKE_ANALYSIS_OPENAI_MAX_RETRIES: process.env.INTAKE_ANALYSIS_OPENAI_MAX_RETRIES,
  INTAKE_ANALYSIS_OPENAI_FAILURE_THRESHOLD: process.env.INTAKE_ANALYSIS_OPENAI_FAILURE_THRESHOLD,
  INTAKE_ANALYSIS_OPENAI_COOLDOWN_MS: process.env.INTAKE_ANALYSIS_OPENAI_COOLDOWN_MS,
  INTAKE_ANALYSIS_OPENAI_RETRY_DELAY_MS: process.env.INTAKE_ANALYSIS_OPENAI_RETRY_DELAY_MS,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
};

function setEnv(name: keyof typeof snapshotEnv, value?: string) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

function validOpenAiPayload() {
  return {
    issue_classification: "water_heater",
    info_completeness: "sufficient",
    missing_fields: [],
    recommended_action: "Route to ops and confirm installation constraints.",
    suggested_price_range: {
      band: "likely_medium_job",
      min: 300,
      max: 1800,
      notes: "Internal placeholder only",
    },
    next_step: "Create callback task and verify access window.",
    confidence: 0.82,
  };
}

async function run() {
  __resetProviderRuntimeGovernanceForTests();

  // A. 未配置 policy => default standard 生效。
  setEnv("INTAKE_ANALYSIS_PROVIDER", undefined);
  setEnv("INTAKE_ANALYSIS_POLICY", undefined);
  setEnv("INTAKE_ANALYSIS_DEBUG", undefined);
  setEnv("INTAKE_ANALYSIS_OPENAI_MAX_RETRIES", undefined);
  setEnv("INTAKE_ANALYSIS_OPENAI_FAILURE_THRESHOLD", undefined);
  setEnv("INTAKE_ANALYSIS_OPENAI_COOLDOWN_MS", undefined);
  setEnv("INTAKE_ANALYSIS_OPENAI_RETRY_DELAY_MS", undefined);

  const defaultResult = await buildIntakeAnalysis(sampleLead);
  assert.match(defaultResult.analysis_version, /^phase2-step3-rules$/);

  const defaultAudit = await runIntakeAnalysisWithAudit(sampleLead, "rules");
  assert.equal(defaultAudit.audit.resolved_policy, "standard");
  assert.equal(defaultAudit.audit.policy_version, "v1");
  assert.equal(defaultAudit.audit.effective_governance_config.openai_max_retries, 1);

  // B. conservative policy 有实际差异。
  setEnv("INTAKE_ANALYSIS_POLICY", "conservative");
  const conservativeAudit = await runIntakeAnalysisWithAudit(sampleLead, "rules");
  assert.equal(conservativeAudit.audit.resolved_policy, "conservative");
  assert.equal(conservativeAudit.audit.policy_defaults_applied.openai_max_retries, 0);
  assert.equal(conservativeAudit.audit.policy_defaults_applied.openai_failure_threshold, 1);

  // C. 非法 policy 回退默认。
  setEnv("INTAKE_ANALYSIS_POLICY", "bad_policy");
  const invalidPolicyAudit = await runIntakeAnalysisWithAudit(sampleLead, "rules");
  assert.equal(invalidPolicyAudit.audit.resolved_policy, "standard");
  assert.ok(invalidPolicyAudit.audit.policy_adjustments.length > 0);

  // D. policy + env 覆盖 + clamp。
  setEnv("INTAKE_ANALYSIS_POLICY", "conservative");
  setEnv("INTAKE_ANALYSIS_OPENAI_MAX_RETRIES", "99");
  setEnv("INTAKE_ANALYSIS_OPENAI_COOLDOWN_MS", "-3");
  setEnv("INTAKE_ANALYSIS_OPENAI_FAILURE_THRESHOLD", "0");
  const policyOverrideAudit = await runIntakeAnalysisWithAudit(sampleLead, "rules");
  assert.equal(policyOverrideAudit.audit.resolved_policy, "conservative");
  assert.equal(policyOverrideAudit.audit.effective_governance_config.openai_max_retries, 2);
  assert.equal(policyOverrideAudit.audit.effective_governance_config.openai_failure_threshold, 1);
  assert.equal(policyOverrideAudit.audit.effective_governance_config.openai_cool_down_ms, 0);
  assert.ok(policyOverrideAudit.audit.config_adjustments.length > 0);

  // Step 3/4/5 compatibility checks.
  const unresolvedName = resolveIntakeAnalysisProviderName("unknown_name");
  assert.equal(unresolvedName, "rules");
  const mockProvider = getIntakeAnalysisProvider("mock_ai");
  assert.equal(mockProvider.name, "mock_ai");
  const mockResult = await runIntakeAnalysisWithProvider(sampleLead, "mock_ai");
  assert.match(mockResult.analysis_version, /^phase2-step3-mock-ai-placeholder$/);

  setEnv("INTAKE_ANALYSIS_PROVIDER", "openai");
  setEnv("OPENAI_API_KEY", "test-key");
  setEnv("OPENAI_MODEL", "gpt-4o-mini");

  // E. standard策略兼容主路径：retry success。
  __resetProviderRuntimeGovernanceForTests();
  setEnv("INTAKE_ANALYSIS_POLICY", "standard");
  setEnv("INTAKE_ANALYSIS_OPENAI_MAX_RETRIES", "1");
  setEnv("INTAKE_ANALYSIS_OPENAI_FAILURE_THRESHOLD", "2");
  setEnv("INTAKE_ANALYSIS_OPENAI_COOLDOWN_MS", "80");
  setEnv("INTAKE_ANALYSIS_OPENAI_RETRY_DELAY_MS", "0");

  let attempt = 0;
  __setOpenAiIntakeRunnerForTests(async () => {
    attempt += 1;
    if (attempt === 1) throw new Error("transient failure");
    return validOpenAiPayload();
  });

  const standardRetryAudit = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(standardRetryAudit.audit.resolved_policy, "standard");
  assert.equal(standardRetryAudit.audit.final_provider, "openai");
  assert.equal(standardRetryAudit.audit.retry_count, 1);

  // F. conservative 更保守（更少重试/更快 fallback）。
  __resetProviderRuntimeGovernanceForTests();
  setEnv("INTAKE_ANALYSIS_POLICY", "conservative");
  setEnv("INTAKE_ANALYSIS_OPENAI_MAX_RETRIES", undefined); // 使用 conservative 默认 0
  setEnv("INTAKE_ANALYSIS_OPENAI_FAILURE_THRESHOLD", undefined); // 使用 conservative 默认 1

  __setOpenAiIntakeRunnerForTests(async () => {
    throw new Error("persistent failure");
  });

  const conservativeFailureAudit = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(conservativeFailureAudit.audit.resolved_policy, "conservative");
  assert.equal(conservativeFailureAudit.audit.retry_count, 0);
  assert.equal(conservativeFailureAudit.audit.circuit_breaker_state, "open");

  const conservativeCircuitSkipAudit = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(conservativeCircuitSkipAudit.audit.skipped_provider_reason, "circuit_open");

  // G. 显式参数优先级（provider 参数优先于环境 provider）。
  const explicitProviderAudit = await runIntakeAnalysisWithAudit(sampleLead, "rules", "conservative");
  assert.equal(explicitProviderAudit.audit.resolved_provider, "rules");
  assert.equal(explicitProviderAudit.audit.resolved_policy, "conservative");

  __setOpenAiIntakeRunnerForTests(undefined);
  __resetProviderRuntimeGovernanceForTests();
  console.log("aiIntakeAnalysis provider tests passed");
}

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    __setOpenAiIntakeRunnerForTests(undefined);
    __resetProviderRuntimeGovernanceForTests();

    for (const key of Object.keys(snapshotEnv) as Array<keyof typeof snapshotEnv>) {
      const original = snapshotEnv[key];
      if (original === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = original;
      }
    }
  });
