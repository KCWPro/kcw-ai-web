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
  INTAKE_ANALYSIS_ENABLED_POLICIES: process.env.INTAKE_ANALYSIS_ENABLED_POLICIES,
  INTAKE_ANALYSIS_FORCE_POLICY: process.env.INTAKE_ANALYSIS_FORCE_POLICY,
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

  // A. 未配置 enabled_policies：默认安全策略可用。
  setEnv("INTAKE_ANALYSIS_PROVIDER", undefined);
  setEnv("INTAKE_ANALYSIS_POLICY", undefined);
  setEnv("INTAKE_ANALYSIS_ENABLED_POLICIES", undefined);
  setEnv("INTAKE_ANALYSIS_FORCE_POLICY", undefined);
  setEnv("INTAKE_ANALYSIS_OPENAI_MAX_RETRIES", undefined);
  setEnv("INTAKE_ANALYSIS_OPENAI_FAILURE_THRESHOLD", undefined);
  setEnv("INTAKE_ANALYSIS_OPENAI_COOLDOWN_MS", undefined);
  setEnv("INTAKE_ANALYSIS_OPENAI_RETRY_DELAY_MS", undefined);

  const defaultResult = await buildIntakeAnalysis(sampleLead);
  assert.match(defaultResult.analysis_version, /^phase2-step3-rules$/);

  const defaultAudit = await runIntakeAnalysisWithAudit(sampleLead, "rules");
  assert.equal(defaultAudit.audit.final_policy, "standard");
  assert.equal(defaultAudit.audit.rollout_blocked, false);

  // B. requested policy 被允许。
  setEnv("INTAKE_ANALYSIS_POLICY", "conservative");
  setEnv("INTAKE_ANALYSIS_ENABLED_POLICIES", "standard,conservative");
  const conservativeAllowed = await runIntakeAnalysisWithAudit(sampleLead, "rules");
  assert.equal(conservativeAllowed.audit.requested_policy, "conservative");
  assert.equal(conservativeAllowed.audit.final_policy, "conservative");
  assert.equal(conservativeAllowed.audit.rollout_blocked, false);

  // C. requested policy 未被允许 => rollout block。
  setEnv("INTAKE_ANALYSIS_ENABLED_POLICIES", "standard");
  const conservativeBlocked = await runIntakeAnalysisWithAudit(sampleLead, "rules");
  assert.equal(conservativeBlocked.audit.requested_policy, "conservative");
  assert.equal(conservativeBlocked.audit.final_policy, "standard");
  assert.equal(conservativeBlocked.audit.rollout_blocked, true);
  assert.equal(conservativeBlocked.audit.rollout_reason, "policy_not_enabled");

  // D. 非法 enabled_policies 配置 => fallback 安全默认。
  setEnv("INTAKE_ANALYSIS_ENABLED_POLICIES", "bad1,bad2");
  const invalidEnabled = await runIntakeAnalysisWithAudit(sampleLead, "rules");
  assert.equal(invalidEnabled.audit.final_policy, "standard");
  assert.ok(invalidEnabled.audit.config_warnings.some((w) => w.includes("ENABLED_POLICIES")));

  // E. rollback force policy 生效（优先于 rollout）。
  setEnv("INTAKE_ANALYSIS_POLICY", "conservative");
  setEnv("INTAKE_ANALYSIS_ENABLED_POLICIES", "standard,conservative");
  setEnv("INTAKE_ANALYSIS_FORCE_POLICY", "standard");
  const rollbackApplied = await runIntakeAnalysisWithAudit(sampleLead, "rules");
  assert.equal(rollbackApplied.audit.rollback_switch_applied, true);
  assert.equal(rollbackApplied.audit.rollback_target_policy, "standard");
  assert.equal(rollbackApplied.audit.final_policy, "standard");

  // F. rollback 配置非法 => 回退安全默认并可解释。
  setEnv("INTAKE_ANALYSIS_FORCE_POLICY", "invalid_force");
  const rollbackInvalid = await runIntakeAnalysisWithAudit(sampleLead, "rules");
  assert.equal(rollbackInvalid.audit.rollback_switch_applied, true);
  assert.equal(rollbackInvalid.audit.rollback_target_policy, "standard");
  assert.ok(rollbackInvalid.audit.policy_adjustments.length > 0);

  // G. Step 8 主路径兼容：standard 与 conservative 行为差异仍可观察。
  setEnv("INTAKE_ANALYSIS_PROVIDER", "openai");
  setEnv("OPENAI_API_KEY", "test-key");
  setEnv("OPENAI_MODEL", "gpt-4o-mini");
  setEnv("INTAKE_ANALYSIS_FORCE_POLICY", undefined);
  setEnv("INTAKE_ANALYSIS_ENABLED_POLICIES", "standard,conservative");

  // standard with retry=1
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
  assert.equal(standardRetryAudit.audit.final_policy, "standard");
  assert.equal(standardRetryAudit.audit.retry_count, 1);

  // conservative defaults to fewer retries and faster open
  __resetProviderRuntimeGovernanceForTests();
  setEnv("INTAKE_ANALYSIS_POLICY", "conservative");
  setEnv("INTAKE_ANALYSIS_OPENAI_MAX_RETRIES", undefined);
  setEnv("INTAKE_ANALYSIS_OPENAI_FAILURE_THRESHOLD", undefined);
  __setOpenAiIntakeRunnerForTests(async () => {
    throw new Error("persistent failure");
  });

  const conservativeFailure = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(conservativeFailure.audit.final_policy, "conservative");
  assert.equal(conservativeFailure.audit.retry_count, 0);
  assert.equal(conservativeFailure.audit.circuit_breaker_state, "open");

  // Compatibility checks from earlier steps
  const unresolvedName = resolveIntakeAnalysisProviderName("unknown_name");
  assert.equal(unresolvedName, "openai");
  const mockProvider = getIntakeAnalysisProvider("mock_ai");
  assert.equal(mockProvider.name, "mock_ai");
  const mockResult = await runIntakeAnalysisWithProvider(sampleLead, "mock_ai");
  assert.match(mockResult.analysis_version, /^phase2-step3-mock-ai-placeholder$/);

  const explicitProviderResolved = resolveIntakeAnalysisProviderName("rules", "conservative");
  assert.equal(explicitProviderResolved, "rules");

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
