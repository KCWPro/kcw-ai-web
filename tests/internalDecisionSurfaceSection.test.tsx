import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import type { IntakeAnalysisResult } from "../lib/aiIntakeAnalysis";
import {
  buildControlledSubmissionContract,
  type ControlledSubmissionReadinessInput,
} from "../lib/controlledSubmissionContract";
import { buildInternalActionHandoff } from "../lib/internalActionHandoff";
import { buildInternalEstimateDraft } from "../lib/internalEstimateDraft";
import { buildInternalFollowUpWorkflowSuggestion } from "../lib/internalFollowUpWorkflowSuggestion";
import { buildOperatorGuidance } from "../lib/internalOperatorGuidance";
import { buildInternalWorkflowContinuity } from "../lib/internalWorkflowContinuity";
import { buildInternalWorkflowDecisionSurface } from "../lib/internalWorkflowDecisionSurface";
import DecisionSurfaceSection from "../app/internal/leads/[id]/DecisionSurfaceSection";

const lead = {
  id: "L-5002",
  status: "in_progress",
  city: "Folsom",
  urgency: "high",
  property_type: "single_family",
  service_type: "Drain cleaning",
  phone: "9165558000",
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

function renderScenario(
  analysis: IntakeAnalysisResult | null,
  forceFollowUpUnavailable = false,
  contractInputOverride?: Partial<ControlledSubmissionReadinessInput>,
) {
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

  const decisionSurface = buildInternalWorkflowDecisionSurface({
    analysis,
    guidance,
    handoff,
    estimateDraft,
    followUpSuggestion: forceFollowUpUnavailable
      ? { ...followUpSuggestion, availability: "unavailable", unavailable_reason: "manual_mismatch_for_test" }
      : followUpSuggestion,
    continuity,
  });

  const defaultContractInput: ControlledSubmissionReadinessInput = {
    decision_status: decisionSurface.decision_status,
    selected_path_category: "human_confirmed_path",
    selected_path_id: "path_follow_up_review",
    manual_confirmation_received: false,
    intake_quality_gate_passed: continuity.continuity_state === "ready_for_follow_up",
    follow_up_alignment_status: continuity.follow_up_alignment.alignment_status,
    path_availability: continuity.follow_up_alignment.alignment_status === "aligned" ? "available" : "unavailable",
    has_blocking_risk: decisionSurface.decision_status === "blocked",
  };

  const controlledSubmissionContract = buildControlledSubmissionContract({
    ...defaultContractInput,
    ...contractInputOverride,
  });

  return renderToStaticMarkup(
    <DecisionSurfaceSection
      decisionSurface={decisionSurface}
      controlledSubmissionContract={controlledSubmissionContract}
    />,
  );
}

function run() {
  const blockedHtml = renderScenario(null);
  assert.match(blockedHtml, /Internal Workflow Decision Surface/);
  assert.match(blockedHtml, /blocked/);
  assert.match(blockedHtml, /Not-yet-implemented automation/);
  assert.match(blockedHtml, /Controlled Submission Readiness \(Read-only\)/);
  assert.match(blockedHtml, /Gate state/);
  assert.match(blockedHtml, /Gate reasons/);
  assert.match(blockedHtml, /Blockers/);

  const needsReviewHtml = renderScenario(partialAnalysis);
  assert.match(needsReviewHtml, /needs_review/);
  assert.match(needsReviewHtml, /Human-confirmed paths/);
  assert.match(needsReviewHtml, /blocked/);

  const readyReadinessHtml = renderScenario(readyAnalysis, false, {
    manual_confirmation_received: true,
    intake_quality_gate_passed: true,
    follow_up_alignment_status: "aligned",
    path_availability: "available",
    selected_path_category: "human_confirmed_path",
    decision_status: "ready_for_manual_progress",
  });
  assert.match(readyReadinessHtml, /submission_ready/);
  assert.match(readyReadinessHtml, /No submission has been performed/);
  assert.match(readyReadinessHtml, /Readiness does not equal execution/);
  assert.doesNotMatch(readyReadinessHtml, /submitted automatically/i);
  assert.doesNotMatch(readyReadinessHtml, /auto-execute/i);

  const notEligibleHtml = renderScenario(readyAnalysis, false, {
    selected_path_category: "suggestion_only",
    selected_path_id: "continuity_summary",
    manual_confirmation_received: true,
  });
  assert.match(notEligibleHtml, /not_eligible/);
  assert.match(notEligibleHtml, /Select a human_confirmed_path instead of suggestion_only/);

  const needsManualHtml = renderScenario(readyAnalysis, false, {
    manual_confirmation_received: false,
    intake_quality_gate_passed: false,
    follow_up_alignment_status: "aligned",
    path_availability: "available",
  });
  assert.match(needsManualHtml, /needs_manual_confirmation/);
  assert.match(needsManualHtml, /Missing requirements/);
  assert.match(needsManualHtml, /Manual confirmation is required before controlled submission readiness/);

  assert.match(readyReadinessHtml, /Suggestion-only items/);
  assert.match(readyReadinessHtml, /Human-confirmed paths/);
  assert.match(readyReadinessHtml, /Read-only guidance/);
  assert.match(readyReadinessHtml, /Does not auto-advance workflow/);
  assert.match(readyReadinessHtml, /Manual confirmation is still required/);
  assert.match(readyReadinessHtml, /No automatic execution is enabled/);
  assert.match(readyReadinessHtml, /No submission has been performed/);

  console.log("internalDecisionSurfaceSection UI tests passed");
}

run();
