import type { IntakeAnalysisResult } from "./aiIntakeAnalysis";
import type { InternalActionHandoffModel } from "./internalActionHandoff";
import type { InternalEstimateDraft } from "./internalEstimateDraft";
import type { InternalFollowUpWorkflowSuggestion } from "./internalFollowUpWorkflowSuggestion";
import type { OperatorGuidanceViewModel } from "./internalOperatorGuidance";
import type { StoredLead } from "./internalLeadsStore";

export type WorkflowContinuityChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  detail: string;
};

export type InternalWorkflowContinuityViewModel = {
  model_version: "phase4-step1-workflow-continuity-v1";
  continuity_state: "ready_for_follow_up" | "needs_intake_completion" | "blocked";
  summary: string;
  next_operator_action: string;
  checklist: WorkflowContinuityChecklistItem[];
  risk_flags: string[];
};

export function buildInternalWorkflowContinuity(params: {
  lead: Pick<StoredLead, "id" | "status">;
  analysis: IntakeAnalysisResult | null;
  guidance: OperatorGuidanceViewModel | null;
  handoff: InternalActionHandoffModel;
  estimateDraft: InternalEstimateDraft | null;
  followUpSuggestion: InternalFollowUpWorkflowSuggestion;
}): InternalWorkflowContinuityViewModel {
  const { lead, analysis, guidance, handoff, estimateDraft, followUpSuggestion } = params;

  const checklist: WorkflowContinuityChecklistItem[] = [
    {
      id: "analysis_available",
      label: "AI intake analysis available",
      done: !!analysis,
      detail: analysis
        ? `confidence=${analysis.confidence.toFixed(2)}, completeness=${analysis.info_completeness}`
        : "Analysis unavailable. Retry analysis before downstream actions.",
    },
    {
      id: "handoff_ready",
      label: "Internal handoff candidate generated",
      done: handoff.follow_up_candidate.availability === "available" && handoff.workflow_candidate.availability === "available",
      detail:
        handoff.follow_up_candidate.availability === "available" && handoff.workflow_candidate.availability === "available"
          ? "Handoff candidates are available for operator review."
          : "Handoff unavailable because analysis is unavailable.",
    },
    {
      id: "estimate_draft_ready",
      label: "Estimate draft ready",
      done: estimateDraft?.availability === "available",
      detail:
        estimateDraft?.availability === "available"
          ? estimateDraft.service_summary
          : "Estimate draft unavailable. Manual estimate review required.",
    },
    {
      id: "follow_up_ready",
      label: "Follow-up/workflow suggestion ready",
      done: followUpSuggestion.availability === "available",
      detail:
        followUpSuggestion.availability === "available"
          ? followUpSuggestion.recommended_next_operator_action
          : "Follow-up suggestion unavailable until analysis recovers.",
    },
  ];

  const riskFlags = [...followUpSuggestion.risk_flags];
  if (!guidance) {
    riskFlags.push("guidance_unavailable");
  }
  if (lead.status === "closed") {
    riskFlags.push("lead_closed_read_only");
  }

  const hasAnalysis = !!analysis;
  const hasCompletenessGap = analysis?.info_completeness !== "sufficient";

  let continuityState: InternalWorkflowContinuityViewModel["continuity_state"] = "ready_for_follow_up";
  if (!hasAnalysis) {
    continuityState = "blocked";
  } else if (hasCompletenessGap) {
    continuityState = "needs_intake_completion";
  }

  const summaryByState: Record<InternalWorkflowContinuityViewModel["continuity_state"], string> = {
    ready_for_follow_up: "Intake-to-follow-up continuity is ready. Operator can proceed with reviewed next actions.",
    needs_intake_completion: "Continuity is partial. Fill missing intake fields before committing follow-up decisions.",
    blocked: "Continuity is blocked due to missing analysis. Collect intake context and rerun analysis first.",
  };

  const nextAction =
    followUpSuggestion.recommended_next_operator_action ||
    guidance?.highlight ||
    "Manually review lead context and define next operator action.";

  return {
    model_version: "phase4-step1-workflow-continuity-v1",
    continuity_state: continuityState,
    summary: summaryByState[continuityState],
    next_operator_action: nextAction,
    checklist,
    risk_flags: Array.from(new Set(riskFlags)),
  };
}
