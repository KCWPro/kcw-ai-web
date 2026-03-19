import assert from "node:assert/strict";
import { buildIntakeAnalysis } from "../lib/aiIntakeAnalysis";
import { __setOpenAiIntakeRunnerForTests } from "../lib/aiIntakeAnalysisOpenAI";
import {
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
  process.env.INTAKE_ANALYSIS_PROVIDER = "";
  const defaultResult = await buildIntakeAnalysis(sampleLead);
  assert.match(defaultResult.analysis_version, /^phase2-step3-rules$/);

  const rulesResult = await runIntakeAnalysisWithProvider(sampleLead, "rules");
  assert.match(rulesResult.analysis_version, /^phase2-step3-rules$/);

  const rulesAuditRun = await runIntakeAnalysisWithAudit(sampleLead, "rules");
  assert.equal(rulesAuditRun.audit.status, "success");
  assert.equal(rulesAuditRun.audit.fallback_used, false);
  assert.equal(rulesAuditRun.audit.final_provider, "rules");
  assert.ok(rulesAuditRun.audit.duration_ms >= 0);

  const unknownProviderFallbackResult = await runIntakeAnalysisWithProvider(sampleLead, "not_a_provider");
  assert.match(unknownProviderFallbackResult.analysis_version, /^phase2-step3-rules$/);

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
  assert.equal(openAiMissingKeyAudit.audit.fallback_used, true);
  assert.equal(openAiMissingKeyAudit.audit.fallback_reason, "missing_config");

  process.env.OPENAI_API_KEY = "test-key";
  delete process.env.OPENAI_MODEL;
  const openAiMissingModelAudit = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(openAiMissingModelAudit.audit.final_provider, "rules");
  assert.equal(openAiMissingModelAudit.audit.error_category, "missing_config");

  process.env.OPENAI_API_KEY = "test-key";
  process.env.OPENAI_MODEL = "gpt-4o-mini";
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

  const openAiSuccess = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(openAiSuccess.audit.status, "success");
  assert.equal(openAiSuccess.audit.fallback_used, false);
  assert.equal(openAiSuccess.audit.final_provider, "openai");
  assert.match(openAiSuccess.result.analysis_version, /^phase2-step4-openai$/);

  __setOpenAiIntakeRunnerForTests(async () => ({ bad: "shape" }));
  const openAiInvalidFallback = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(openAiInvalidFallback.audit.final_provider, "rules");
  assert.equal(openAiInvalidFallback.audit.fallback_reason, "invalid_provider_output");
  assert.equal(openAiInvalidFallback.audit.error_category, "invalid_provider_output");

  __setOpenAiIntakeRunnerForTests(async () => {
    throw new Error("openai test failure");
  });
  const openAiErrorFallback = await runIntakeAnalysisWithAudit(sampleLead, "openai");
  assert.equal(openAiErrorFallback.audit.final_provider, "rules");
  assert.equal(openAiErrorFallback.audit.fallback_reason, "provider_execution_error");
  assert.equal(openAiErrorFallback.audit.error_category, "provider_execution_error");

  __setOpenAiIntakeRunnerForTests(undefined);
  console.log("aiIntakeAnalysis provider tests passed");
}

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    __setOpenAiIntakeRunnerForTests(undefined);

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
