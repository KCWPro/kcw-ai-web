import assert from "node:assert/strict";
import {
  getControlledSubmissionMutationIntentByLeadId,
  listControlledSubmissionMutationIntentAuditLog,
  recordControlledSubmissionMutationIntent,
  resetControlledSubmissionMutationIntentStore,
} from "../lib/controlledSubmissionMutationIntent";

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

function intentKey(leadId: string, pathId = "path_follow_up_review") {
  return `intent::${leadId}::path:${pathId}::v1`;
}

function run() {
  resetControlledSubmissionMutationIntentStore();

  const accepted = recordControlledSubmissionMutationIntent({
    lead_id: "lead-1001",
    actor_id: "operator_a",
    source: "internal_operator",
    intent_key: intentKey("lead-1001"),
    readiness_input: readyInput(),
  });

  assert.equal(accepted.write_state, "accepted_recorded");
  assert.equal(accepted.rejection_reason, null);
  assert.equal(accepted.object_changed, true);
  assert.ok(accepted.intent_record);
  assert.equal(accepted.intent_record?.object_type, "controlled_submission_mutation_intent");
  assert.equal(accepted.intent_record?.intent_status, "intent_recorded");
  assert.equal(accepted.intent_record?.lead_id, "lead-1001");
  assert.equal(accepted.intent_record?.contract_snapshot.gate_state, "allowed");
  assert.equal(accepted.intent_record?.contract_snapshot.controlled_submission_status, "submission_ready");
  assert.equal(accepted.boundary_assertion.submission_completed, false);
  assert.equal(accepted.boundary_assertion.approval_completed, false);
  assert.equal(accepted.boundary_assertion.workflow_finished, false);
  assert.equal(accepted.boundary_assertion.no_external_execution_occurred, true);

  const stored = getControlledSubmissionMutationIntentByLeadId("lead-1001");
  assert.ok(stored);
  assert.equal(stored?.intent_status, "intent_recorded");

  const replay = recordControlledSubmissionMutationIntent({
    lead_id: "lead-1001",
    actor_id: "operator_a",
    source: "internal_operator",
    intent_key: intentKey("lead-1001"),
    readiness_input: readyInput(),
  });

  assert.equal(replay.write_state, "accepted_idempotent_replay");
  assert.equal(replay.object_changed, false);
  assert.equal(replay.intent_record?.intent_key, stored?.intent_key);

  const invalidLead = recordControlledSubmissionMutationIntent({
    lead_id: "lead-missing",
    actor_id: "operator_a",
    source: "internal_operator",
    intent_key: intentKey("lead-missing"),
    readiness_input: readyInput(),
  });
  assert.equal(invalidLead.write_state, "rejected");
  assert.equal(invalidLead.rejection_reason, "lead_not_found");

  const gateRejected = recordControlledSubmissionMutationIntent({
    lead_id: "lead-1002",
    actor_id: "operator_b",
    source: "internal_operator",
    intent_key: intentKey("lead-1002"),
    readiness_input: {
      ...readyInput(),
      manual_confirmation_received: false,
    },
  });
  assert.equal(gateRejected.write_state, "rejected");
  assert.equal(gateRejected.rejection_reason, "controlled_submission_gate_or_readiness_not_satisfied");

  const readinessRejected = recordControlledSubmissionMutationIntent({
    lead_id: "lead-1002",
    actor_id: "operator_b",
    source: "internal_operator",
    intent_key: intentKey("lead-1002"),
    readiness_input: {
      ...readyInput(),
      intake_quality_gate_passed: false,
    },
  });
  assert.equal(readinessRejected.write_state, "rejected");
  assert.equal(readinessRejected.rejection_reason, "controlled_submission_gate_or_readiness_not_satisfied");

  const inputOutOfRange = recordControlledSubmissionMutationIntent({
    lead_id: "lead-1002",
    actor_id: " ",
    source: "internal_operator",
    intent_key: intentKey("lead-1002"),
    readiness_input: readyInput(),
  });
  assert.equal(inputOutOfRange.write_state, "rejected");
  assert.equal(inputOutOfRange.rejection_reason, "invalid_actor_id");

  const firstForLead1003 = recordControlledSubmissionMutationIntent({
    lead_id: "lead-1003",
    actor_id: "operator_c",
    source: "internal_operator",
    intent_key: intentKey("lead-1003"),
    readiness_input: {
      ...readyInput(),
      selected_path_id: "path_follow_up_review",
    },
  });
  assert.equal(firstForLead1003.write_state, "accepted_recorded");

  const nonAllowedFieldAttempt = recordControlledSubmissionMutationIntent({
    lead_id: "lead-1003",
    actor_id: "operator_c",
    source: "internal_operator",
    intent_key: intentKey("lead-1003", "different_path"),
    readiness_input: {
      ...readyInput(),
      selected_path_id: "different_path",
    },
  });
  assert.equal(nonAllowedFieldAttempt.write_state, "rejected");
  assert.equal(nonAllowedFieldAttempt.rejection_reason, "single_object_conflict_existing_intent_key_mismatch");

  const pseudoReplayRejected = recordControlledSubmissionMutationIntent({
    lead_id: "lead-1001",
    actor_id: "operator_different",
    source: "internal_operator",
    intent_key: intentKey("lead-1001"),
    readiness_input: readyInput(),
  });
  assert.equal(pseudoReplayRejected.write_state, "rejected");
  assert.equal(pseudoReplayRejected.rejection_reason, "idempotent_replay_core_input_mismatch");

  const invalidIntentKeyFormat = recordControlledSubmissionMutationIntent({
    lead_id: "lead-1002",
    actor_id: "operator_b",
    source: "internal_operator",
    intent_key: "bad-format",
    readiness_input: readyInput(),
  });
  assert.equal(invalidIntentKeyFormat.write_state, "rejected");
  assert.equal(invalidIntentKeyFormat.rejection_reason, "invalid_intent_key_format");

  const intentKeyMismatch = recordControlledSubmissionMutationIntent({
    lead_id: "lead-1002",
    actor_id: "operator_b",
    source: "internal_operator",
    intent_key: intentKey("lead-1002", "path_not_matching"),
    readiness_input: readyInput(),
  });
  assert.equal(intentKeyMismatch.write_state, "rejected");
  assert.equal(intentKeyMismatch.rejection_reason, "intent_key_mismatch_with_input");

  const selectedPathMissing = recordControlledSubmissionMutationIntent({
    lead_id: "lead-1002",
    actor_id: "operator_b",
    source: "internal_operator",
    intent_key: intentKey("lead-1002"),
    readiness_input: {
      ...readyInput(),
      selected_path_id: "",
    },
  });
  assert.equal(selectedPathMissing.write_state, "rejected");
  assert.equal(selectedPathMissing.rejection_reason, "selected_path_id_missing");

  const invalidSource = recordControlledSubmissionMutationIntent({
    lead_id: "lead-1002",
    actor_id: "operator_b",
    source: "bad_source" as "internal_operator",
    intent_key: intentKey("lead-1002"),
    readiness_input: readyInput(),
  });
  assert.equal(invalidSource.write_state, "rejected");
  assert.equal(invalidSource.rejection_reason, "invalid_source");

  const auditLog = listControlledSubmissionMutationIntentAuditLog();
  assert.ok(auditLog.length >= 13);
  assert.ok(auditLog.some((entry) => entry.write_state === "accepted_recorded"));
  assert.ok(auditLog.some((entry) => entry.write_state === "accepted_idempotent_replay"));
  assert.ok(auditLog.some((entry) => entry.write_state === "rejected"));
  assert.ok(auditLog.every((entry) => entry.boundary_note === "minimal_intent_audit_only"));
  assert.ok(auditLog.every((entry) => !("actor_id" in entry)));
  assert.ok(auditLog.every((entry) => !("source" in entry)));

  const serialized = JSON.stringify({ accepted, replay, stored, auditLog });
  assert.doesNotMatch(serialized, /submission completed|approval completed|workflow finished|external execution succeeded/i);
  assert.match(serialized, /minimal_intent_audit_only/i);

  console.log("controlledSubmissionMutationIntent tests passed");
}

run();
