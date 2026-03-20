import assert from "node:assert/strict";
import { buildControlledSubmissionMutationIntentLifecycleReadModel } from "../lib/controlledSubmissionMutationIntentLifecycleSurfacing";

function run() {
  const visible = buildControlledSubmissionMutationIntentLifecycleReadModel({
    lead_id: "lead-1001",
    audit_log: [
      {
        attempt_id: "attempt-1",
        intent_key: "intent::lead-1001::path:path_follow_up_review::v1",
        lead_id: "lead-1001",
        write_state: "accepted_recorded",
        lifecycle_stage: "accepted_for_intent_recording",
        operator_outcome: "intent_recorded_non_completion",
        rejection_reason: null,
        object_changed: true,
        occurred_at: "2026-03-20T00:00:00.000Z",
        boundary_note: "minimal_intent_audit_only",
      },
      {
        attempt_id: "attempt-2",
        intent_key: "intent::lead-1001::path:path_follow_up_review::v1",
        lead_id: "lead-1001",
        write_state: "accepted_idempotent_replay",
        lifecycle_stage: "replayed_idempotently",
        operator_outcome: "idempotent_replay_non_completion",
        rejection_reason: null,
        object_changed: false,
        occurred_at: "2026-03-20T00:01:00.000Z",
        boundary_note: "minimal_intent_audit_only",
      },
    ],
  });

  assert.equal(visible.visibility_state, "visible");
  assert.equal(visible.current_stage, "replayed_idempotently");
  assert.equal(visible.operator_outcome, "idempotent_replay_non_completion");
  assert.equal(visible.source, "audit_log_derived");
  assert.equal(visible.semantic_boundary.lifecycle_visibility_is_not_completion, true);
  assert.equal(visible.semantic_boundary.lifecycle_stage_is_not_external_execution, true);
  assert.match(visible.transition_note, /No new execution happened/i);

  const notAvailable = buildControlledSubmissionMutationIntentLifecycleReadModel({
    lead_id: "lead-missing",
    audit_log: [],
  });

  assert.equal(notAvailable.visibility_state, "not_available");
  assert.equal(notAvailable.current_stage, "not_available");
  assert.equal(notAvailable.operator_outcome, "not_available");
  assert.equal(notAvailable.source, "no_intent_audit_for_lead");
  assert.equal(notAvailable.semantic_boundary.status_expression_is_not_workflow_fully_completed, true);
  assert.match(notAvailable.read_only_notice, /Read-only surfacing only/i);

  const serialized = JSON.stringify({ visible, notAvailable });
  assert.doesNotMatch(serialized, /completed successfully|executed successfully|approval finalized/i);

  console.log("controlledSubmissionMutationIntentLifecycleSurfacing tests passed");
}

run();
