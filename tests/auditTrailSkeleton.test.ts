import assert from "node:assert/strict";
import { buildApprovalCheckpointContract } from "../lib/approvalCheckpointContract";
import { buildAuditTrailSkeleton } from "../lib/auditTrailSkeleton";

function run() {
  const checkpoint = buildApprovalCheckpointContract({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "human_confirmed_path",
    manual_confirmation_received: false,
    controlled_submission_status: "needs_manual_confirmation",
    controlled_submission_gate_state: "confirmation_missing",
    has_blocking_risk: false,
  });

  const trail = buildAuditTrailSkeleton({
    selected_path_category: "human_confirmed_path",
    decision_status: "ready_for_manual_progress",
    controlled_submission_status: "needs_manual_confirmation",
    controlled_submission_gate_state: "confirmation_missing",
    manual_confirmation_received: false,
    approval_checkpoint_contract: checkpoint,
  });

  assert.equal(trail.trail_version, "phase7-step3-audit-trail-skeleton-v1");
  assert.equal(trail.event_count, 6);
  assert.equal(trail.boundary_flags.non_persistent, true);
  assert.equal(trail.boundary_flags.persistence_performed, false);
  assert.equal(trail.boundary_flags.system_of_record, false);
  assert.equal(trail.boundary_flags.compliance_audit_platform, false);
  assert.equal(trail.boundary_flags.submitted, false);
  assert.equal(trail.boundary_flags.executed, false);

  const markers = trail.events.map((item) => item.derived_marker);
  assert.deepEqual(markers, ["derived_seq_1", "derived_seq_2", "derived_seq_3", "derived_seq_4", "derived_seq_5", "derived_seq_6"]);
  assert.ok(trail.events.every((item) => item.boundary_note.length > 0));
  assert.ok(trail.summary.note.includes("No persistence"));
  assert.ok(trail.events.some((item) => item.category === "boundary_asserted"));

  const blockedCheckpoint = buildApprovalCheckpointContract({
    decision_status: "blocked",
    selected_path_category: "human_confirmed_path",
    manual_confirmation_received: true,
    controlled_submission_status: "blocked",
    controlled_submission_gate_state: "blocked",
    has_blocking_risk: true,
  });

  const blockedTrail = buildAuditTrailSkeleton({
    selected_path_category: "human_confirmed_path",
    decision_status: "blocked",
    controlled_submission_status: "blocked",
    controlled_submission_gate_state: "blocked",
    manual_confirmation_received: true,
    approval_checkpoint_contract: blockedCheckpoint,
  });

  assert.equal(blockedTrail.latest_state_hint, "review_focus");
  assert.ok(blockedTrail.events.some((item) => item.state === "review_oriented"));
  assert.ok(blockedTrail.events.some((item) => item.category === "boundary_asserted"));

  const suggestionCheckpoint = buildApprovalCheckpointContract({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "suggestion_only",
    manual_confirmation_received: true,
    controlled_submission_status: "not_eligible",
    controlled_submission_gate_state: "not_eligible",
    has_blocking_risk: false,
  });

  const suggestionTrail = buildAuditTrailSkeleton({
    selected_path_category: "suggestion_only",
    decision_status: "ready_for_manual_progress",
    controlled_submission_status: "not_eligible",
    controlled_submission_gate_state: "not_eligible",
    manual_confirmation_received: true,
    approval_checkpoint_contract: suggestionCheckpoint,
  });

  assert.equal(suggestionTrail.latest_state_hint, "eligibility_outside_scope");
  assert.equal(suggestionTrail.boundary_flags.executed, false);
  assert.equal(suggestionTrail.boundary_flags.submitted, false);
  assert.equal(suggestionTrail.boundary_flags.external_write_performed, false);
  assert.doesNotMatch(JSON.stringify(suggestionTrail), /completed_workflow|execution_log_sink/i);
  assert.doesNotMatch(JSON.stringify(suggestionTrail), /official audit record|persisted production audit system/i);

  const pathEvent = suggestionTrail.events.find((item) => item.category === "path_selected");
  assert.equal(pathEvent?.state, "boundary_only");

  console.log("auditTrailSkeleton tests passed");
}

run();
