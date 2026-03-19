import assert from "node:assert/strict";
import type { IntakeAnalysisResult } from "../lib/aiIntakeAnalysis";
import { buildInternalActionHandoff } from "../lib/internalActionHandoff";
import { buildInternalEstimateDraft } from "../lib/internalEstimateDraft";
import { buildOperatorGuidance } from "../lib/internalOperatorGuidance";

const lead = {
  id: "L-2002",
  city: "Sacramento",
  urgency: "medium",
  property_type: "single_family",
  service_type: "Water heater replacement",
  phone: "9165550101",
};

const analysis: IntakeAnalysisResult = {
  issue_classification: "water_heater",
  info_completeness: "sufficient",
  missing_fields: [],
  recommended_action: "Route to ops and confirm constraints.",
  suggested_price_range: {
    band: "likely_medium_job",
    min: 300,
    max: 1500,
    currency: "USD",
    notes: "Internal placeholder",
  },
  next_step: "Call and schedule inspection window.",
  confidence: 0.86,
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

  const draft = buildInternalEstimateDraft({
    lead,
    analysis,
    guidance,
    handoff,
  });

  assert.equal(draft.availability, "available");
  assert.equal(draft.draft_type, "suggestion_draft");
  assert.equal(draft.requires_human_confirmation, true);
  assert.equal(draft.auto_send, false);
  assert.equal(draft.auto_apply_quote_amount, false);
  assert.equal(draft.auto_update_status, false);

  const noAnalysisDraft = buildInternalEstimateDraft({
    lead,
    analysis: null,
    guidance: null,
    handoff: buildInternalActionHandoff({
      lead: { id: lead.id, urgency: lead.urgency, phone: lead.phone },
      analysis: null,
      guidance: null,
      nowIso: "2026-03-19T00:00:00.000Z",
    }),
  });

  assert.equal(noAnalysisDraft.availability, "unavailable");
  assert.equal(noAnalysisDraft.unavailable_reason, "estimate_candidate_unavailable");

  const rangeMissingAnalysis: IntakeAnalysisResult = {
    ...analysis,
    suggested_price_range: {
      ...analysis.suggested_price_range,
      min: null,
      max: null,
      notes: "Requires site visit",
    },
  };

  const rangeMissingDraft = buildInternalEstimateDraft({
    lead,
    analysis: rangeMissingAnalysis,
    guidance: buildOperatorGuidance(rangeMissingAnalysis, false),
    handoff: buildInternalActionHandoff({
      lead: { id: lead.id, urgency: lead.urgency, phone: lead.phone },
      analysis: rangeMissingAnalysis,
      guidance: buildOperatorGuidance(rangeMissingAnalysis, false),
      nowIso: "2026-03-19T00:00:00.000Z",
    }),
  });

  assert.equal(rangeMissingDraft.availability, "available");
  assert.match(rangeMissingDraft.ai_reference.suggested_price_range_summary, /\(- ~ -\)/);

  // Ensure estimate draft model does not expose writable operational state fields.
  assert.equal((draft as unknown as { quote_amount?: string }).quote_amount, undefined);
  assert.equal((draft as unknown as { status?: string }).status, undefined);

  console.log("internalEstimateDraft tests passed");
}

run();
