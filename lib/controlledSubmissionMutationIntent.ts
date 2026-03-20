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
  intent_key: string;
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
  core_input_fingerprint: string;
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
  write_state: "accepted_recorded" | "accepted_idempotent_replay" | "rejected";
  lifecycle_stage: ControlledSubmissionMutationIntentLifecycleStage;
  operator_outcome: ControlledSubmissionMutationIntentOperatorOutcome;
  rejection_reason: string | null;
  object_changed: boolean;
  occurred_at: string;
  boundary_note: "minimal_intent_audit_only";
};

export type ControlledSubmissionMutationIntentLifecycleStage =
  | "accepted_for_intent_recording"
  | "replayed_idempotently"
  | "blocked_by_boundary";

export type ControlledSubmissionMutationIntentOperatorOutcome =
  | "intent_recorded_non_completion"
  | "idempotent_replay_non_completion"
  | "rejected_non_completion";

export type ControlledSubmissionMutationIntentLifecycleVisibility = {
  model_version: "phase11-step2-lifecycle-visibility-v1";
  current_stage: ControlledSubmissionMutationIntentLifecycleStage;
  operator_outcome: ControlledSubmissionMutationIntentOperatorOutcome;
  transition_note: string;
  semantic_boundary: {
    lifecycle_visibility_is_not_completion: true;
    lifecycle_stage_is_not_external_execution: true;
    observable_transition_is_not_approval_finalized: true;
    status_expression_is_not_workflow_fully_completed: true;
    internal_mutation_state_is_not_durable_audit_history: true;
  };
};

export type ControlledSubmissionMutationIntentRejectReason =
  | "lead_not_found"
  | "invalid_actor_id"
  | "invalid_source"
  | "selected_path_id_missing"
  | "invalid_intent_key_format"
  | "intent_key_mismatch_with_input"
  | "readiness_boundary_invalid"
  | "controlled_submission_gate_or_readiness_not_satisfied"
  | "checkpoint_not_ready_for_review"
  | "audit_trail_not_in_read_only_alignment"
  | "bounded_write_path_not_dry_run_ready"
  | "single_object_conflict_existing_intent_key_mismatch"
  | "idempotent_replay_core_input_mismatch";

export type ControlledSubmissionMutationIntentWriteResult = {
  write_state: "accepted_recorded" | "accepted_idempotent_replay" | "rejected";
  rejection_reason: ControlledSubmissionMutationIntentRejectReason | null;
  object_changed: boolean;
  intent_record: Readonly<ControlledSubmissionMutationIntentRecord> | null;
  lifecycle_visibility: ControlledSubmissionMutationIntentLifecycleVisibility;
  boundary_assertion: {
    submission_completed: false;
    approval_completed: false;
    workflow_finished: false;
    no_external_execution_occurred: true;
    full_audit_persistence_system: false;
  };
};

export const CONTROLLED_SUBMISSION_MUTATION_INTENT_WRITE_STATES = [
  "accepted_recorded",
  "accepted_idempotent_replay",
  "rejected",
] as const;

const FIXED_RESULT_BOUNDARY_ASSERTION = {
  submission_completed: false,
  approval_completed: false,
  workflow_finished: false,
  no_external_execution_occurred: true,
  full_audit_persistence_system: false,
} as const;

export type ControlledSubmissionMutationIntentWriteState =
  (typeof CONTROLLED_SUBMISSION_MUTATION_INTENT_WRITE_STATES)[number];

const intentStore = new Map<string, ControlledSubmissionMutationIntentRecord>();
const intentAuditLog: ControlledSubmissionMutationIntentAuditEntry[] = [];

function makeAttemptId(nowIso: string, leadId: string) {
  return `attempt_${leadId}_${nowIso}`;
}

function isSupportedSource(source: string): source is ControlledSubmissionMutationIntentSource {
  return source === "internal_operator" || source === "internal_api";
}

function buildExpectedIntentKey(leadId: string, selectedPathId: string) {
  return `intent::${leadId}::path:${selectedPathId}::v1`;
}

function isValidIntentKeyFormat(intentKey: string) {
  return /^intent::[a-zA-Z0-9_-]+::path:[a-zA-Z0-9_-]+::v1$/.test(intentKey);
}

function buildCoreInputFingerprint(input: ControlledSubmissionMutationIntentWriteInput) {
  const payload = {
    lead_id: input.lead_id,
    actor_id: input.actor_id.trim(),
    source: input.source,
    intent_key: input.intent_key,
    decision_status: input.readiness_input.decision_status,
    selected_path_category: input.readiness_input.selected_path_category,
    selected_path_id: input.readiness_input.selected_path_id,
    manual_confirmation_received: input.readiness_input.manual_confirmation_received,
    intake_quality_gate_passed: input.readiness_input.intake_quality_gate_passed,
    follow_up_alignment_status: input.readiness_input.follow_up_alignment_status,
    path_availability: input.readiness_input.path_availability,
    has_blocking_risk: input.readiness_input.has_blocking_risk,
  };
  return JSON.stringify(payload);
}

function buildRejectedResult(reason: ControlledSubmissionMutationIntentRejectReason): ControlledSubmissionMutationIntentWriteResult {
  return {
    write_state: "rejected",
    rejection_reason: reason,
    object_changed: false,
    intent_record: null,
    lifecycle_visibility: buildLifecycleVisibility("rejected"),
    boundary_assertion: FIXED_RESULT_BOUNDARY_ASSERTION,
  };
}

function appendAuditEntry(entry: ControlledSubmissionMutationIntentAuditEntry) {
  intentAuditLog.push(entry);
}

function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (value === null || typeof value !== "object") {
    return value as Readonly<T>;
  }
  const target = value as Record<string, unknown>;
  Object.getOwnPropertyNames(target).forEach((name) => {
    const child = target[name];
    if (child && typeof child === "object") {
      deepFreeze(child as object);
    }
  });
  return Object.freeze(value);
}

function toReadonlyRecord(record: ControlledSubmissionMutationIntentRecord): Readonly<ControlledSubmissionMutationIntentRecord> {
  return deepFreeze(deepClone(record));
}

function toReadonlyAuditEntry(
  entry: ControlledSubmissionMutationIntentAuditEntry,
): Readonly<ControlledSubmissionMutationIntentAuditEntry> {
  return deepFreeze(deepClone(entry));
}

function buildMinimalAuditEntry(
  leadId: string,
  intentKey: string,
  nowIso: string,
  result: Pick<
    ControlledSubmissionMutationIntentWriteResult,
    "write_state" | "rejection_reason" | "object_changed" | "lifecycle_visibility"
  >,
): ControlledSubmissionMutationIntentAuditEntry {
  return {
    attempt_id: makeAttemptId(nowIso, leadId),
    intent_key: intentKey,
    lead_id: leadId,
    write_state: result.write_state,
    lifecycle_stage: result.lifecycle_visibility.current_stage,
    operator_outcome: result.lifecycle_visibility.operator_outcome,
    rejection_reason: result.rejection_reason,
    object_changed: result.object_changed,
    occurred_at: nowIso,
    boundary_note: "minimal_intent_audit_only",
  };
}

function buildLifecycleVisibility(
  writeState: ControlledSubmissionMutationIntentWriteState,
): ControlledSubmissionMutationIntentLifecycleVisibility {
  if (writeState === "accepted_recorded") {
    return {
      model_version: "phase11-step2-lifecycle-visibility-v1",
      current_stage: "accepted_for_intent_recording",
      operator_outcome: "intent_recorded_non_completion",
      transition_note: "Intent was recorded under bounded non-executing semantics.",
      semantic_boundary: {
        lifecycle_visibility_is_not_completion: true,
        lifecycle_stage_is_not_external_execution: true,
        observable_transition_is_not_approval_finalized: true,
        status_expression_is_not_workflow_fully_completed: true,
        internal_mutation_state_is_not_durable_audit_history: true,
      },
    };
  }

  if (writeState === "accepted_idempotent_replay") {
    return {
      model_version: "phase11-step2-lifecycle-visibility-v1",
      current_stage: "replayed_idempotently",
      operator_outcome: "idempotent_replay_non_completion",
      transition_note: "Replay matched existing intent key and input fingerprint; no new execution occurred.",
      semantic_boundary: {
        lifecycle_visibility_is_not_completion: true,
        lifecycle_stage_is_not_external_execution: true,
        observable_transition_is_not_approval_finalized: true,
        status_expression_is_not_workflow_fully_completed: true,
        internal_mutation_state_is_not_durable_audit_history: true,
      },
    };
  }

  return {
    model_version: "phase11-step2-lifecycle-visibility-v1",
    current_stage: "blocked_by_boundary",
    operator_outcome: "rejected_non_completion",
    transition_note: "Boundary precondition failed; intent was not recorded and no execution path was entered.",
    semantic_boundary: {
      lifecycle_visibility_is_not_completion: true,
      lifecycle_stage_is_not_external_execution: true,
      observable_transition_is_not_approval_finalized: true,
      status_expression_is_not_workflow_fully_completed: true,
      internal_mutation_state_is_not_durable_audit_history: true,
    },
  };
}

function buildAcceptedReplayResult(record: ControlledSubmissionMutationIntentRecord): ControlledSubmissionMutationIntentWriteResult {
  return {
    write_state: "accepted_idempotent_replay",
    rejection_reason: null,
    object_changed: false,
    intent_record: toReadonlyRecord(record),
    lifecycle_visibility: buildLifecycleVisibility("accepted_idempotent_replay"),
    boundary_assertion: FIXED_RESULT_BOUNDARY_ASSERTION,
  };
}

function buildAcceptedRecordedResult(record: ControlledSubmissionMutationIntentRecord): ControlledSubmissionMutationIntentWriteResult {
  return {
    write_state: "accepted_recorded",
    rejection_reason: null,
    object_changed: true,
    intent_record: toReadonlyRecord(record),
    lifecycle_visibility: buildLifecycleVisibility("accepted_recorded"),
    boundary_assertion: FIXED_RESULT_BOUNDARY_ASSERTION,
  };
}

function assertIntentRecordInvariant(record: ControlledSubmissionMutationIntentRecord) {
  if (!record.intent_id || !record.intent_key || !record.lead_id || !record.selected_path_id || !record.recorded_at) {
    throw new Error("Invariant violation: required intent record fields are missing.");
  }
  if (record.intent_status !== "intent_recorded") {
    throw new Error("Invariant violation: intent_status must stay intent_recorded.");
  }
  if (
    record.boundary_assertion.submission_completed !== false ||
    record.boundary_assertion.approval_completed !== false ||
    record.boundary_assertion.external_execution_occurred !== false
  ) {
    throw new Error("Invariant violation: execution/completion boundary drift detected.");
  }
}

export function recordControlledSubmissionMutationIntent(
  input: ControlledSubmissionMutationIntentWriteInput,
): ControlledSubmissionMutationIntentWriteResult {
  const nowIso = new Date().toISOString();

  if (!input.lead_id || !getLeadById(input.lead_id)) {
    const rejection = buildRejectedResult("lead_not_found");
    appendAuditEntry(buildMinimalAuditEntry(input.lead_id || "unknown", "n/a", nowIso, rejection));
    return rejection;
  }

  if (!input.actor_id || !input.actor_id.trim()) {
    const rejection = buildRejectedResult("invalid_actor_id");
    appendAuditEntry(buildMinimalAuditEntry(input.lead_id, "n/a", nowIso, rejection));
    return rejection;
  }

  if (!isSupportedSource(input.source)) {
    const rejection = buildRejectedResult("invalid_source");
    appendAuditEntry(buildMinimalAuditEntry(input.lead_id, "n/a", nowIso, rejection));
    return rejection;
  }

  const selectedPathId = input.readiness_input.selected_path_id;
  if (!selectedPathId || !selectedPathId.trim()) {
    const rejection = buildRejectedResult("selected_path_id_missing");
    appendAuditEntry(buildMinimalAuditEntry(input.lead_id, "n/a", nowIso, rejection));
    return rejection;
  }

  if (!isValidIntentKeyFormat(input.intent_key)) {
    const rejection = buildRejectedResult("invalid_intent_key_format");
    appendAuditEntry(buildMinimalAuditEntry(input.lead_id, input.intent_key, nowIso, rejection));
    return rejection;
  }

  const expectedIntentKey = buildExpectedIntentKey(input.lead_id, selectedPathId);
  if (input.intent_key !== expectedIntentKey) {
    const rejection = buildRejectedResult("intent_key_mismatch_with_input");
    appendAuditEntry(buildMinimalAuditEntry(input.lead_id, input.intent_key, nowIso, rejection));
    return rejection;
  }

  const readinessHardening = buildBoundedWriteImplementationReadinessContract();
  if (readinessHardening.non_execution_boundary.implementation_permitted !== false) {
    const rejection = buildRejectedResult("readiness_boundary_invalid");
    appendAuditEntry(buildMinimalAuditEntry(input.lead_id, "n/a", nowIso, rejection));
    return rejection;
  }

  const controlledSubmission = buildControlledSubmissionContract(input.readiness_input);
  if (controlledSubmission.status !== "submission_ready" || controlledSubmission.gate_state !== "allowed") {
    const rejection = buildRejectedResult("controlled_submission_gate_or_readiness_not_satisfied");
    appendAuditEntry(buildMinimalAuditEntry(input.lead_id, "n/a", nowIso, rejection));
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
    appendAuditEntry(buildMinimalAuditEntry(input.lead_id, "n/a", nowIso, rejection));
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
    appendAuditEntry(buildMinimalAuditEntry(input.lead_id, "n/a", nowIso, rejection));
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
    appendAuditEntry(buildMinimalAuditEntry(input.lead_id, "n/a", nowIso, rejection));
    return rejection;
  }

  const intentKey = input.intent_key;
  const fingerprint = buildCoreInputFingerprint(input);
  const existing = intentStore.get(input.lead_id);

  if (existing) {
    if (existing.intent_key !== intentKey) {
      const rejection = buildRejectedResult("single_object_conflict_existing_intent_key_mismatch");
      appendAuditEntry(buildMinimalAuditEntry(input.lead_id, intentKey, nowIso, rejection));
      return rejection;
    }
    if (existing.core_input_fingerprint !== fingerprint) {
      const rejection = buildRejectedResult("idempotent_replay_core_input_mismatch");
      appendAuditEntry(buildMinimalAuditEntry(input.lead_id, intentKey, nowIso, rejection));
      return rejection;
    }

    assertIntentRecordInvariant(existing);
    const replayResult = buildAcceptedReplayResult(existing);
    appendAuditEntry(buildMinimalAuditEntry(input.lead_id, existing.intent_key, nowIso, replayResult));

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
    core_input_fingerprint: fingerprint,
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

  assertIntentRecordInvariant(intentRecord);
  intentStore.set(input.lead_id, intentRecord);
  const accepted = buildAcceptedRecordedResult(intentRecord);
  appendAuditEntry(buildMinimalAuditEntry(input.lead_id, intentRecord.intent_key, nowIso, accepted));

  return accepted;
}

export function getControlledSubmissionMutationIntentByLeadId(leadId: string) {
  const record = intentStore.get(leadId);
  return record ? toReadonlyRecord(record) : null;
}

export function listControlledSubmissionMutationIntentAuditLog() {
  return intentAuditLog.map((entry) => toReadonlyAuditEntry(entry));
}

export function resetControlledSubmissionMutationIntentStore() {
  intentStore.clear();
  intentAuditLog.length = 0;
}
