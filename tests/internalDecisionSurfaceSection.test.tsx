import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import type { IntakeAnalysisResult } from "../lib/aiIntakeAnalysis";
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

function renderScenario(analysis: IntakeAnalysisResult | null, forceFollowUpUnavailable = false) {
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

  return renderToStaticMarkup(<DecisionSurfaceSection decisionSurface={decisionSurface} />);
}

function run() {
  const blockedHtml = renderScenario(null);
  assert.match(blockedHtml, /Internal Workflow Decision Surface/);
  assert.match(blockedHtml, /blocked/);
  assert.doesNotMatch(blockedHtml, /ready_for_manual_progress/);
  assert.match(blockedHtml, /Not-yet-implemented automation/);

  const needsReviewHtml = renderScenario(partialAnalysis);
  assert.match(needsReviewHtml, /needs_review/);
  assert.doesNotMatch(needsReviewHtml, /ready_for_manual_progress/);
  assert.match(needsReviewHtml, /Human-confirmed path/);

  const readyHtml = renderScenario(readyAnalysis);
  assert.match(readyHtml, /ready_for_manual_progress/);
  assert.match(readyHtml, /still require operator confirmation/i);

  const mismatchHtml = renderScenario(readyAnalysis, true);
  assert.match(mismatchHtml, /needs_review/);

  assert.match(readyHtml, /Suggestion-only items/);
  assert.match(readyHtml, /Human-confirmed paths/);
  assert.match(readyHtml, /Not-yet-implemented automation/);

  assert.match(readyHtml, /Does not auto-advance workflow/);
  assert.match(readyHtml, /Does not contact customer automatically/);
  assert.match(readyHtml, /Does not create tasks automatically/);
  assert.match(readyHtml, /Does not write business records automatically/);

  console.log("internalDecisionSurfaceSection UI tests passed");
}

run();
