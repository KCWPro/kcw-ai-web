import assert from "node:assert/strict";
import { buildIntakeAnalysis } from "../lib/aiIntakeAnalysis";
import { __setOpenAiIntakeRunnerForTests } from "../lib/aiIntakeAnalysisOpenAI";
import {
  getIntakeAnalysisProvider,
  resolveIntakeAnalysisProviderName,
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

  const unknownProviderFallbackResult = await runIntakeAnalysisWithProvider(sampleLead, "not_a_provider");
  assert.match(unknownProviderFallbackResult.analysis_version, /^phase2-step3-rules$/);

  const unresolvedName = resolveIntakeAnalysisProviderName("unknown_name");
  assert.equal(unresolvedName, "rules");

  const mockProvider = getIntakeAnalysisProvider("mock_ai");
  assert.equal(mockProvider.name, "mock_ai");
  const mockResult = await runIntakeAnalysisWithProvider(sampleLead, "mock_ai");
  assert.match(mockResult.analysis_version, /^phase2-step3-mock-ai-placeholder$/);

  delete process.env.OPENAI_API_KEY;
  process.env.OPENAI_MODEL = "gpt-4o-mini";
  const openAiMissingKeyFallback = await runIntakeAnalysisWithProvider(sampleLead, "openai");
  assert.match(openAiMissingKeyFallback.analysis_version, /^phase2-step3-rules$/);

  process.env.OPENAI_API_KEY = "test-key";
  delete process.env.OPENAI_MODEL;
  const openAiMissingModelFallback = await runIntakeAnalysisWithProvider(sampleLead, "openai");
  assert.match(openAiMissingModelFallback.analysis_version, /^phase2-step3-rules$/);

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

  const openAiSuccess = await runIntakeAnalysisWithProvider(sampleLead, "openai");
  assert.match(openAiSuccess.analysis_version, /^phase2-step4-openai$/);
  assert.equal(openAiSuccess.issue_classification, "water_heater");

  __setOpenAiIntakeRunnerForTests(async () => ({ bad: "shape" }));
  const openAiInvalidFallback = await runIntakeAnalysisWithProvider(sampleLead, "openai");
  assert.match(openAiInvalidFallback.analysis_version, /^phase2-step3-rules$/);

  __setOpenAiIntakeRunnerForTests(async () => {
    throw new Error("openai test failure");
  });
  const openAiErrorFallback = await runIntakeAnalysisWithProvider(sampleLead, "openai");
  assert.match(openAiErrorFallback.analysis_version, /^phase2-step3-rules$/);

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
