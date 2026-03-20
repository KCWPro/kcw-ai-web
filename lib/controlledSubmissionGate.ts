import type { DecisionSurfaceCategory, InternalWorkflowDecisionSurfaceViewModel } from "./internalWorkflowDecisionSurface";

export type ControlledSubmissionGateState = "allowed" | "blocked" | "review_needed" | "confirmation_missing" | "not_eligible";

export type ControlledSubmissionGateInput = {
  decision_status: InternalWorkflowDecisionSurfaceViewModel["decision_status"];
  selected_path_category: DecisionSurfaceCategory;
  selected_path_id: string | null;
  manual_confirmation_received: boolean;
  readiness_prerequisites_satisfied: boolean;
  has_blocking_risk: boolean;
  has_review_required_guardrail: boolean;
  path_available: boolean;
};

export type ControlledSubmissionGateResult = {
  gate_version: "phase6-step4-manual-confirmation-gate-v1";
  state: ControlledSubmissionGateState;
  reasons: string[];
  selected_path_id: string | null;
  allowed_for_submission_ready: boolean;
  non_executing_boundary: {
    allowed_is_not_execution: true;
    no_side_effects: true;
    submitted: false;
  };
};

export function evaluateControlledSubmissionGate(input: ControlledSubmissionGateInput): ControlledSubmissionGateResult {
  const reasons: string[] = [];

  if (input.selected_path_category !== "human_confirmed_path") {
    reasons.push("Selected path is not human_confirmed_path; controlled submission gate is not eligible.");
    return {
      gate_version: "phase6-step4-manual-confirmation-gate-v1",
      state: "not_eligible",
      reasons,
      selected_path_id: input.selected_path_id,
      allowed_for_submission_ready: false,
      non_executing_boundary: {
        allowed_is_not_execution: true,
        no_side_effects: true,
        submitted: false,
      },
    };
  }

  if (input.decision_status === "blocked" || input.has_blocking_risk || !input.path_available) {
    reasons.push("Blocked guardrail: workflow is blocked or selected path is unavailable.");
    return {
      gate_version: "phase6-step4-manual-confirmation-gate-v1",
      state: "blocked",
      reasons,
      selected_path_id: input.selected_path_id,
      allowed_for_submission_ready: false,
      non_executing_boundary: {
        allowed_is_not_execution: true,
        no_side_effects: true,
        submitted: false,
      },
    };
  }

  if (input.decision_status === "needs_review" || input.has_review_required_guardrail) {
    reasons.push("Review-required guardrail: resolve review items before controlled submission readiness.");
    return {
      gate_version: "phase6-step4-manual-confirmation-gate-v1",
      state: "review_needed",
      reasons,
      selected_path_id: input.selected_path_id,
      allowed_for_submission_ready: false,
      non_executing_boundary: {
        allowed_is_not_execution: true,
        no_side_effects: true,
        submitted: false,
      },
    };
  }

  if (!input.manual_confirmation_received) {
    reasons.push("Manual confirmation receipt is missing.");
    return {
      gate_version: "phase6-step4-manual-confirmation-gate-v1",
      state: "confirmation_missing",
      reasons,
      selected_path_id: input.selected_path_id,
      allowed_for_submission_ready: false,
      non_executing_boundary: {
        allowed_is_not_execution: true,
        no_side_effects: true,
        submitted: false,
      },
    };
  }

  if (!input.readiness_prerequisites_satisfied) {
    reasons.push("Readiness prerequisites are not yet satisfied.");
    return {
      gate_version: "phase6-step4-manual-confirmation-gate-v1",
      state: "review_needed",
      reasons,
      selected_path_id: input.selected_path_id,
      allowed_for_submission_ready: false,
      non_executing_boundary: {
        allowed_is_not_execution: true,
        no_side_effects: true,
        submitted: false,
      },
    };
  }

  reasons.push("Gate allows submission-ready contract outcome after explicit manual confirmation and prerequisites.");
  return {
    gate_version: "phase6-step4-manual-confirmation-gate-v1",
    state: "allowed",
    reasons,
    selected_path_id: input.selected_path_id,
    allowed_for_submission_ready: true,
    non_executing_boundary: {
      allowed_is_not_execution: true,
      no_side_effects: true,
      submitted: false,
    },
  };
}
