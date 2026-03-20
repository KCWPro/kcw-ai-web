import assert from "node:assert/strict";
import { buildControlledSubmissionContract } from "../lib/controlledSubmissionContract";

function run() {
  const humanConfirmedButInsufficient = buildControlledSubmissionContract({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "human_confirmed_path",
    selected_path_id: "path_follow_up_review",
    human_confirmation_received: true,
    intake_quality_gate_passed: false,
    follow_up_alignment_status: "aligned",
    path_availability: "available",
    has_blocking_risk: false,
  });

  assert.equal(humanConfirmedButInsufficient.status, "needs_manual_confirmation");
  assert.ok(
    humanConfirmedButInsufficient.missing_requirements.some((item) => /Intake quality gate must pass/i.test(item)),
  );

  const humanConfirmedAndReady = buildControlledSubmissionContract({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "human_confirmed_path",
    selected_path_id: "path_follow_up_review",
    human_confirmation_received: true,
    intake_quality_gate_passed: true,
    follow_up_alignment_status: "aligned",
    path_availability: "available",
    has_blocking_risk: false,
  });

  assert.equal(humanConfirmedAndReady.status, "submission_ready");
  assert.ok(humanConfirmedAndReady.reasons.some((item) => /prerequisites are satisfied/i.test(item)));

  const suggestionOnly = buildControlledSubmissionContract({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "suggestion_only",
    selected_path_id: "continuity_summary",
    human_confirmation_received: true,
    intake_quality_gate_passed: true,
    follow_up_alignment_status: "aligned",
    path_availability: "available",
    has_blocking_risk: false,
  });

  assert.equal(suggestionOnly.status, "not_eligible");
  assert.ok(suggestionOnly.missing_requirements.some((item) => /human_confirmed_path/i.test(item)));

  const blockedPath = buildControlledSubmissionContract({
    decision_status: "blocked",
    selected_path_category: "human_confirmed_path",
    selected_path_id: "path_follow_up_review",
    human_confirmation_received: true,
    intake_quality_gate_passed: true,
    follow_up_alignment_status: "needs_review",
    path_availability: "unavailable",
    has_blocking_risk: true,
  });

  assert.equal(blockedPath.status, "blocked");
  assert.ok(blockedPath.blockers.length > 0);
  assert.ok(blockedPath.missing_requirements.some((item) => /aligned/i.test(item)));

  assert.equal(humanConfirmedAndReady.automation_boundary.automation_not_implemented, true);
  assert.equal(humanConfirmedAndReady.automation_boundary.auto_execution_enabled, false);
  assert.equal(humanConfirmedAndReady.automation_boundary.submission_effect_state, "no_side_effect");
  assert.equal(humanConfirmedAndReady.automation_boundary.submitted, false);
  assert.equal(humanConfirmedAndReady.automation_boundary.readiness_is_not_submission, true);

  assert.notEqual(humanConfirmedAndReady.status, "blocked");
  assert.equal(humanConfirmedAndReady.automation_boundary.submitted, false);

  console.log("controlledSubmissionContract tests passed");
}

run();
