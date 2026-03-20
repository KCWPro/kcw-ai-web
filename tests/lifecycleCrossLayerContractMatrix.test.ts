import assert from "node:assert/strict";
import {
  buildControlledSubmissionMutationIntentForbiddenSuccessPattern,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_NOTICE_LINES,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_CLAUSES,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_READ_ONLY_NOTICE,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_TRANSITION_NOTES,
  listControlledSubmissionMutationIntentAuditLog,
  recordControlledSubmissionMutationIntent,
  resetControlledSubmissionMutationIntentStore,
} from "../lib/controlledSubmissionMutationIntent";
import { buildControlledSubmissionMutationIntentLifecycleReadModel } from "../lib/controlledSubmissionMutationIntentLifecycleSurfacing";

function readyInput() {
  return {
    decision_status: "ready_for_manual_progress" as const,
    selected_path_category: "human_confirmed_path" as const,
    selected_path_id: "path_follow_up_review",
    manual_confirmation_received: true,
    intake_quality_gate_passed: true,
    follow_up_alignment_status: "aligned" as const,
    path_availability: "available" as const,
    has_blocking_risk: false,
  };
}

function key(leadId: string) {
  return `intent::${leadId}::path:path_follow_up_review::v1`;
}

function run() {
  resetControlledSubmissionMutationIntentStore();

  const accepted = recordControlledSubmissionMutationIntent({
    lead_id: "lead-1001",
    actor_id: "operator_1",
    source: "internal_operator",
    intent_key: key("lead-1001"),
    readiness_input: readyInput(),
  });
  const replayed = recordControlledSubmissionMutationIntent({
    lead_id: "lead-1001",
    actor_id: "operator_1",
    source: "internal_operator",
    intent_key: key("lead-1001"),
    readiness_input: readyInput(),
  });
  const rejected = recordControlledSubmissionMutationIntent({
    lead_id: "lead-missing",
    actor_id: "operator_1",
    source: "internal_operator",
    intent_key: key("lead-missing"),
    readiness_input: readyInput(),
  });

  assert.equal(accepted.lifecycle_visibility.current_stage, "accepted_for_intent_recording");
  assert.equal(replayed.lifecycle_visibility.current_stage, "replayed_idempotently");
  assert.equal(rejected.lifecycle_visibility.current_stage, "blocked_by_boundary");

  assert.equal(
    accepted.lifecycle_visibility.transition_note,
    CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_TRANSITION_NOTES.accepted_for_intent_recording,
  );
  assert.equal(
    replayed.lifecycle_visibility.transition_note,
    CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_TRANSITION_NOTES.replayed_idempotently,
  );
  assert.equal(
    rejected.lifecycle_visibility.transition_note,
    CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_TRANSITION_NOTES.blocked_by_boundary,
  );

  const audit = listControlledSubmissionMutationIntentAuditLog();
  const readModelVisible = buildControlledSubmissionMutationIntentLifecycleReadModel({
    lead_id: "lead-1001",
    audit_log: audit,
  });
  const readModelMissing = buildControlledSubmissionMutationIntentLifecycleReadModel({
    lead_id: "lead-no-audit",
    audit_log: audit,
  });

  assert.equal(readModelVisible.current_stage, replayed.lifecycle_visibility.current_stage);
  assert.equal(readModelVisible.operator_outcome, replayed.lifecycle_visibility.operator_outcome);
  assert.equal(readModelVisible.transition_note, replayed.lifecycle_visibility.transition_note);
  assert.equal(readModelVisible.read_only_notice, CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_READ_ONLY_NOTICE);
  assert.deepEqual(readModelVisible.semantic_boundary_clauses, CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_CLAUSES);
  assert.deepEqual(readModelVisible.boundary_notice_lines, CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_NOTICE_LINES);

  assert.equal(readModelMissing.visibility_state, "not_available");
  assert.equal(readModelMissing.current_stage, "not_available");
  assert.equal(readModelMissing.operator_outcome, "not_available");
  assert.match(readModelMissing.transition_note, /No lifecycle audit entry is available for this lead yet/);
  assert.deepEqual(readModelMissing.semantic_boundary_clauses, CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_CLAUSES);
  assert.deepEqual(readModelMissing.boundary_notice_lines, CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_NOTICE_LINES);

  const serialized = JSON.stringify({ accepted, replayed, rejected, readModelVisible, readModelMissing });
  assert.doesNotMatch(serialized, buildControlledSubmissionMutationIntentForbiddenSuccessPattern());
  assert.match(serialized, /intent recorded != submission completed/);
  assert.match(serialized, /replayed idempotently != workflow completed/);
  assert.match(serialized, /blocked by boundary != approval finalized/);

  console.log("lifecycleCrossLayerContractMatrix tests passed");
}

run();
