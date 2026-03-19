import assert from "node:assert/strict";
import { buildIntakeAnalysis } from "../lib/aiIntakeAnalysis";
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

const defaultResult = buildIntakeAnalysis(sampleLead);
assert.match(defaultResult.analysis_version, /^phase2-step3-rules$/);

const rulesResult = runIntakeAnalysisWithProvider(sampleLead, "rules");
assert.match(rulesResult.analysis_version, /^phase2-step3-rules$/);

const unknownProviderFallbackResult = runIntakeAnalysisWithProvider(sampleLead, "not_a_provider");
assert.match(unknownProviderFallbackResult.analysis_version, /^phase2-step3-rules$/);

const unresolvedName = resolveIntakeAnalysisProviderName("unknown_name");
assert.equal(unresolvedName, "rules");

const mockProvider = getIntakeAnalysisProvider("mock_ai");
assert.equal(mockProvider.name, "mock_ai");
const mockResult = runIntakeAnalysisWithProvider(sampleLead, "mock_ai");
assert.match(mockResult.analysis_version, /^phase2-step3-mock-ai-placeholder$/);

const openAiPlaceholderFallback = runIntakeAnalysisWithProvider(sampleLead, "openai");
assert.match(openAiPlaceholderFallback.analysis_version, /^phase2-step3-rules$/);

console.log("aiIntakeAnalysis provider tests passed");
