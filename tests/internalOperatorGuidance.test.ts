import assert from "node:assert/strict";
import { buildOperatorGuidance } from "../lib/internalOperatorGuidance";
import type { IntakeAnalysisResult } from "../lib/aiIntakeAnalysis";

const baseAnalysis: IntakeAnalysisResult = {
  issue_classification: "water_heater",
  info_completeness: "sufficient",
  missing_fields: [],
  recommended_action: "Route to ops and confirm constraints.",
  suggested_price_range: {
    band: "likely_medium_job",
    min: 300,
    max: 1500,
    currency: "USD" as const,
    notes: "placeholder",
  },
  next_step: "Call and schedule inspection window.",
  confidence: 0.86,
  analysis_version: "phase2-step3-rules",
};

function run() {
  const guidance = buildOperatorGuidance(baseAnalysis, false);
  assert.ok(guidance);
  assert.equal(guidance?.title, "Operator Guidance");
  assert.match(guidance?.disclaimer || "", /不会自动执行/);
  assert.equal(guidance?.items.length, 5);

  const insufficient = buildOperatorGuidance(
    {
      ...baseAnalysis,
      info_completeness: "insufficient",
      missing_fields: ["phone", "city"],
      confidence: 0.42,
    },
    false,
  );

  assert.ok(insufficient);
  assert.match(insufficient?.highlight || "", /低完整度|补齐关键字段/);

  const confidenceItem = insufficient?.items.find((item) => item.id === "confidence");
  assert.equal(confidenceItem?.level, "critical");

  const missingItem = insufficient?.items.find((item) => item.id === "missing_fields");
  assert.match(missingItem?.detail || "", /phone/);
  assert.match(missingItem?.detail || "", /city/);

  const fallbackGuidance = buildOperatorGuidance(baseAnalysis, true);
  assert.ok(fallbackGuidance);
  assert.match(fallbackGuidance?.highlight || "", /降级路径|人工确认|参考/);

  const noAnalysis = buildOperatorGuidance(null, false);
  assert.equal(noAnalysis, null);

  console.log("internalOperatorGuidance tests passed");
}

run();
