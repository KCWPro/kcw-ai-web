import assert from "node:assert/strict";
import { buildBoundedWritePathContract } from "../lib/boundedWritePathContract";

function run() {
  const notEligible = buildBoundedWritePathContract({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "suggestion_only",
    controlled_submission_status: "not_eligible",
    controlled_submission_gate_state: "not_eligible",
    approval_checkpoint_overall_state: "checkpoint_unavailable",
    audit_trail_latest_state_hint: "eligibility_outside_scope",
    has_blocking_risk: false,
    dry_run_requested: true,
  });

  assert.equal(notEligible.status, "not_eligible");
  assert.ok(notEligible.missing_requirements.some((item) => /human_confirmed_path/i.test(item)));

  const reviewRequired = buildBoundedWritePathContract({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "human_confirmed_path",
    controlled_submission_status: "needs_manual_confirmation",
    controlled_submission_gate_state: "review_needed",
    approval_checkpoint_overall_state: "checkpoint_ready_for_review",
    audit_trail_latest_state_hint: "read_only_alignment",
    has_blocking_risk: false,
    dry_run_requested: true,
  });

  assert.equal(reviewRequired.status, "review_required");
  assert.ok(reviewRequired.reasons.some((item) => /Controlled submission semantics are not aligned/i.test(item)));

  const boundaryBlocked = buildBoundedWritePathContract({
    decision_status: "blocked",
    selected_path_category: "human_confirmed_path",
    controlled_submission_status: "blocked",
    controlled_submission_gate_state: "blocked",
    approval_checkpoint_overall_state: "checkpoint_review_required",
    audit_trail_latest_state_hint: "review_focus",
    has_blocking_risk: true,
    dry_run_requested: false,
  });

  assert.equal(boundaryBlocked.status, "boundary_blocked");
  assert.ok(boundaryBlocked.blockers.some((item) => /Boundary blocked/i.test(item)));

  const dryRunOnly = buildBoundedWritePathContract({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "human_confirmed_path",
    controlled_submission_status: "submission_ready",
    controlled_submission_gate_state: "allowed",
    approval_checkpoint_overall_state: "checkpoint_ready_for_review",
    audit_trail_latest_state_hint: "read_only_alignment",
    has_blocking_risk: false,
    dry_run_requested: true,
  });

  assert.equal(dryRunOnly.status, "dry_run_only");
  assert.equal(dryRunOnly.safety_boundary.persistence_performed, false);
  assert.equal(dryRunOnly.safety_boundary.external_write_performed, false);
  assert.equal(dryRunOnly.safety_boundary.mutation_committed, false);
  assert.equal(dryRunOnly.safety_boundary.system_of_record_updated, false);
  assert.equal(dryRunOnly.safety_boundary.rollback_not_implemented, true);
  assert.equal(dryRunOnly.safety_boundary.idempotency_not_enforced, true);
  assert.equal(dryRunOnly.safety_boundary.write_path_intent_is_not_write_executed, true);
  assert.equal(dryRunOnly.safety_boundary.persistence_eligibility_is_not_persisted, true);
  assert.equal(dryRunOnly.safety_boundary.dry_run_only_is_not_committed_mutation, true);

  assert.ok(dryRunOnly.precondition_matrix.every((row) => row.required === true));
  assert.ok(dryRunOnly.precondition_matrix.every((row) => row.satisfied === true));
  assert.ok(dryRunOnly.reasons.some((item) => /dry-run-only and non-persistent/i.test(item)));

  const serialized = JSON.stringify(dryRunOnly);
  assert.doesNotMatch(serialized, /committed mutation happened|persisted successfully|write executed/i);

  console.log("boundedWritePathContract tests passed");
}

run();
