import { getLeadById } from "./internalLeads";
import {
  buildControlledSubmissionContract,
  type ControlledSubmissionReadinessInput,
} from "./controlledSubmissionContract";
import { buildApprovalCheckpointContract } from "./approvalCheckpointContract";
import { buildAuditTrailSkeleton } from "./auditTrailSkeleton";
import { buildBoundedWritePathContract } from "./boundedWritePathContract";
import { buildBoundedWriteImplementationReadinessContract } from "./boundedWriteImplementationReadinessContract";

export type ControlledSubmissionMutationIntentSource = "internal_operator" | "internal_api";

export type ControlledSubmissionMutationIntentWriteInput = {
  lead_id: string;
  actor_id: string;
  source: ControlledSubmissionMutationIntentSource;
  readiness_input: ControlledSubmissionReadinessInput;
};

export type ControlledSubmissionMutationIntentRecord = {
  object_type: "controlled_submission_mutation_intent";
  intent_status: "intent_recorded";
  intent_id: string;
  intent_key: string;
  lead_id: string;
  selected_path_id: string;
  actor_id: string;
  source: ControlledSubmissionMutationIntentSource;
  recorded_at: string;
  contract_snapshot: {
    controlled_submission_status: "submission_ready";
    gate_state: "allowed";
    checkpoint_overall_state: "checkpoint_ready_for_review";
    audit_latest_state_hint: "read_only_alignment";
    bounded_write_status: "dry_run_only";
  };
  boundary_assertion: {
    submission_completed: false;
    approval_completed: false;
    external_execution_occurred: false;
    external_write_performed: false;
    workflow_automation_triggered: false;
  };
};

export type ControlledSubmissionMutationIntentAuditEntry = {
  attempt_id: string;
  intent_key: string;
  lead_id: string;
  actor_id: string;
  source: ControlledSubmissionMutationIntentSource;
  write_state: "accepted_recorded" | "accepted_idempotent_replay" | "rejected";
  rejection_reason: string | null;
  object_changed: boolean;
  occurred_at: string;
  boundary_note: "minimal_intent_audit_only";
};

export type ControlledSubmissionMutationIntentWriteResult = {
  write_state: "accepted_recorded" | "accepted_idempotent_replay" | "rejected";
  rejection_reason: string | null;
  object_changed: boolean;
  intent_record: ControlledSubmissionMutationIntentRecord | null;
  boundary_assertion: {
    submission_completed: false;
    approval_completed: false;
    external_execution_occurred: false;
    full_audit_persistence_system: false;
  };
};

const intentStore = new Map<string, ControlledSubmissionMutationIntentRecord>();
const intentAuditLog: ControlledSubmissionMutationIntentAuditEntry[] = [];

function makeAttemptId(nowIso: string, leadId: string) {
  return `attempt_${leadId}_${nowIso}`;
}

function makeIntentKey(leadId: string, selectedPathId: string) {
  return `${leadId}::${selectedPathId}::phase10-step1-v1`;
}

function buildRejectedResult(reason: string): ControlledSubmissionMutationIntentWriteResult {
  return {
    write_state: "rejected",
    rejection_reason: reason,
    object_changed: false,
    intent_record: null,
    boundary_assertion: {
      submission_completed: false,
      approval_completed: false,
      external_execution_occurred: false,
      full_audit_persistence_system: false,
    },
  };
}

function appendAuditEntry(entry: ControlledSubmissionMutationIntentAuditEntry) {
  intentAuditLog.push(entry);
}

export function recordControlledSubmissionMutationIntent(
  input: ControlledSubmissionMutationIntentWriteInput,
): ControlledSubmissionMutationIntentWriteResult {
  const nowIso = new Date().toISOString();

  if (!input.lead_id || !getLeadById(input.lead_id)) {
    const rejection = buildRejectedResult("lead_not_found");
    appendAuditEntry({
      attempt_id: makeAttemptId(nowIso, input.lead_id || "unknown"),
      intent_key: "n/a",
      lead_id: input.lead_id,
      actor_id: input.actor_id,
      source: input.source,
      write_state: rejection.write_state,
      rejection_reason: rejection.rejection_reason,
      object_changed: rejection.object_changed,
      occurred_at: nowIso,
      boundary_note: "minimal_intent_audit_only",
    });
    return rejection;
  }

  if (!input.actor_id || !input.actor_id.trim()) {
    const rejection = buildRejectedResult("invalid_actor_id");
    appendAuditEntry({
      attempt_id: makeAttemptId(nowIso, input.lead_id),
      intent_key: "n/a",
      lead_id: input.lead_id,
      actor_id: input.actor_id,
      source: input.source,
      write_state: rejection.write_state,
      rejection_reason: rejection.rejection_reason,
      object_changed: rejection.object_changed,
      occurred_at: nowIso,
      boundary_note: "minimal_intent_audit_only",
    });
    return rejection;
  }

  const readinessHardening = buildBoundedWriteImplementationReadinessContract();
  if (readinessHardening.non_execution_boundary.implementation_permitted !== false) {
    const rejection = buildRejectedResult("readiness_boundary_invalid");
    appendAuditEntry({
      attempt_id: makeAttemptId(nowIso, input.lead_id),
      intent_key: "n/a",
      lead_id: input.lead_id,
      actor_id: input.actor_id,
      source: input.source,
      write_state: rejection.write_state,
      rejection_reason: rejection.rejection_reason,
      object_changed: rejection.object_changed,
      occurred_at: nowIso,
      boundary_note: "minimal_intent_audit_only",
    });
    return rejection;
  }

  const controlledSubmission = buildControlledSubmissionContract(input.readiness_input);
  if (controlledSubmission.status !== "submission_ready" || controlledSubmission.gate_state !== "allowed") {
    const rejection = buildRejectedResult("controlled_submission_gate_or_readiness_not_satisfied");
    appendAuditEntry({
      attempt_id: makeAttemptId(nowIso, input.lead_id),
      intent_key: "n/a",
      lead_id: input.lead_id,
      actor_id: input.actor_id,
      source: input.source,
      write_state: rejection.write_state,
      rejection_reason: rejection.rejection_reason,
      object_changed: rejection.object_changed,
      occurred_at: nowIso,
      boundary_note: "minimal_intent_audit_only",
    });
    return rejection;
  }

  const checkpoint = buildApprovalCheckpointContract({
    decision_status: input.readiness_input.decision_status,
    selected_path_category: input.readiness_input.selected_path_category,
    manual_confirmation_received: input.readiness_input.manual_confirmation_received,
    controlled_submission_status: controlledSubmission.status,
    controlled_submission_gate_state: controlledSubmission.gate_state,
    has_blocking_risk: input.readiness_input.has_blocking_risk,
  });

  if (checkpoint.summary.overall_state !== "checkpoint_ready_for_review") {
    const rejection = buildRejectedResult("checkpoint_not_ready_for_review");
    appendAuditEntry({
      attempt_id: makeAttemptId(nowIso, input.lead_id),
      intent_key: "n/a",
      lead_id: input.lead_id,
      actor_id: input.actor_id,
      source: input.source,
      write_state: rejection.write_state,
      rejection_reason: rejection.rejection_reason,
      object_changed: rejection.object_changed,
      occurred_at: nowIso,
      boundary_note: "minimal_intent_audit_only",
    });
    return rejection;
  }

  const trail = buildAuditTrailSkeleton({
    selected_path_category: input.readiness_input.selected_path_category,
    decision_status: input.readiness_input.decision_status,
    controlled_submission_status: controlledSubmission.status,
    controlled_submission_gate_state: controlledSubmission.gate_state,
    manual_confirmation_received: input.readiness_input.manual_confirmation_received,
    approval_checkpoint_contract: checkpoint,
  });

  if (trail.latest_state_hint !== "read_only_alignment") {
    const rejection = buildRejectedResult("audit_trail_not_in_read_only_alignment");
    appendAuditEntry({
      attempt_id: makeAttemptId(nowIso, input.lead_id),
      intent_key: "n/a",
      lead_id: input.lead_id,
      actor_id: input.actor_id,
      source: input.source,
      write_state: rejection.write_state,
      rejection_reason: rejection.rejection_reason,
      object_changed: rejection.object_changed,
      occurred_at: nowIso,
      boundary_note: "minimal_intent_audit_only",
    });
    return rejection;
  }

  const boundedWritePath = buildBoundedWritePathContract({
    decision_status: input.readiness_input.decision_status,
    selected_path_category: input.readiness_input.selected_path_category,
    controlled_submission_status: controlledSubmission.status,
    controlled_submission_gate_state: controlledSubmission.gate_state,
    approval_checkpoint_overall_state: checkpoint.summary.overall_state,
    audit_trail_latest_state_hint: trail.latest_state_hint,
    has_blocking_risk: input.readiness_input.has_blocking_risk,
    dry_run_requested: true,
  });

  if (boundedWritePath.status !== "dry_run_only") {
    const rejection = buildRejectedResult("bounded_write_path_not_dry_run_ready");
    appendAuditEntry({
      attempt_id: makeAttemptId(nowIso, input.lead_id),
      intent_key: "n/a",
      lead_id: input.lead_id,
      actor_id: input.actor_id,
      source: input.source,
      write_state: rejection.write_state,
      rejection_reason: rejection.rejection_reason,
      object_changed: rejection.object_changed,
      occurred_at: nowIso,
      boundary_note: "minimal_intent_audit_only",
    });
    return rejection;
  }

  const selectedPathId = input.readiness_input.selected_path_id;
  if (!selectedPathId) {
    const rejection = buildRejectedResult("selected_path_id_missing");
    appendAuditEntry({
      attempt_id: makeAttemptId(nowIso, input.lead_id),
      intent_key: "n/a",
      lead_id: input.lead_id,
      actor_id: input.actor_id,
      source: input.source,
      write_state: rejection.write_state,
      rejection_reason: rejection.rejection_reason,
      object_changed: rejection.object_changed,
      occurred_at: nowIso,
      boundary_note: "minimal_intent_audit_only",
    });
    return rejection;
  }

  const intentKey = makeIntentKey(input.lead_id, selectedPathId);
  const existing = intentStore.get(input.lead_id);

  if (existing) {
    if (existing.intent_key !== intentKey) {
      const rejection = buildRejectedResult("single_object_conflict_existing_intent_key_mismatch");
      appendAuditEntry({
        attempt_id: makeAttemptId(nowIso, input.lead_id),
        intent_key: intentKey,
        lead_id: input.lead_id,
        actor_id: input.actor_id,
        source: input.source,
        write_state: rejection.write_state,
        rejection_reason: rejection.rejection_reason,
        object_changed: rejection.object_changed,
        occurred_at: nowIso,
        boundary_note: "minimal_intent_audit_only",
      });
      return rejection;
    }

    const replayResult: ControlledSubmissionMutationIntentWriteResult = {
      write_state: "accepted_idempotent_replay",
      rejection_reason: null,
      object_changed: false,
      intent_record: existing,
      boundary_assertion: {
        submission_completed: false,
        approval_completed: false,
        external_execution_occurred: false,
        full_audit_persistence_system: false,
      },
    };

    appendAuditEntry({
      attempt_id: makeAttemptId(nowIso, input.lead_id),
      intent_key: existing.intent_key,
      lead_id: input.lead_id,
      actor_id: input.actor_id,
      source: input.source,
      write_state: replayResult.write_state,
      rejection_reason: replayResult.rejection_reason,
      object_changed: replayResult.object_changed,
      occurred_at: nowIso,
      boundary_note: "minimal_intent_audit_only",
    });

    return replayResult;
  }

  const intentRecord: ControlledSubmissionMutationIntentRecord = {
    object_type: "controlled_submission_mutation_intent",
    intent_status: "intent_recorded",
    intent_id: `intent_${input.lead_id}_${Date.now()}`,
    intent_key: intentKey,
    lead_id: input.lead_id,
    selected_path_id: selectedPathId,
    actor_id: input.actor_id.trim(),
    source: input.source,
    recorded_at: nowIso,
    contract_snapshot: {
      controlled_submission_status: controlledSubmission.status,
      gate_state: controlledSubmission.gate_state,
      checkpoint_overall_state: checkpoint.summary.overall_state,
      audit_latest_state_hint: trail.latest_state_hint,
      bounded_write_status: boundedWritePath.status,
    },
    boundary_assertion: {
      submission_completed: false,
      approval_completed: false,
      external_execution_occurred: false,
      external_write_performed: false,
      workflow_automation_triggered: false,
    },
  };

  intentStore.set(input.lead_id, intentRecord);

  const accepted: ControlledSubmissionMutationIntentWriteResult = {
    write_state: "accepted_recorded",
    rejection_reason: null,
    object_changed: true,
    intent_record: intentRecord,
    boundary_assertion: {
      submission_completed: false,
      approval_completed: false,
      external_execution_occurred: false,
      full_audit_persistence_system: false,
    },
  };

  appendAuditEntry({
    attempt_id: makeAttemptId(nowIso, input.lead_id),
    intent_key: intentRecord.intent_key,
    lead_id: input.lead_id,
    actor_id: input.actor_id,
    source: input.source,
    write_state: accepted.write_state,
    rejection_reason: accepted.rejection_reason,
    object_changed: accepted.object_changed,
    occurred_at: nowIso,
    boundary_note: "minimal_intent_audit_only",
  });

  return accepted;
}

export function getControlledSubmissionMutationIntentByLeadId(leadId: string) {
  return intentStore.get(leadId) || null;
}

export function listControlledSubmissionMutationIntentAuditLog() {
  return [...intentAuditLog];
}

export function resetControlledSubmissionMutationIntentStore() {
  intentStore.clear();
  intentAuditLog.length = 0;
}
