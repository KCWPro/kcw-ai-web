import assert from "node:assert/strict";
import { evaluateControlledSubmissionGate } from "../lib/controlledSubmissionGate";

function run() {
  const confirmationMissing = evaluateControlledSubmissionGate({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "human_confirmed_path",
    selected_path_id: "path_follow_up_review",
    manual_confirmation_received: false,
    readiness_prerequisites_satisfied: true,
    has_blocking_risk: false,
    has_review_required_guardrail: false,
    path_available: true,
  });
  assert.equal(confirmationMissing.state, "confirmation_missing");
  assert.equal(confirmationMissing.allowed_for_submission_ready, false);
  assert.ok(confirmationMissing.reasons.some((item) => /Manual confirmation receipt is missing/i.test(item)));

  const allowed = evaluateControlledSubmissionGate({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "human_confirmed_path",
    selected_path_id: "path_follow_up_review",
    manual_confirmation_received: true,
    readiness_prerequisites_satisfied: true,
    has_blocking_risk: false,
    has_review_required_guardrail: false,
    path_available: true,
  });
  assert.equal(allowed.state, "allowed");
  assert.equal(allowed.allowed_for_submission_ready, true);

  const suggestionOnly = evaluateControlledSubmissionGate({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "suggestion_only",
    selected_path_id: "continuity_summary",
    manual_confirmation_received: true,
    readiness_prerequisites_satisfied: true,
    has_blocking_risk: false,
    has_review_required_guardrail: false,
    path_available: true,
  });
  assert.equal(suggestionOnly.state, "not_eligible");

  const blocked = evaluateControlledSubmissionGate({
    decision_status: "blocked",
    selected_path_category: "human_confirmed_path",
    selected_path_id: "path_follow_up_review",
    manual_confirmation_received: true,
    readiness_prerequisites_satisfied: true,
    has_blocking_risk: true,
    has_review_required_guardrail: true,
    path_available: false,
  });
  assert.equal(blocked.state, "blocked");

  assert.equal(allowed.non_executing_boundary.submitted, false);
  assert.equal(allowed.non_executing_boundary.no_side_effects, true);
  assert.equal(allowed.non_executing_boundary.allowed_is_not_execution, true);

  const pathNotAutoConfirm = evaluateControlledSubmissionGate({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "human_confirmed_path",
    selected_path_id: "path_follow_up_review",
    manual_confirmation_received: false,
    readiness_prerequisites_satisfied: true,
    has_blocking_risk: false,
    has_review_required_guardrail: false,
    path_available: true,
  });
  assert.equal(pathNotAutoConfirm.state, "confirmation_missing");
  assert.ok(pathNotAutoConfirm.reasons.length > 0);

  console.log("controlledSubmissionGate tests passed");
}

run();
