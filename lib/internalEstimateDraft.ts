import type { IntakeAnalysisResult } from "./aiIntakeAnalysis";
import type { InternalActionHandoffModel } from "./internalActionHandoff";
import type { StoredLead } from "./internalLeadsStore";
import type { OperatorGuidanceViewModel } from "./internalOperatorGuidance";

export type InternalEstimateDraftAvailability = "available" | "unavailable";

export type InternalEstimateDraft = {
  draft_version: "phase3-step4-estimate-draft-v1";
  draft_type: "suggestion_draft";
  availability: InternalEstimateDraftAvailability;
  unavailable_reason: string | null;
  requires_human_confirmation: true;
  auto_send: false;
  auto_apply_quote_amount: false;
  auto_update_status: false;
  lead_context: {
    lead_id: string;
    city: string;
    urgency: string;
    property_type: string;
    service_type: string;
  };
  ai_reference: {
    analysis_version: string | null;
    info_completeness: IntakeAnalysisResult["info_completeness"] | "unknown";
    confidence: number | null;
    suggested_price_range_summary: string;
  };
  service_summary: string;
  assumptions: string[];
  missing_info: string[];
  operator_review_reminders: string[];
};

function formatPriceRangeSummary(range: IntakeAnalysisResult["suggested_price_range"] | null) {
  if (!range) {
    return "No suggested price range available.";
  }

  const min = range.min === null ? "-" : `$${range.min}`;
  const max = range.max === null ? "-" : `$${range.max}`;
  return `${range.band} (${min} ~ ${max})`;
}

export function buildInternalEstimateDraft(params: {
  lead: Pick<StoredLead, "id" | "city" | "urgency" | "property_type" | "service_type">;
  analysis: IntakeAnalysisResult | null;
  guidance: OperatorGuidanceViewModel | null;
  handoff: InternalActionHandoffModel;
}): InternalEstimateDraft {
  const { lead, analysis, guidance, handoff } = params;
  const estimateCandidate = handoff.estimate_candidate;

  const baseDraft: Omit<InternalEstimateDraft, "availability" | "unavailable_reason" | "ai_reference" | "service_summary" | "assumptions" | "missing_info" | "operator_review_reminders"> = {
    draft_version: "phase3-step4-estimate-draft-v1",
    draft_type: "suggestion_draft",
    requires_human_confirmation: true,
    auto_send: false,
    auto_apply_quote_amount: false,
    auto_update_status: false,
    lead_context: {
      lead_id: lead.id,
      city: lead.city,
      urgency: lead.urgency,
      property_type: lead.property_type,
      service_type: lead.service_type,
    },
  };

  if (!analysis || estimateCandidate.availability !== "available" || !estimateCandidate.input) {
    return {
      ...baseDraft,
      availability: "unavailable",
      unavailable_reason: "estimate_candidate_unavailable",
      ai_reference: {
        analysis_version: analysis?.analysis_version || null,
        info_completeness: analysis?.info_completeness || "unknown",
        confidence: analysis?.confidence ?? null,
        suggested_price_range_summary: "No suggested price range available.",
      },
      service_summary: "Estimate suggestion unavailable until AI analysis and handoff candidate are ready.",
      assumptions: ["No estimate draft should be used for customer communication in current state."],
      missing_info: analysis?.missing_fields || [],
      operator_review_reminders: [
        "Confirm intake completeness first.",
        "Do not write quote_amount automatically.",
        "Do not update lead status automatically.",
      ],
    };
  }

  const range = estimateCandidate.input.suggested_price_range || null;
  const priceSummary = formatPriceRangeSummary(range);

  return {
    ...baseDraft,
    availability: "available",
    unavailable_reason: null,
    ai_reference: {
      analysis_version: analysis.analysis_version,
      info_completeness: analysis.info_completeness,
      confidence: analysis.confidence,
      suggested_price_range_summary: priceSummary,
    },
    service_summary: `${lead.service_type || "Service pending confirmation"} in ${lead.city || "city pending"}`,
    assumptions: [
      "This is an internal estimate suggestion draft only.",
      "Final quote requires human confirmation and scope verification.",
      range?.notes || "No AI notes available for price range.",
    ],
    missing_info: analysis.missing_fields,
    operator_review_reminders: [
      guidance?.highlight || "Review AI recommendation with operator judgment.",
      "Do not auto-send to customer.",
      "Do not auto-apply to quote_amount.",
      "Do not auto-update status.",
    ],
  };
}
