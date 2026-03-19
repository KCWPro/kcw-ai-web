import assert from "node:assert/strict";
import { buildInternalActionHandoff } from "../lib/internalActionHandoff";
import type { IntakeAnalysisResult } from "../lib/aiIntakeAnalysis";
import { buildOperatorGuidance } from "../lib/internalOperatorGuidance";

const baseLead = {
  id: "L-1001",
  urgency: "medium",
  phone: "9165550101",
};

const baseAnalysis: IntakeAnalysisResult = {
  issue_classification: "water_heater",
  info_completeness: "sufficient",
  missing_fields: [],
  recommended_action: "Route to ops and confirm constraints.",
  suggested_price_range: {
    band: "likely_medium_job",
    min: 300,
    max: 1500,
    currency: "USD",
    notes: "placeholder",
  },
  next_step: "Call and schedule inspection window.",
  confidence: 0.86,
  analysis_version: "phase2-step3-rules",
};

function run() {
  const guidance = buildOperatorGuidance(baseAnalysis, false);

  const handoff = buildInternalActionHandoff({
    lead: baseLead,
    analysis: baseAnalysis,
    guidance,
    nowIso: "2026-03-19T00:00:00.000Z",
  });

  assert.equal(handoff.model_version, "phase3-step3-handoff-v1");
  assert.equal(handoff.source.analysis_available, true);
  assert.equal(handoff.source.guidance_available, true);
  assert.equal(handoff.estimate_candidate.availability, "available");
  assert.equal(handoff.follow_up_candidate.availability, "available");
  assert.equal(handoff.workflow_candidate.availability, "available");

  assert.equal(handoff.estimate_candidate.suggestion_only, true);
  assert.equal(handoff.estimate_candidate.requires_human_confirmation, true);
  assert.equal(handoff.estimate_candidate.auto_executed, false);

  const noAnalysis = buildInternalActionHandoff({
    lead: baseLead,
    analysis: null,
    guidance: null,
    nowIso: "2026-03-19T00:00:00.000Z",
  });

  assert.equal(noAnalysis.source.analysis_available, false);
  assert.equal(noAnalysis.estimate_candidate.availability, "unavailable");
  assert.equal(noAnalysis.follow_up_candidate.availability, "unavailable");
  assert.equal(noAnalysis.workflow_candidate.availability, "unavailable");

  const noGuidance = buildInternalActionHandoff({
    lead: { ...baseLead, phone: "" },
    analysis: baseAnalysis,
    guidance: null,
    nowIso: "2026-03-19T00:00:00.000Z",
  });

  assert.equal(noGuidance.source.guidance_available, false);
  assert.equal(noGuidance.follow_up_candidate.input?.phone_present, false);
  assert.equal(noGuidance.workflow_candidate.input?.guidance_highlight, null);

  // Ensure no operational state mutation fields are emitted.
  assert.equal((noGuidance as unknown as { status?: string }).status, undefined);
  assert.equal((noGuidance as unknown as { quote_amount?: string }).quote_amount, undefined);

  console.log("internalActionHandoff tests passed");
}

run();
