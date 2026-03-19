import type { IntakeAnalysisResult } from "./aiIntakeAnalysis";
import type { StoredLead } from "./internalLeadsStore";
import type { OperatorGuidanceViewModel } from "./internalOperatorGuidance";

export type HandoffAvailability = "available" | "unavailable";

export type SuggestionGuardrails = {
  suggestion_only: true;
  requires_human_confirmation: true;
  auto_executed: false;
};

export type EstimateCandidateInput = {
  issue_classification: IntakeAnalysisResult["issue_classification"];
  suggested_price_range: IntakeAnalysisResult["suggested_price_range"];
  info_completeness: IntakeAnalysisResult["info_completeness"];
  confidence: IntakeAnalysisResult["confidence"];
};

export type FollowUpCandidateInput = {
  recommended_action: IntakeAnalysisResult["recommended_action"];
  next_step: IntakeAnalysisResult["next_step"];
  missing_fields: IntakeAnalysisResult["missing_fields"];
  phone_present: boolean;
};

export type WorkflowCandidateInput = {
  lead_id: string;
  urgency: string;
  info_completeness: IntakeAnalysisResult["info_completeness"];
  guidance_highlight: string | null;
};

export type DownstreamCandidate<TInput> = SuggestionGuardrails & {
  module: "estimate" | "follow_up" | "workflow";
  availability: HandoffAvailability;
  unavailable_reason: string | null;
  input: TInput | null;
};

export type InternalActionHandoffModel = {
  model_version: "phase3-step3-handoff-v1";
  generated_at: string;
  source: {
    lead_id: string;
    analysis_available: boolean;
    guidance_available: boolean;
    analysis_version: string | null;
  };
  estimate_candidate: DownstreamCandidate<EstimateCandidateInput>;
  follow_up_candidate: DownstreamCandidate<FollowUpCandidateInput>;
  workflow_candidate: DownstreamCandidate<WorkflowCandidateInput>;
};

function unavailableCandidate<TInput>(
  module: DownstreamCandidate<TInput>["module"],
  reason: string,
): DownstreamCandidate<TInput> {
  return {
    module,
    suggestion_only: true,
    requires_human_confirmation: true,
    auto_executed: false,
    availability: "unavailable",
    unavailable_reason: reason,
    input: null,
  };
}

export function buildInternalActionHandoff(params: {
  lead: Pick<StoredLead, "id" | "urgency" | "phone">;
  analysis: IntakeAnalysisResult | null;
  guidance: OperatorGuidanceViewModel | null;
  nowIso?: string;
}): InternalActionHandoffModel {
  const { lead, analysis, guidance } = params;
  const nowIso = params.nowIso || new Date().toISOString();

  if (!analysis) {
    const reason = "analysis_unavailable";
    return {
      model_version: "phase3-step3-handoff-v1",
      generated_at: nowIso,
      source: {
        lead_id: lead.id,
        analysis_available: false,
        guidance_available: false,
        analysis_version: null,
      },
      estimate_candidate: unavailableCandidate("estimate", reason),
      follow_up_candidate: unavailableCandidate("follow_up", reason),
      workflow_candidate: unavailableCandidate("workflow", reason),
    };
  }

  return {
    model_version: "phase3-step3-handoff-v1",
    generated_at: nowIso,
    source: {
      lead_id: lead.id,
      analysis_available: true,
      guidance_available: !!guidance,
      analysis_version: analysis.analysis_version,
    },
    estimate_candidate: {
      module: "estimate",
      suggestion_only: true,
      requires_human_confirmation: true,
      auto_executed: false,
      availability: "available",
      unavailable_reason: null,
      input: {
        issue_classification: analysis.issue_classification,
        suggested_price_range: analysis.suggested_price_range,
        info_completeness: analysis.info_completeness,
        confidence: analysis.confidence,
      },
    },
    follow_up_candidate: {
      module: "follow_up",
      suggestion_only: true,
      requires_human_confirmation: true,
      auto_executed: false,
      availability: "available",
      unavailable_reason: null,
      input: {
        recommended_action: analysis.recommended_action,
        next_step: analysis.next_step,
        missing_fields: analysis.missing_fields,
        phone_present: !!lead.phone?.trim(),
      },
    },
    workflow_candidate: {
      module: "workflow",
      suggestion_only: true,
      requires_human_confirmation: true,
      auto_executed: false,
      availability: "available",
      unavailable_reason: null,
      input: {
        lead_id: lead.id,
        urgency: lead.urgency,
        info_completeness: analysis.info_completeness,
        guidance_highlight: guidance?.highlight || null,
      },
    },
  };
}
