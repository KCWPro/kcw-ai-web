import type { ControlledSubmissionContract } from "./controlledSubmissionContract";
import type { DecisionSurfaceCategory, InternalWorkflowDecisionSurfaceViewModel } from "./internalWorkflowDecisionSurface";

export type ApprovalCheckpointState =
  | "unavailable"
  | "available_for_review"
  | "review_required"
  | "conditionally_ready"
  | "not_applicable";

export type ApprovalCheckpointKey =
  | "checkpoint_manual_confirmation_receipt"
  | "checkpoint_readiness_alignment"
  | "checkpoint_non_executing_boundary";

export type ApprovalCheckpointItem = {
  key: ApprovalCheckpointKey;
  label: string;
  description: string;
  visible: boolean;
  state: ApprovalCheckpointState;
  rationale: string;
  dependency_summary: string[];
  non_executing_notice: string;
};

export type ApprovalCheckpointContractInput = {
  decision_status: InternalWorkflowDecisionSurfaceViewModel["decision_status"];
  selected_path_category: DecisionSurfaceCategory;
  manual_confirmation_received: boolean;
  controlled_submission_status: ControlledSubmissionContract["status"];
  controlled_submission_gate_state: ControlledSubmissionContract["gate_state"];
  has_blocking_risk: boolean;
};

export type ApprovalCheckpointContract = {
  contract_version: "phase7-step2-approval-checkpoint-v1";
  mode: "read_only_non_executing_skeleton";
  checkpoints: ApprovalCheckpointItem[];
  summary: {
    overall_state: "checkpoint_unavailable" | "checkpoint_review_required" | "checkpoint_ready_for_review";
    note: string;
  };
  compatibility_assertions: {
    readiness_is_not_execution: true;
    checkpoint_is_not_approval_completion: true;
    manual_confirmation_is_not_approval_completion: true;
    gate_allowed_is_not_execution: true;
  };
  execution_boundary: {
    approval_completion_state: "not_completed";
    approval_actions_available: false;
    submission_triggered: false;
    executed: false;
    external_side_effects: "none";
    persistence_performed: false;
    automation_not_implemented: true;
  };
};

function deriveManualConfirmationCheckpoint(input: ApprovalCheckpointContractInput): ApprovalCheckpointItem {
  if (input.selected_path_category !== "human_confirmed_path") {
    return {
      key: "checkpoint_manual_confirmation_receipt",
      label: "Manual confirmation receipt checkpoint",
      description: "Visibility for manual confirmation receipt on human_confirmed_path only.",
      visible: true,
      state: "unavailable",
      rationale: "Selected path is not human_confirmed_path; checkpoint cannot be reviewed.",
      dependency_summary: ["selected_path_category must be human_confirmed_path"],
      non_executing_notice: "Checkpoint visibility only. No approval action is executed.",
    };
  }

  if (input.manual_confirmation_received) {
    return {
      key: "checkpoint_manual_confirmation_receipt",
      label: "Manual confirmation receipt checkpoint",
      description: "Manual confirmation receipt is present for review semantics.",
      visible: true,
      state: "conditionally_ready",
      rationale: "Manual confirmation receipt exists, but this is not approval completion.",
      dependency_summary: ["manual_confirmation_received=true"],
      non_executing_notice: "Conditionally ready means review semantics only, not approval grant.",
    };
  }

  return {
    key: "checkpoint_manual_confirmation_receipt",
    label: "Manual confirmation receipt checkpoint",
    description: "Manual confirmation receipt is required before checkpoint can be considered conditionally ready.",
    visible: true,
    state: "available_for_review",
    rationale: "Manual confirmation receipt is missing.",
    dependency_summary: ["manual_confirmation_received=true"],
    non_executing_notice: "Checkpoint review does not dispatch approval requests.",
  };
}

function deriveReadinessAlignmentCheckpoint(input: ApprovalCheckpointContractInput): ApprovalCheckpointItem {
  if (input.selected_path_category !== "human_confirmed_path") {
    return {
      key: "checkpoint_readiness_alignment",
      label: "Readiness and gate alignment checkpoint",
      description: "Controlled submission readiness/gate alignment visibility for human_confirmed_path.",
      visible: true,
      state: "not_applicable",
      rationale: "Suggestion-only and automation-boundary paths do not enter approval checkpoint derivation.",
      dependency_summary: ["human_confirmed_path selection"],
      non_executing_notice: "Not applicable is a semantic output only.",
    };
  }

  if (input.decision_status === "blocked" || input.has_blocking_risk || input.controlled_submission_gate_state === "blocked") {
    return {
      key: "checkpoint_readiness_alignment",
      label: "Readiness and gate alignment checkpoint",
      description: "Review whether readiness/gate constraints are blocking checkpoint visibility.",
      visible: true,
      state: "review_required",
      rationale: "Blocked or risk guardrail is active; checkpoint requires review and recovery.",
      dependency_summary: ["decision_status!=blocked", "has_blocking_risk=false", "gate_state!=blocked"],
      non_executing_notice: "Review-required does not trigger execution or status transitions.",
    };
  }

  if (
    input.controlled_submission_status === "submission_ready" &&
    input.controlled_submission_gate_state === "allowed" &&
    input.decision_status === "ready_for_manual_progress"
  ) {
    return {
      key: "checkpoint_readiness_alignment",
      label: "Readiness and gate alignment checkpoint",
      description: "Readiness and gate are aligned for read-only checkpoint interpretation.",
      visible: true,
      state: "conditionally_ready",
      rationale: "Readiness/gate alignment is present, but this is still not approval completion or submission execution.",
      dependency_summary: ["submission_ready", "gate_state=allowed", "decision_status=ready_for_manual_progress"],
      non_executing_notice: "Conditionally ready is semantic only; no submit/approve action is available.",
    };
  }

  return {
    key: "checkpoint_readiness_alignment",
    label: "Readiness and gate alignment checkpoint",
    description: "Readiness exists but still needs manual semantic review before any future approval design.",
    visible: true,
    state: "available_for_review",
    rationale: "Readiness/gate signals are present but not fully aligned for conditionally-ready semantics.",
    dependency_summary: ["controlled_submission_status", "controlled_submission_gate_state", "decision_status"],
    non_executing_notice: "Available-for-review does not mean approved, submitted, or executed.",
  };
}

function deriveBoundaryCheckpoint(): ApprovalCheckpointItem {
  return {
    key: "checkpoint_non_executing_boundary",
    label: "Non-executing boundary checkpoint",
    description: "Persistent reminder that the approval checkpoint contract is read-only and non-executing.",
    visible: true,
    state: "available_for_review",
    rationale: "Boundary checkpoint remains visible in all scenarios.",
    dependency_summary: ["read-only", "non-executing", "no persistence", "no external side effect"],
    non_executing_notice: "Checkpoint contract skeleton does not run approval workflow or submission.",
  };
}

export function buildApprovalCheckpointContract(input: ApprovalCheckpointContractInput): ApprovalCheckpointContract {
  const checkpoints = [
    deriveManualConfirmationCheckpoint(input),
    deriveReadinessAlignmentCheckpoint(input),
    deriveBoundaryCheckpoint(),
  ];

  const hasUnavailable = checkpoints.some((item) => item.state === "unavailable");
  const hasReviewRequired = checkpoints.some((item) => item.state === "review_required");

  const summary = hasUnavailable
    ? {
        overall_state: "checkpoint_unavailable" as const,
        note: "Approval checkpoint contract is unavailable for non-human-confirmed path selection.",
      }
    : hasReviewRequired
      ? {
          overall_state: "checkpoint_review_required" as const,
          note: "Approval checkpoint contract needs review due to blocked/risk/readiness guardrails.",
        }
      : {
          overall_state: "checkpoint_ready_for_review" as const,
          note: "Approval checkpoint contract is available for read-only semantic review.",
        };

  return {
    contract_version: "phase7-step2-approval-checkpoint-v1",
    mode: "read_only_non_executing_skeleton",
    checkpoints,
    summary,
    compatibility_assertions: {
      readiness_is_not_execution: true,
      checkpoint_is_not_approval_completion: true,
      manual_confirmation_is_not_approval_completion: true,
      gate_allowed_is_not_execution: true,
    },
    execution_boundary: {
      approval_completion_state: "not_completed",
      approval_actions_available: false,
      submission_triggered: false,
      executed: false,
      external_side_effects: "none",
      persistence_performed: false,
      automation_not_implemented: true,
    },
  };
}
