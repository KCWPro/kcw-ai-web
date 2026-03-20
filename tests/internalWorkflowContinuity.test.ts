import assert from "node:assert/strict";
import type { IntakeAnalysisResult } from "../lib/aiIntakeAnalysis";
import { buildInternalActionHandoff } from "../lib/internalActionHandoff";
import { buildInternalEstimateDraft } from "../lib/internalEstimateDraft";
import { buildInternalFollowUpWorkflowSuggestion } from "../lib/internalFollowUpWorkflowSuggestion";
import { buildOperatorGuidance } from "../lib/internalOperatorGuidance";
import { buildInternalWorkflowContinuity } from "../lib/internalWorkflowContinuity";

const lead = {
  id: "L-4001",
  status: "in_progress",
  city: "Folsom",
  urgency: "high",
  property_type: "single_family",
  service_type: "Drain cleaning",
  phone: "9165550000",
};

const partialAnalysis: IntakeAnalysisResult = {
  issue_classification: "drain_issue",
  info_completeness: "partial",
  missing_fields: ["problem_duration"],
  recommended_action: "Call customer to verify severity.",
  suggested_price_range: {
    band: "likely_medium_job",
    min: 220,
    max: 2200,
    currency: "USD",
    notes: "placeholder",
  },
  next_step: "Confirm access window and callback availability.",
  confidence: 0.64,
  analysis_version: "phase2-step3-rules",
};

const readyAnalysis: IntakeAnalysisResult = {
  ...partialAnalysis,
  info_completeness: "sufficient",
  missing_fields: [],
};

function buildContinuity(analysis: IntakeAnalysisResult | null, forceFollowUpUnavailable = false) {
  const guidance = buildOperatorGuidance(analysis, false);
  const handoff = buildInternalActionHandoff({
    lead: { id: lead.id, urgency: lead.urgency, phone: lead.phone },
    analysis,
    guidance,
    nowIso: "2026-03-20T00:00:00.000Z",
  });
  const estimateDraft = buildInternalEstimateDraft({
    lead,
    analysis,
    guidance,
    handoff,
  });
  const followUpSuggestion = buildInternalFollowUpWorkflowSuggestion({
    lead: { id: lead.id, urgency: lead.urgency, city: lead.city, service_type: lead.service_type },
    analysis,
    guidance,
    handoff,
    estimateDraft,
  });

  return buildInternalWorkflowContinuity({
    lead: { id: lead.id, status: lead.status },
    analysis,
    guidance,
    handoff,
    estimateDraft,
    followUpSuggestion: forceFollowUpUnavailable
      ? { ...followUpSuggestion, availability: "unavailable", unavailable_reason: "manual_mismatch_for_test" }
      : followUpSuggestion,
  });
}

function run() {
  const readyAligned = buildContinuity(readyAnalysis);
  assert.equal(readyAligned.model_version, "phase4-step1-workflow-continuity-v1");
  assert.equal(readyAligned.continuity_state, "ready_for_follow_up");
  assert.equal(readyAligned.follow_up_alignment.suggestion_availability, "available");
  assert.equal(readyAligned.follow_up_alignment.alignment_status, "aligned");
  assert.match(readyAligned.follow_up_alignment.note, /available for operator review/i);

  const needsIntakeButFollowUpAvailable = buildContinuity(partialAnalysis);
  assert.equal(needsIntakeButFollowUpAvailable.continuity_state, "needs_intake_completion");
  assert.equal(needsIntakeButFollowUpAvailable.follow_up_alignment.suggestion_availability, "available");
  assert.equal(needsIntakeButFollowUpAvailable.follow_up_alignment.alignment_status, "needs_review");
  assert.match(needsIntakeButFollowUpAvailable.follow_up_alignment.note, /complete\/confirm intake fields/i);

  const readyButFollowUpUnavailable = buildContinuity(readyAnalysis, true);
  assert.equal(readyButFollowUpUnavailable.continuity_state, "ready_for_follow_up");
  assert.equal(readyButFollowUpUnavailable.follow_up_alignment.suggestion_availability, "unavailable");
  assert.equal(readyButFollowUpUnavailable.follow_up_alignment.alignment_status, "needs_review");
  assert.match(readyButFollowUpUnavailable.follow_up_alignment.note, /follow-up is unavailable/i);

  const blockedAndUnavailable = buildContinuity(null);
  assert.equal(blockedAndUnavailable.continuity_state, "blocked");
  assert.equal(blockedAndUnavailable.follow_up_alignment.suggestion_availability, "unavailable");
  assert.equal(blockedAndUnavailable.follow_up_alignment.alignment_status, "aligned");
  assert.match(blockedAndUnavailable.follow_up_alignment.note, /as expected/i);

  console.log("internalWorkflowContinuity tests passed");
}

run();
