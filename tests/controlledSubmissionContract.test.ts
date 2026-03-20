import assert from "node:assert/strict";
import { buildControlledSubmissionContract } from "../lib/controlledSubmissionContract";

function run() {
  const humanConfirmedButInsufficient = buildControlledSubmissionContract({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "human_confirmed_path",
    selected_path_id: "path_follow_up_review",
    manual_confirmation_received: true,
    intake_quality_gate_passed: false,
    follow_up_alignment_status: "aligned",
    path_availability: "available",
    has_blocking_risk: false,
  });

  assert.equal(humanConfirmedButInsufficient.status, "needs_manual_confirmation");
  assert.equal(humanConfirmedButInsufficient.gate_state, "review_needed");
  assert.ok(humanConfirmedButInsufficient.gate_reasons.some((item) => /Readiness prerequisites are not yet satisfied/i.test(item)));
  assert.ok(
    humanConfirmedButInsufficient.missing_requirements.some((item) => /Intake quality gate must pass/i.test(item)),
  );

  const manualConfirmedAndReady = buildControlledSubmissionContract({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "human_confirmed_path",
    selected_path_id: "path_follow_up_review",
    manual_confirmation_received: true,
    intake_quality_gate_passed: true,
    follow_up_alignment_status: "aligned",
    path_availability: "available",
    has_blocking_risk: false,
  });

  assert.equal(manualConfirmedAndReady.status, "submission_ready");
  assert.equal(manualConfirmedAndReady.gate_state, "allowed");
  assert.ok(manualConfirmedAndReady.reasons.some((item) => /explicit manual confirmation/i.test(item)));

  const suggestionOnly = buildControlledSubmissionContract({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "suggestion_only",
    selected_path_id: "continuity_summary",
    manual_confirmation_received: true,
    intake_quality_gate_passed: true,
    follow_up_alignment_status: "aligned",
    path_availability: "available",
    has_blocking_risk: false,
  });

  assert.equal(suggestionOnly.status, "not_eligible");
  assert.equal(suggestionOnly.gate_state, "not_eligible");
  assert.ok(suggestionOnly.missing_requirements.some((item) => /human_confirmed_path/i.test(item)));

  const blockedPath = buildControlledSubmissionContract({
    decision_status: "blocked",
    selected_path_category: "human_confirmed_path",
    selected_path_id: "path_follow_up_review",
    manual_confirmation_received: true,
    intake_quality_gate_passed: true,
    follow_up_alignment_status: "needs_review",
    path_availability: "unavailable",
    has_blocking_risk: true,
  });

  assert.equal(blockedPath.status, "blocked");
  assert.equal(blockedPath.gate_state, "blocked");
  assert.ok(blockedPath.blockers.length > 0);
  assert.ok(blockedPath.missing_requirements.some((item) => /aligned/i.test(item)));

  const confirmationMissing = buildControlledSubmissionContract({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "human_confirmed_path",
    selected_path_id: "path_follow_up_review",
    manual_confirmation_received: false,
    intake_quality_gate_passed: true,
    follow_up_alignment_status: "aligned",
    path_availability: "available",
    has_blocking_risk: false,
  });
  assert.equal(confirmationMissing.status, "needs_manual_confirmation");
  assert.equal(confirmationMissing.gate_state, "confirmation_missing");
  assert.ok(confirmationMissing.gate_reasons.some((item) => /missing/i.test(item)));

  assert.equal(manualConfirmedAndReady.automation_boundary.automation_not_implemented, true);
  assert.equal(manualConfirmedAndReady.automation_boundary.auto_execution_enabled, false);
  assert.equal(manualConfirmedAndReady.automation_boundary.submission_effect_state, "no_side_effect");
  assert.equal(manualConfirmedAndReady.automation_boundary.submitted, false);
  assert.equal(manualConfirmedAndReady.automation_boundary.readiness_is_not_submission, true);

  assert.equal(manualConfirmedAndReady.automation_boundary.submitted, false);

  console.log("controlledSubmissionContract tests passed");
}

run();
