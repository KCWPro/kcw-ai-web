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

  // A. no env config => safe defaults.
  setEnv("INTAKE_ANALYSIS_PROVIDER", undefined);
  setEnv("INTAKE_ANALYSIS_DEBUG", undefined);
  setEnv("INTAKE_ANALYSIS_OPENAI_MAX_RETRIES", undefined);
  setEnv("INTAKE_ANALYSIS_OPENAI_FAILURE_THRESHOLD", undefined);
  setEnv("INTAKE_ANALYSIS_OPENAI_COOLDOWN_MS", undefined);
  setEnv("INTAKE_ANALYSIS_OPENAI_RETRY_DELAY_MS", undefined);

  const defaultResult = await buildIntakeAnalysis(sampleLead);
  assert.match(defaultResult.analysis_version, /^phase2-step3-rules$/);

  const defaultAudit = await runIntakeAnalysisWithAudit(sampleLead, "rules");
  assert.equal(defaultAudit.audit.effective_governance_config.openai_max_retries, 1);
  assert.equal(defaultAudit.audit.effective_governance_config.openai_failure_threshold, 2);
  assert.equal(defaultAudit.audit.effective_governance_config.openai_cool_down_ms, 30000);

  // B. invalid provider env => fallback to default provider + warning.
  setEnv("INTAKE_ANALYSIS_PROVIDER", "bad_provider");
  const invalidProviderEnvAudit = await runIntakeAnalysisWithAudit(sampleLead);
  assert.equal(invalidProviderEnvAudit.audit.resolved_provider, "rules");
  assert.ok(invalidProviderEnvAudit.audit.config_warnings.length > 0);

  // Keep Step 3 compatibility checks.
  const unresolvedName = resolveIntakeAnalysisProviderName("unknown_name");
  assert.equal(unresolvedName, "rules");
  const mockProvider = getIntakeAnalysisProvider("mock_ai");
  assert.equal(mockProvider.name, "mock_ai");
  const mockResult = await runIntakeAnalysisWithProvider(sampleLead, "mock_ai");
  assert.match(mockResult.analysis_version, /^phase2-step3-mock-ai-placeholder$/);

  setEnv("INTAKE_ANALYSIS_PROVIDER", "openai");
  setEnv("OPENAI_API_KEY", "test-key");
  setEnv("OPENAI_MODEL", "gpt-4o-mini");

  // C. retries over upper bound => clamp and behavior follows clamp.
  __resetProviderRuntimeGovernanceForTests();
  setEnv("INTAKE_ANALYSIS_OPENAI_MAX_RETRIES", "99");
  setEnv("INTAKE_ANALYSIS_OPENAI_RETRY_DELAY_MS", "0");
  __setOpenAiIntakeRunnerForTests(async () => {
    throw new Error("timeout");
  });

  const retriesClampedAudit = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(retriesClampedAudit.audit.effective_governance_config.openai_max_retries, 2);
  assert.equal(retriesClampedAudit.audit.retry_count, 2);
  assert.equal(retriesClampedAudit.audit.final_provider, "rules");
  assert.ok(retriesClampedAudit.audit.config_adjustments.some((x) => x.includes("MAX_RETRIES")));

  // D. cooldown invalid (<0) => clamp to 0.
  setEnv("INTAKE_ANALYSIS_OPENAI_COOLDOWN_MS", "-5");
  const cooldownClampAudit = await runIntakeAnalysisWithAudit(sampleLead, "rules");
  assert.equal(cooldownClampAudit.audit.effective_governance_config.openai_cool_down_ms, 0);
  assert.ok(cooldownClampAudit.audit.config_adjustments.some((x) => x.includes("COOLDOWN_MS")));

  // E. failure threshold invalid => clamp and still drives circuit decisions.
  __resetProviderRuntimeGovernanceForTests();
  setEnv("INTAKE_ANALYSIS_OPENAI_MAX_RETRIES", "0");
  setEnv("INTAKE_ANALYSIS_OPENAI_FAILURE_THRESHOLD", "0"); // clamp -> 1
  setEnv("INTAKE_ANALYSIS_OPENAI_COOLDOWN_MS", "100");
  __setOpenAiIntakeRunnerForTests(async () => {
    throw new Error("hard failure");
  });

  const thresholdClampFirst = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(thresholdClampFirst.audit.effective_governance_config.openai_failure_threshold, 1);
  assert.equal(thresholdClampFirst.audit.circuit_breaker_state, "open");

  const thresholdClampSecond = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(thresholdClampSecond.audit.skipped_provider_reason, "circuit_open");
  assert.equal(thresholdClampSecond.audit.final_provider, "rules");

  // F. explicit provider parameter has precedence over env provider.
  const explicitProviderAudit = await runIntakeAnalysisWithAudit(sampleLead, "rules");
  assert.equal(explicitProviderAudit.audit.resolved_provider, "rules");

  // G. Step 6 main behavior remains: retry success path works.
  __resetProviderRuntimeGovernanceForTests();
  setEnv("INTAKE_ANALYSIS_OPENAI_MAX_RETRIES", "1");
  setEnv("INTAKE_ANALYSIS_OPENAI_FAILURE_THRESHOLD", "2");
  setEnv("INTAKE_ANALYSIS_OPENAI_COOLDOWN_MS", "80");
  let attempt = 0;
  __setOpenAiIntakeRunnerForTests(async () => {
    attempt += 1;
    if (attempt === 1) throw new Error("transient failure");
    return validOpenAiPayload();
  });

  const retrySuccessAudit = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(retrySuccessAudit.audit.final_provider, "openai");
  assert.equal(retrySuccessAudit.audit.retry_used, true);
  assert.equal(retrySuccessAudit.audit.retry_count, 1);

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
