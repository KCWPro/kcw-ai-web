import type { IntakeAnalysisResult } from "./aiIntakeAnalysis";
import type { InternalActionHandoffModel } from "./internalActionHandoff";
import type { InternalEstimateDraft } from "./internalEstimateDraft";
import type { InternalFollowUpWorkflowSuggestion } from "./internalFollowUpWorkflowSuggestion";
import type { OperatorGuidanceViewModel } from "./internalOperatorGuidance";
import type { InternalWorkflowContinuityViewModel } from "./internalWorkflowContinuity";

export type DecisionSurfaceCategory =
  | "suggestion_only"
  | "human_confirmed_path"
  | "not_yet_implemented_automation";

export type DecisionSurfaceSource = "analysis" | "guidance" | "handoff" | "estimate" | "follow_up" | "continuity";

export type DecisionSurfaceItemStatus = "ready" | "needs_review" | "blocked" | "not_available";

export type DecisionSurfaceItem = {
  id: string;
  label: string;
  category: DecisionSurfaceCategory;
  status: DecisionSurfaceItemStatus;
  detail: string;
  source: DecisionSurfaceSource;
};

export type InternalWorkflowDecisionSurfaceViewModel = {
  model_version: "phase5-step2-decision-surface-v1";
  decision_status: "ready_for_manual_progress" | "needs_review" | "blocked";
  decision_summary: string;
  suggestion_only_items: DecisionSurfaceItem[];
  human_confirmed_paths: DecisionSurfaceItem[];
  automation_boundary_notices: DecisionSurfaceItem[];
  next_manual_review_action: string;
  priority: "high" | "medium" | "low";
  review_notes: string[];
  risk_flags: string[];
  source_alignment_notes: string[];
};

export function buildInternalWorkflowDecisionSurface(params: {
  analysis: IntakeAnalysisResult | null;
  guidance: OperatorGuidanceViewModel | null;
  handoff: InternalActionHandoffModel;
  estimateDraft: InternalEstimateDraft | null;
  followUpSuggestion: InternalFollowUpWorkflowSuggestion;
  continuity: InternalWorkflowContinuityViewModel;
}): InternalWorkflowDecisionSurfaceViewModel {
  const { analysis, guidance, handoff, estimateDraft, followUpSuggestion, continuity } = params;

  const suggestionOnlyItems: DecisionSurfaceItem[] = [
    {
      id: "continuity_summary",
      label: "Workflow continuity summary",
      category: "suggestion_only",
      status:
        continuity.continuity_state === "blocked"
          ? "blocked"
          : continuity.continuity_state === "needs_intake_completion"
            ? "needs_review"
            : "ready",
      detail: continuity.summary,
      source: "continuity",
    },
    {
      id: "analysis_readiness",
      label: "AI intake analysis readiness",
      category: "suggestion_only",
      status: analysis ? "ready" : "blocked",
      detail: analysis
        ? `Analysis ${analysis.analysis_version} available. completeness=${analysis.info_completeness}; confidence=${analysis.confidence.toFixed(2)}.`
        : "Analysis unavailable; downstream suggestions remain read-only and require manual recovery.",
      source: "analysis",
    },
    {
      id: "operator_guidance",
      label: "Operator guidance highlight",
      category: "suggestion_only",
      status: guidance ? "ready" : "needs_review",
      detail:
        guidance?.highlight || "Guidance unavailable. Operator should manually review intake context and risk signals before proceeding.",
      source: "guidance",
    },
    {
      id: "handoff_snapshot",
      label: "Internal handoff snapshot",
      category: "suggestion_only",
      status: handoff.follow_up_candidate.availability === "available" ? "ready" : "not_available",
      detail:
        handoff.follow_up_candidate.availability === "available"
          ? "Handoff candidates are generated for estimate/follow-up/workflow as suggestion-only inputs."
          : `Handoff candidates unavailable (${handoff.follow_up_candidate.unavailable_reason || "unknown_reason"}).`,
      source: "handoff",
    },
    {
      id: "estimate_draft_snapshot",
      label: "Estimate draft suggestion",
      category: "suggestion_only",
      status: estimateDraft?.availability === "available" ? "ready" : "not_available",
      detail:
        estimateDraft?.availability === "available"
          ? estimateDraft.service_summary
          : "Estimate draft unavailable. Manual estimate review is required before any customer-facing quote action.",
      source: "estimate",
    },
    {
      id: "follow_up_snapshot",
      label: "Follow-up workflow suggestion",
      category: "suggestion_only",
      status: followUpSuggestion.availability === "available" ? "ready" : "not_available",
      detail:
        followUpSuggestion.availability === "available"
          ? followUpSuggestion.recommended_next_operator_action
          : `Follow-up suggestion unavailable (${followUpSuggestion.unavailable_reason || "unknown_reason"}).`,
      source: "follow_up",
    },
  ];

  const humanConfirmedPaths: DecisionSurfaceItem[] = [
    {
      id: "path_intake_quality_gate",
      label: "Confirm intake quality gate",
      category: "human_confirmed_path",
      status:
        continuity.continuity_state === "blocked"
          ? "blocked"
          : continuity.continuity_state === "needs_intake_completion"
            ? "needs_review"
            : "ready",
      detail:
        continuity.continuity_state === "blocked"
          ? "Cannot progress path. Recover analysis first, then re-evaluate manual handling order."
          : continuity.continuity_state === "needs_intake_completion"
            ? "Intake is partial. Human review must confirm/complete missing fields before follow-up decisions."
            : "Intake baseline is sufficient. Operator can manually confirm next handling path.",
      source: "continuity",
    },
    {
      id: "path_follow_up_review",
      label: "Review follow-up handling path",
      category: "human_confirmed_path",
      status:
        continuity.follow_up_alignment.alignment_status === "aligned" && followUpSuggestion.availability === "available"
          ? "ready"
          : continuity.continuity_state === "blocked"
            ? "blocked"
            : "needs_review",
      detail:
        continuity.follow_up_alignment.alignment_status === "aligned" && followUpSuggestion.availability === "available"
          ? "Follow-up suggestion is aligned with continuity. Operator may proceed with manual follow-up handling after confirmation."
          : continuity.follow_up_alignment.note,
      source: "follow_up",
    },
    {
      id: "path_estimate_review",
      label: "Review estimate preparation path",
      category: "human_confirmed_path",
      status:
        estimateDraft?.availability === "available"
          ? continuity.continuity_state === "ready_for_follow_up"
            ? "ready"
            : "needs_review"
          : continuity.continuity_state === "blocked"
            ? "blocked"
            : "not_available",
      detail:
        estimateDraft?.availability === "available"
          ? "Estimate draft is suggestion-only. Operator must manually confirm scope, assumptions, and final quote action."
          : "Estimate draft not available. Do not interpret this as executed quote flow; keep manual estimation pending.",
      source: "estimate",
    },
  ];

  const automationBoundaryNotices: DecisionSurfaceItem[] = [
    {
      id: "automation_contact_customer",
      label: "Automatic customer contact",
      category: "not_yet_implemented_automation",
      status: "not_available",
      detail: "Not implemented. Customer contact remains manual and operator-confirmed.",
      source: "follow_up",
    },
    {
      id: "automation_status_progression",
      label: "Automatic status progression",
      category: "not_yet_implemented_automation",
      status: "not_available",
      detail: "Not implemented. Lead status updates must remain manual.",
      source: "continuity",
    },
    {
      id: "automation_task_creation",
      label: "Automatic task creation",
      category: "not_yet_implemented_automation",
      status: "not_available",
      detail: "Not implemented. Internal task orchestration is future work.",
      source: "handoff",
    },
    {
      id: "automation_quote_writeback",
      label: "Automatic quote write/send",
      category: "not_yet_implemented_automation",
      status: "not_available",
      detail: "Not implemented. Quote persistence and sending require manual process.",
      source: "estimate",
    },
  ];

  let decisionStatus: InternalWorkflowDecisionSurfaceViewModel["decision_status"] = "ready_for_manual_progress";
  if (continuity.continuity_state === "blocked") {
    decisionStatus = "blocked";
  } else if (
    continuity.continuity_state === "needs_intake_completion" ||
    continuity.follow_up_alignment.alignment_status === "needs_review"
  ) {
    decisionStatus = "needs_review";
  }

  const decisionSummaryByStatus: Record<InternalWorkflowDecisionSurfaceViewModel["decision_status"], string> = {
    ready_for_manual_progress:
      "Decision surface is ready for manual progression. Suggestions are available, and operator can choose a human-confirmed path.",
    needs_review:
      "Decision surface requires manual review. Keep handling review-oriented and do not treat suggestions as executed workflow.",
    blocked: "Decision surface is blocked due to missing analysis continuity prerequisites. Recover analysis before downstream handling.",
  };

  const reviewNotes: string[] = [
    "All items in this model are read-only representations.",
    "human_confirmed_path entries describe manual handling paths, not executed actions.",
    "not_yet_implemented_automation entries are explicit boundaries and remain unavailable.",
  ];

  const sourceAlignmentNotes = [
    `continuity_state=${continuity.continuity_state}`,
    `follow_up_alignment=${continuity.follow_up_alignment.alignment_status}`,
    `follow_up_availability=${followUpSuggestion.availability}`,
    `estimate_availability=${estimateDraft?.availability || "unavailable"}`,
  ];

  const riskFlags = Array.from(
    new Set([
      ...continuity.risk_flags,
      ...followUpSuggestion.risk_flags,
      ...(continuity.follow_up_alignment.alignment_status === "needs_review" ? ["decision_surface_alignment_needs_review"] : []),
      ...(decisionStatus === "blocked" ? ["decision_surface_blocked"] : []),
    ]),
  );

  const nextManualReviewAction =
    decisionStatus === "blocked"
      ? "Recover analysis availability and rerun decision surface inputs before manual downstream handling."
      : decisionStatus === "needs_review"
        ? "Manually verify intake completeness/alignment, then confirm one human handling path."
        : continuity.next_operator_action;

  const priority: InternalWorkflowDecisionSurfaceViewModel["priority"] =
    decisionStatus === "blocked" ? "high" : decisionStatus === "needs_review" ? "medium" : "low";

  return {
    model_version: "phase5-step2-decision-surface-v1",
    decision_status: decisionStatus,
    decision_summary: decisionSummaryByStatus[decisionStatus],
    suggestion_only_items: suggestionOnlyItems,
    human_confirmed_paths: humanConfirmedPaths,
    automation_boundary_notices: automationBoundaryNotices,
    next_manual_review_action: nextManualReviewAction,
    priority,
    review_notes: reviewNotes,
    risk_flags: riskFlags,
    source_alignment_notes: sourceAlignmentNotes,
  };
}
