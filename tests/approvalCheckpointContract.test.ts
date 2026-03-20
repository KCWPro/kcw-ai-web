import assert from "node:assert/strict";
import { buildApprovalCheckpointContract } from "../lib/approvalCheckpointContract";

function run() {
  const unavailable = buildApprovalCheckpointContract({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "suggestion_only",
    manual_confirmation_received: true,
    controlled_submission_status: "not_eligible",
    controlled_submission_gate_state: "not_eligible",
    has_blocking_risk: false,
  });

  assert.equal(unavailable.summary.overall_state, "checkpoint_unavailable");
  assert.equal(unavailable.checkpoints[0].state, "unavailable");
  assert.equal(unavailable.checkpoints[1].state, "not_applicable");
  assert.equal(unavailable.compatibility_assertions.readiness_is_not_execution, true);
  assert.equal(unavailable.compatibility_assertions.checkpoint_is_not_approval_completion, true);
  assert.equal(unavailable.execution_boundary.persistence_performed, false);

  const availableReview = buildApprovalCheckpointContract({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "human_confirmed_path",
    manual_confirmation_received: false,
    controlled_submission_status: "needs_manual_confirmation",
    controlled_submission_gate_state: "confirmation_missing",
    has_blocking_risk: false,
  });

  assert.equal(availableReview.summary.overall_state, "checkpoint_ready_for_review");
  assert.equal(availableReview.checkpoints[0].state, "available_for_review");
  assert.equal(availableReview.execution_boundary.executed, false);
  assert.equal(availableReview.execution_boundary.submission_triggered, false);
  assert.doesNotMatch(JSON.stringify(availableReview), /approval_granted|completed_workflow/i);

  const readinessNotCompletion = buildApprovalCheckpointContract({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "human_confirmed_path",
    manual_confirmation_received: true,
    controlled_submission_status: "submission_ready",
    controlled_submission_gate_state: "allowed",
    has_blocking_risk: false,
  });

  const readinessCheckpoint = readinessNotCompletion.checkpoints.find((item) => item.key === "checkpoint_readiness_alignment");
  assert.equal(readinessCheckpoint?.state, "conditionally_ready");
  assert.equal(readinessNotCompletion.compatibility_assertions.checkpoint_is_not_approval_completion, true);
  assert.equal(readinessNotCompletion.execution_boundary.approval_completion_state, "not_completed");

  const manualConfirmedNotCompleted = buildApprovalCheckpointContract({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "human_confirmed_path",
    manual_confirmation_received: true,
    controlled_submission_status: "needs_manual_confirmation",
    controlled_submission_gate_state: "review_needed",
    has_blocking_risk: false,
  });

  assert.equal(manualConfirmedNotCompleted.checkpoints[0].state, "conditionally_ready");
  assert.equal(manualConfirmedNotCompleted.execution_boundary.approval_actions_available, false);
  assert.equal(manualConfirmedNotCompleted.compatibility_assertions.manual_confirmation_is_not_approval_completion, true);

  const reviewRequired = buildApprovalCheckpointContract({
    decision_status: "blocked",
    selected_path_category: "human_confirmed_path",
    manual_confirmation_received: true,
    controlled_submission_status: "blocked",
    controlled_submission_gate_state: "blocked",
    has_blocking_risk: true,
  });

  assert.equal(reviewRequired.summary.overall_state, "checkpoint_review_required");
  assert.equal(reviewRequired.checkpoints[1].state, "review_required");
  assert.equal(reviewRequired.compatibility_assertions.gate_allowed_is_not_execution, true);

  assert.equal(reviewRequired.execution_boundary.persistence_performed, false);
  assert.equal(reviewRequired.execution_boundary.external_side_effects, "none");
  assert.equal(reviewRequired.execution_boundary.automation_not_implemented, true);
  assert.equal(reviewRequired.execution_boundary.approval_completion_state, "not_completed");
  assert.doesNotMatch(JSON.stringify(reviewRequired), /executed_workflow|submission_executed|dispatch/i);

  console.log("approvalCheckpointContract tests passed");
}

run();
