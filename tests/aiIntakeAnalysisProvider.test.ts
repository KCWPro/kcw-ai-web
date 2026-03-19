import assert from "node:assert/strict";
import { buildIntakeAnalysis } from "../lib/aiIntakeAnalysis";
import { __setOpenAiIntakeRunnerForTests } from "../lib/aiIntakeAnalysisOpenAI";
import {
  __resetProviderRuntimeGovernanceForTests,
  __setProviderRuntimeGovernanceConfigForTests,
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

const previousProviderEnv = process.env.INTAKE_ANALYSIS_PROVIDER;
const previousApiKeyEnv = process.env.OPENAI_API_KEY;
const previousModelEnv = process.env.OPENAI_MODEL;

async function run() {
  __resetProviderRuntimeGovernanceForTests();
  __setProviderRuntimeGovernanceConfigForTests({
    openAiMaxRetries: 1,
    openAiFailureThreshold: 2,
    openAiCooldownMs: 80,
    retryDelayMs: 0,
  });

  process.env.INTAKE_ANALYSIS_PROVIDER = "";
  const defaultResult = await buildIntakeAnalysis(sampleLead);
  assert.match(defaultResult.analysis_version, /^phase2-step3-rules$/);

  const rulesResult = await runIntakeAnalysisWithProvider(sampleLead, "rules");
  assert.match(rulesResult.analysis_version, /^phase2-step3-rules$/);

  const rulesAuditRun = await runIntakeAnalysisWithAudit(sampleLead, "rules");
  assert.equal(rulesAuditRun.audit.status, "success");
  assert.equal(rulesAuditRun.audit.fallback_used, false);
  assert.equal(rulesAuditRun.audit.final_provider, "rules");
  assert.equal(rulesAuditRun.audit.retry_count, 0);
  assert.equal(rulesAuditRun.audit.circuit_breaker_triggered, false);

  const unknownProviderAudit = await runIntakeAnalysisWithAudit(sampleLead, "not_a_provider");
  assert.equal(unknownProviderAudit.audit.final_provider, "rules");
  assert.equal(unknownProviderAudit.audit.fallback_used, true);
  assert.equal(unknownProviderAudit.audit.fallback_reason, "invalid_provider");
  assert.equal(unknownProviderAudit.audit.error_category, "invalid_provider");

  const unresolvedName = resolveIntakeAnalysisProviderName("unknown_name");
  assert.equal(unresolvedName, "rules");

  const mockProvider = getIntakeAnalysisProvider("mock_ai");
  assert.equal(mockProvider.name, "mock_ai");
  const mockResult = await runIntakeAnalysisWithProvider(sampleLead, "mock_ai");
  assert.match(mockResult.analysis_version, /^phase2-step3-mock-ai-placeholder$/);

  delete process.env.OPENAI_API_KEY;
  process.env.OPENAI_MODEL = "gpt-4o-mini";
  const openAiMissingKeyAudit = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(openAiMissingKeyAudit.audit.final_provider, "rules");
  assert.equal(openAiMissingKeyAudit.audit.fallback_reason, "missing_config");

  process.env.OPENAI_API_KEY = "test-key";
  delete process.env.OPENAI_MODEL;
  const openAiMissingModelAudit = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(openAiMissingModelAudit.audit.final_provider, "rules");
  assert.equal(openAiMissingModelAudit.audit.error_category, "missing_config");

  process.env.OPENAI_API_KEY = "test-key";
  process.env.OPENAI_MODEL = "gpt-4o-mini";

  // A. first attempt fails, retry succeeds.
  let retryRunnerCount = 0;
  __setOpenAiIntakeRunnerForTests(async () => {
    retryRunnerCount += 1;
    if (retryRunnerCount === 1) {
      throw new Error("transient openai timeout");
    }

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
  });

  const retrySuccessAudit = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(retrySuccessAudit.audit.final_provider, "openai");
  assert.equal(retrySuccessAudit.audit.status, "success");
  assert.equal(retrySuccessAudit.audit.fallback_used, false);
  assert.equal(retrySuccessAudit.audit.retry_used, true);
  assert.equal(retrySuccessAudit.audit.retry_count, 1);

  // B. openai still fails after max retries -> fallback rules.
  __setOpenAiIntakeRunnerForTests(async () => {
    throw new Error("persistent openai timeout");
  });

  const retryExhaustedAudit = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(retryExhaustedAudit.audit.final_provider, "rules");
  assert.equal(retryExhaustedAudit.audit.fallback_used, true);
  assert.equal(retryExhaustedAudit.audit.retry_count, 1);
  assert.equal(retryExhaustedAudit.audit.error_category, "provider_execution_error");

  // C. trigger circuit open and verify next request skips openai.
  __setProviderRuntimeGovernanceConfigForTests({ openAiMaxRetries: 0, openAiFailureThreshold: 2, openAiCooldownMs: 80, retryDelayMs: 0 });
  __resetProviderRuntimeGovernanceForTests();
  __setProviderRuntimeGovernanceConfigForTests({ openAiMaxRetries: 0, openAiFailureThreshold: 2, openAiCooldownMs: 80, retryDelayMs: 0 });

  __setOpenAiIntakeRunnerForTests(async () => {
    throw new Error("openai hard failure");
  });

  const failureOne = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(failureOne.audit.circuit_breaker_state, "closed");

  const failureTwo = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(failureTwo.audit.circuit_breaker_state, "open");
  assert.equal(failureTwo.audit.circuit_breaker_triggered, true);

  const circuitSkipped = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(circuitSkipped.audit.final_provider, "rules");
  assert.equal(circuitSkipped.audit.fallback_reason, "circuit_open");
  assert.equal(circuitSkipped.audit.skipped_provider_reason, "circuit_open");

  // D. after cooldown, allow probe and recover to closed on success.
  await new Promise((resolve) => setTimeout(resolve, 90));

  __setOpenAiIntakeRunnerForTests(async () => ({
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
  }));

  const recoveredAudit = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(recoveredAudit.audit.final_provider, "openai");
  assert.equal(recoveredAudit.audit.status, "success");
  assert.equal(recoveredAudit.audit.circuit_breaker_state, "closed");

  // E. rules provider should not be affected by retry/circuit governance.
  const rulesUnaffected = await runIntakeAnalysisWithAudit(sampleLead, "rules");
  assert.equal(rulesUnaffected.audit.final_provider, "rules");
  assert.equal(rulesUnaffected.audit.retry_used, false);
  assert.equal(rulesUnaffected.audit.retry_count, 0);
  assert.equal(rulesUnaffected.audit.circuit_breaker_state, "closed");

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

    if (previousProviderEnv === undefined) {
      delete process.env.INTAKE_ANALYSIS_PROVIDER;
    } else {
      process.env.INTAKE_ANALYSIS_PROVIDER = previousProviderEnv;
    }

    if (previousApiKeyEnv === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = previousApiKeyEnv;
    }

    if (previousModelEnv === undefined) {
      delete process.env.OPENAI_MODEL;
    } else {
      process.env.OPENAI_MODEL = previousModelEnv;
    }
  });
