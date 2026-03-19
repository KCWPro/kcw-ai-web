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

const analysis: IntakeAnalysisResult = {
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
  ...analysis,
  info_completeness: "sufficient",
  missing_fields: [],
};

function run() {
  const guidance = buildOperatorGuidance(analysis, false);
  const handoff = buildInternalActionHandoff({
    lead: { id: lead.id, urgency: lead.urgency, phone: lead.phone },
    analysis,
    guidance,
    nowIso: "2026-03-19T00:00:00.000Z",
  });
  const estimateDraft = buildInternalEstimateDraft({ lead, analysis, guidance, handoff });
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
    followUpSuggestion,
  });

  assert.equal(continuity.model_version, "phase4-step1-workflow-continuity-v1");
  assert.equal(continuity.continuity_state, "needs_intake_completion");
  assert.match(continuity.summary, /partial/i);
  assert.equal(continuity.checklist.length, 4);
  assert.equal(continuity.follow_up_alignment.alignment_status, "needs_review");
  assert.match(continuity.follow_up_alignment.note, /intake completeness is still partial/i);

  const readyGuidance = buildOperatorGuidance(readyAnalysis, false);
  const readyHandoff = buildInternalActionHandoff({
    lead: { id: lead.id, urgency: lead.urgency, phone: lead.phone },
    analysis: readyAnalysis,
    guidance: readyGuidance,
    nowIso: "2026-03-19T00:00:00.000Z",
  });
  const readyEstimateDraft = buildInternalEstimateDraft({
    lead,
    analysis: readyAnalysis,
    guidance: readyGuidance,
    handoff: readyHandoff,
  });
  const readyFollowUpSuggestion = buildInternalFollowUpWorkflowSuggestion({
    lead: { id: lead.id, urgency: lead.urgency, city: lead.city, service_type: lead.service_type },
    analysis: readyAnalysis,
    guidance: readyGuidance,
    handoff: readyHandoff,
    estimateDraft: readyEstimateDraft,
  });
  const readyContinuity = buildInternalWorkflowContinuity({
    lead: { id: lead.id, status: lead.status },
    analysis: readyAnalysis,
    guidance: readyGuidance,
    handoff: readyHandoff,
    estimateDraft: readyEstimateDraft,
    followUpSuggestion: readyFollowUpSuggestion,
  });
  assert.equal(readyContinuity.continuity_state, "ready_for_follow_up");
  assert.equal(readyContinuity.follow_up_alignment.alignment_status, "aligned");

  const blocked = buildInternalWorkflowContinuity({
    lead: { id: lead.id, status: "new" },
    analysis: null,
    guidance: null,
    handoff: buildInternalActionHandoff({
      lead: { id: lead.id, urgency: lead.urgency, phone: lead.phone },
      analysis: null,
      guidance: null,
      nowIso: "2026-03-19T00:00:00.000Z",
    }),
    estimateDraft: null,
    followUpSuggestion: buildInternalFollowUpWorkflowSuggestion({
      lead: { id: lead.id, urgency: lead.urgency, city: lead.city, service_type: lead.service_type },
      analysis: null,
      guidance: null,
      handoff: buildInternalActionHandoff({
        lead: { id: lead.id, urgency: lead.urgency, phone: lead.phone },
        analysis: null,
        guidance: null,
        nowIso: "2026-03-19T00:00:00.000Z",
      }),
      estimateDraft: null,
    }),
  });

  assert.equal(blocked.continuity_state, "blocked");
  assert.ok(blocked.risk_flags.includes("guidance_unavailable"));
  assert.equal(blocked.follow_up_alignment.alignment_status, "aligned");

  const readyButUnavailable = buildInternalWorkflowContinuity({
    lead: { id: lead.id, status: lead.status },
    analysis: readyAnalysis,
    guidance: readyGuidance,
    handoff: readyHandoff,
    estimateDraft: readyEstimateDraft,
    followUpSuggestion: {
      ...readyFollowUpSuggestion,
      availability: "unavailable",
      unavailable_reason: "manual_mismatch_for_test",
    },
  });
  assert.equal(readyButUnavailable.continuity_state, "ready_for_follow_up");
  assert.equal(readyButUnavailable.follow_up_alignment.alignment_status, "needs_review");

  console.log("internalWorkflowContinuity tests passed");
}

run();
