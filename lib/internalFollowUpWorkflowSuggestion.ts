import type { IntakeAnalysisResult } from "./aiIntakeAnalysis";
import type { InternalActionHandoffModel } from "./internalActionHandoff";
import type { InternalEstimateDraft } from "./internalEstimateDraft";
import type { StoredLead } from "./internalLeadsStore";
import type { OperatorGuidanceViewModel } from "./internalOperatorGuidance";

export type InternalFollowUpWorkflowSuggestion = {
  model_version: "phase3-step5-followup-workflow-v1";
  availability: "available" | "unavailable";
  unavailable_reason: string | null;
  requires_human_confirmation: true;
  auto_contact_customer: false;
  auto_update_status: false;
  auto_create_task: false;
  follow_up_summary: string;
  workflow_summary: string;
  recommended_next_operator_action: string;
  prerequisites: string[];
  risk_flags: string[];
  context: {
    lead_id: string;
    analysis_available: boolean;
    guidance_available: boolean;
    estimate_draft_available: boolean;
    confidence: number | null;
  };
};

export function buildInternalFollowUpWorkflowSuggestion(params: {
  lead: Pick<StoredLead, "id" | "urgency" | "city" | "service_type">;
  analysis: IntakeAnalysisResult | null;
  guidance: OperatorGuidanceViewModel | null;
  handoff: InternalActionHandoffModel;
  estimateDraft: InternalEstimateDraft | null;
}): InternalFollowUpWorkflowSuggestion {
  const { lead, analysis, guidance, handoff, estimateDraft } = params;

  if (!analysis) {
    return {
      model_version: "phase3-step5-followup-workflow-v1",
      availability: "unavailable",
      unavailable_reason: "analysis_unavailable",
      requires_human_confirmation: true,
      auto_contact_customer: false,
      auto_update_status: false,
      auto_create_task: false,
      follow_up_summary: "Follow-up suggestion unavailable until analysis is available.",
      workflow_summary: "Workflow suggestion unavailable until analysis is available.",
      recommended_next_operator_action: "Collect missing intake context and rerun analysis before taking downstream actions.",
      prerequisites: ["Analysis data is required for suggestion generation."],
      risk_flags: ["AI analysis unavailable", "Do not contact customer automatically"],
      context: {
        lead_id: lead.id,
        analysis_available: false,
        guidance_available: false,
        estimate_draft_available: !!estimateDraft && estimateDraft.availability === "available",
        confidence: null,
      },
    };
  }

  const followCandidate = handoff.follow_up_candidate;
  const workflowCandidate = handoff.workflow_candidate;

  const prerequisites: string[] = [...analysis.missing_fields];
  if (analysis.info_completeness !== "sufficient") {
    prerequisites.push("confirm_intake_completeness");
  }

  const riskFlags: string[] = [];
  if (analysis.info_completeness === "insufficient") {
    riskFlags.push("low_info_completeness");
  }
  if (analysis.confidence < 0.5) {
    riskFlags.push("low_confidence");
  }
  if (!guidance) {
    riskFlags.push("guidance_missing");
  }
  if (estimateDraft?.availability !== "available") {
    riskFlags.push("estimate_draft_unavailable");
  }

  const followUpSummary =
    followCandidate.availability === "available" && followCandidate.input
      ? `${followCandidate.input.recommended_action} | Next: ${followCandidate.input.next_step}`
      : "Follow-up candidate unavailable."

  const workflowSummary =
    workflowCandidate.availability === "available" && workflowCandidate.input
      ? `Lead ${workflowCandidate.input.lead_id} (${workflowCandidate.input.info_completeness}) should proceed with operator-reviewed internal sequencing.`
      : "Workflow candidate unavailable.";

  return {
    model_version: "phase3-step5-followup-workflow-v1",
    availability: "available",
    unavailable_reason: null,
    requires_human_confirmation: true,
    auto_contact_customer: false,
    auto_update_status: false,
    auto_create_task: false,
    follow_up_summary: followUpSummary,
    workflow_summary: workflowSummary,
    recommended_next_operator_action:
      guidance?.highlight ||
      `Review next_step manually for ${lead.service_type || "service pending"} lead in ${lead.city || "unknown city"}.`,
    prerequisites,
    risk_flags: riskFlags,
    context: {
      lead_id: lead.id,
      analysis_available: true,
      guidance_available: !!guidance,
      estimate_draft_available: !!estimateDraft && estimateDraft.availability === "available",
      confidence: analysis.confidence,
    },
  };
}
