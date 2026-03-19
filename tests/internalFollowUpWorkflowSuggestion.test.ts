import assert from "node:assert/strict";
import type { IntakeAnalysisResult } from "../lib/aiIntakeAnalysis";
import { buildInternalActionHandoff } from "../lib/internalActionHandoff";
import { buildInternalEstimateDraft } from "../lib/internalEstimateDraft";
import { buildInternalFollowUpWorkflowSuggestion } from "../lib/internalFollowUpWorkflowSuggestion";
import { buildOperatorGuidance } from "../lib/internalOperatorGuidance";

const lead = {
  id: "L-3003",
  city: "Folsom",
  urgency: "high",
  property_type: "single_family",
  service_type: "Drain cleaning",
  phone: "9165552222",
};

const analysis: IntakeAnalysisResult = {
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
  next_step: "Confirm access window and send operator callback.",
  confidence: 0.62,
  analysis_version: "phase2-step3-rules",
};

function run() {
  const guidance = buildOperatorGuidance(analysis, false);
  const handoff = buildInternalActionHandoff({
    lead: { id: lead.id, urgency: lead.urgency, phone: lead.phone },
    analysis,
    guidance,
    nowIso: "2026-03-19T00:00:00.000Z",
  });
  const estimateDraft = buildInternalEstimateDraft({
    lead,
    analysis,
    guidance,
    handoff,
  });

  const suggestion = buildInternalFollowUpWorkflowSuggestion({
    lead: { id: lead.id, urgency: lead.urgency, city: lead.city, service_type: lead.service_type },
    analysis,
    guidance,
    handoff,
    estimateDraft,
  });

  assert.equal(suggestion.availability, "available");
  assert.equal(suggestion.requires_human_confirmation, true);
  assert.equal(suggestion.auto_contact_customer, false);
  assert.equal(suggestion.auto_update_status, false);
  assert.equal(suggestion.auto_create_task, false);
  assert.match(suggestion.follow_up_summary, /Next:/);

  const noAnalysisSuggestion = buildInternalFollowUpWorkflowSuggestion({
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
  });

  assert.equal(noAnalysisSuggestion.availability, "unavailable");
  assert.equal(noAnalysisSuggestion.unavailable_reason, "analysis_unavailable");

  const noGuidanceSuggestion = buildInternalFollowUpWorkflowSuggestion({
    lead: { id: lead.id, urgency: lead.urgency, city: lead.city, service_type: lead.service_type },
    analysis,
    guidance: null,
    handoff,
    estimateDraft,
  });

  assert.equal(noGuidanceSuggestion.availability, "available");
  assert.ok(noGuidanceSuggestion.risk_flags.includes("guidance_missing"));

  // Ensure no direct operational mutation fields.
  assert.equal((suggestion as unknown as { status?: string }).status, undefined);
  assert.equal((suggestion as unknown as { quote_amount?: string }).quote_amount, undefined);

  console.log("internalFollowUpWorkflowSuggestion tests passed");
}

run();
