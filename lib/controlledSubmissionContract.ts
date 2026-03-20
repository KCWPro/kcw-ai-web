import type { DecisionSurfaceCategory, InternalWorkflowDecisionSurfaceViewModel } from "./internalWorkflowDecisionSurface";

export type ControlledSubmissionDerivedStatus =
  | "not_eligible"
  | "needs_manual_confirmation"
  | "submission_ready"
  | "blocked";

export type ControlledSubmissionReadinessInput = {
  decision_status: InternalWorkflowDecisionSurfaceViewModel["decision_status"];
  selected_path_category: DecisionSurfaceCategory;
  selected_path_id: string | null;
  human_confirmation_received: boolean;
  intake_quality_gate_passed: boolean;
  follow_up_alignment_status: "aligned" | "needs_review";
  path_availability: "available" | "unavailable";
  has_blocking_risk: boolean;
};

export type ControlledSubmissionAutomationBoundary = {
  automation_not_implemented: true;
  auto_execution_enabled: false;
  submission_effect_state: "no_side_effect";
  submitted: false;
  readiness_is_not_submission: true;
  readiness_requires_manual_execution_step: true;
};

export type ControlledSubmissionContract = {
  contract_version: "phase6-step2-controlled-submission-v1";
  status: ControlledSubmissionDerivedStatus;
  reasons: string[];
  blockers: string[];
  missing_requirements: string[];
  selected_path_id: string | null;
  manual_confirmation_required: boolean;
  automation_boundary: ControlledSubmissionAutomationBoundary;
};

export function buildControlledSubmissionContract(input: ControlledSubmissionReadinessInput): ControlledSubmissionContract {
  const reasons: string[] = [];
  const blockers: string[] = [];
  const missingRequirements: string[] = [];

  if (input.selected_path_category !== "human_confirmed_path") {
    reasons.push("Only human_confirmed_path can enter controlled submission readiness evaluation.");
    if (input.selected_path_category === "suggestion_only") {
      missingRequirements.push("Select a human_confirmed_path instead of suggestion_only.");
    }
  }

  if (input.decision_status === "blocked" || input.has_blocking_risk) {
    blockers.push("Workflow is blocked; recover prerequisites before controlled submission readiness.");
  }

  if (input.decision_status === "needs_review") {
    missingRequirements.push("Decision surface still needs manual review before controlled submission readiness.");
  }

  if (!input.human_confirmation_received) {
    missingRequirements.push("Manual confirmation is required before controlled submission readiness.");
  }

  if (!input.intake_quality_gate_passed) {
    missingRequirements.push("Intake quality gate must pass before controlled submission readiness.");
  }

  if (input.follow_up_alignment_status !== "aligned") {
    missingRequirements.push("Follow-up alignment must be aligned before controlled submission readiness.");
  }

  if (input.path_availability !== "available") {
    missingRequirements.push("Selected human_confirmed_path must be available before controlled submission readiness.");
  }

  let status: ControlledSubmissionDerivedStatus = "needs_manual_confirmation";

  if (blockers.length > 0) {
    status = "blocked";
  } else if (input.selected_path_category !== "human_confirmed_path") {
    status = "not_eligible";
  } else if (
    input.decision_status === "ready_for_manual_progress" &&
    input.human_confirmation_received &&
    input.intake_quality_gate_passed &&
    input.follow_up_alignment_status === "aligned" &&
    input.path_availability === "available"
  ) {
    status = "submission_ready";
    reasons.push("Controlled submission prerequisites are satisfied after human confirmation.");
  }

  if (status !== "submission_ready" && reasons.length === 0) {
    reasons.push("Controlled submission is not ready; keep manual review/confirmation flow.");
  }

  return {
    contract_version: "phase6-step2-controlled-submission-v1",
    status,
    reasons,
    blockers,
    missing_requirements: missingRequirements,
    selected_path_id: input.selected_path_id,
    manual_confirmation_required: !input.human_confirmation_received,
    automation_boundary: {
      automation_not_implemented: true,
      auto_execution_enabled: false,
      submission_effect_state: "no_side_effect",
      submitted: false,
      readiness_is_not_submission: true,
      readiness_requires_manual_execution_step: true,
    },
  };
}
