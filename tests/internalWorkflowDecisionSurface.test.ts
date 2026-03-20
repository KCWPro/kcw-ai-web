import assert from "node:assert/strict";
import type { IntakeAnalysisResult } from "../lib/aiIntakeAnalysis";
import { buildInternalActionHandoff } from "../lib/internalActionHandoff";
import { buildInternalEstimateDraft } from "../lib/internalEstimateDraft";
import { buildInternalFollowUpWorkflowSuggestion } from "../lib/internalFollowUpWorkflowSuggestion";
import { buildOperatorGuidance } from "../lib/internalOperatorGuidance";
import { buildInternalWorkflowContinuity } from "../lib/internalWorkflowContinuity";
import { buildInternalWorkflowDecisionSurface } from "../lib/internalWorkflowDecisionSurface";

const lead = {
  id: "L-5001",
  status: "in_progress",
  city: "Folsom",
  urgency: "high",
  property_type: "single_family",
  service_type: "Drain cleaning",
  phone: "9165559000",
};

const partialAnalysis: IntakeAnalysisResult = {
  issue_classification: "drain_issue",
  info_completeness: "partial",
  missing_fields: ["problem_duration"],
  recommended_action: "Call customer to verify blockage severity.",
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

function buildScenario(analysis: IntakeAnalysisResult | null, forceFollowUpUnavailable = false) {
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

  const continuity = buildInternalWorkflowContinuity({
    lead: { id: lead.id, status: lead.status },
    analysis,
    guidance,
    handoff,
    estimateDraft,
    followUpSuggestion: forceFollowUpUnavailable
      ? { ...followUpSuggestion, availability: "unavailable", unavailable_reason: "manual_mismatch_for_test" }
      : followUpSuggestion,
  });

  return buildInternalWorkflowDecisionSurface({
    analysis,
    guidance,
    handoff,
    estimateDraft,
    followUpSuggestion: forceFollowUpUnavailable
      ? { ...followUpSuggestion, availability: "unavailable", unavailable_reason: "manual_mismatch_for_test" }
      : followUpSuggestion,
    continuity,
  });
}

function run() {
  const blocked = buildScenario(null);
  assert.equal(blocked.model_version, "phase5-step2-decision-surface-v1");
  assert.equal(blocked.decision_status, "blocked");
  assert.equal(blocked.priority, "high");
  assert.match(blocked.next_manual_review_action, /Recover analysis availability/i);
  assert.ok(blocked.risk_flags.includes("decision_surface_blocked"));
  assert.ok(blocked.source_alignment_notes.includes("continuity_state=blocked"));
  assert.ok(blocked.human_confirmed_paths.every((item) => item.status !== "ready"));

  const needsReview = buildScenario(partialAnalysis);
  assert.equal(needsReview.decision_status, "needs_review");
  assert.equal(needsReview.priority, "medium");
  assert.match(needsReview.next_manual_review_action, /Manually verify intake completeness\/alignment/i);
  assert.ok(needsReview.source_alignment_notes.includes("continuity_state=needs_intake_completion"));
  assert.ok(needsReview.risk_flags.includes("decision_surface_alignment_needs_review"));
  const needsReviewFollowUpPath = needsReview.human_confirmed_paths.find((item) => item.id === "path_follow_up_review");
  assert.ok(needsReviewFollowUpPath);
  assert.notEqual(needsReviewFollowUpPath?.status, "ready");

  const ready = buildScenario(readyAnalysis);
  assert.equal(ready.decision_status, "ready_for_manual_progress");
  assert.equal(ready.priority, "low");
  assert.equal(ready.next_manual_review_action, ready.suggestion_only_items.find((item) => item.id === "follow_up_snapshot")?.detail);
  assert.ok(ready.human_confirmed_paths.some((item) => item.id === "path_follow_up_review" && item.status === "ready"));
  assert.ok(ready.review_notes.some((item) => /not executed actions/i.test(item)));

  const mismatch = buildScenario(readyAnalysis, true);
  assert.equal(mismatch.decision_status, "needs_review");
  assert.ok(mismatch.source_alignment_notes.includes("follow_up_alignment=needs_review"));

  assert.ok(blocked.suggestion_only_items.every((item) => item.category === "suggestion_only"));
  assert.ok(blocked.human_confirmed_paths.every((item) => item.category === "human_confirmed_path"));
  assert.ok(blocked.automation_boundary_notices.every((item) => item.category === "not_yet_implemented_automation"));
  assert.ok(blocked.automation_boundary_notices.every((item) => item.status === "not_available"));
  assert.ok(blocked.automation_boundary_notices.length >= 4);

  console.log("internalWorkflowDecisionSurface tests passed");
}

run();
