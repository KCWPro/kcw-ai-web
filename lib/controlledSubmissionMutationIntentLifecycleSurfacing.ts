import type {
  ControlledSubmissionMutationIntentAuditEntry,
  ControlledSubmissionMutationIntentLifecycleVisibility,
} from "./controlledSubmissionMutationIntent";

export type ControlledSubmissionMutationIntentLifecycleReadModel = {
  visibility_state: "visible" | "not_available";
  current_stage: ControlledSubmissionMutationIntentLifecycleVisibility["current_stage"] | "not_available";
  operator_outcome: ControlledSubmissionMutationIntentLifecycleVisibility["operator_outcome"] | "not_available";
  transition_note: string;
  semantic_boundary: ControlledSubmissionMutationIntentLifecycleVisibility["semantic_boundary"];
  read_only_notice: string;
  source: "audit_log_derived" | "no_intent_audit_for_lead";
};

const FIXED_SEMANTIC_BOUNDARY: ControlledSubmissionMutationIntentLifecycleVisibility["semantic_boundary"] = {
  lifecycle_visibility_is_not_completion: true,
  lifecycle_stage_is_not_external_execution: true,
  observable_transition_is_not_approval_finalized: true,
  status_expression_is_not_workflow_fully_completed: true,
  internal_mutation_state_is_not_durable_audit_history: true,
};

function transitionNoteByStage(stage: ControlledSubmissionMutationIntentAuditEntry["lifecycle_stage"]) {
  if (stage === "accepted_for_intent_recording") {
    return "Intent is recorded in bounded mode. This does not represent submission completion.";
  }
  if (stage === "replayed_idempotently") {
    return "Idempotent replay matched existing intent context. No new execution happened.";
  }
  return "Boundary rejected the attempt. No execution path was entered.";
}

export function buildControlledSubmissionMutationIntentLifecycleReadModel(input: {
  lead_id: string;
  audit_log: ReadonlyArray<ControlledSubmissionMutationIntentAuditEntry>;
}): ControlledSubmissionMutationIntentLifecycleReadModel {
  const latest = [...input.audit_log].reverse().find((entry) => entry.lead_id === input.lead_id);

  if (!latest) {
    return {
      visibility_state: "not_available",
      current_stage: "not_available",
      operator_outcome: "not_available",
      transition_note: "No lifecycle audit entry is available for this lead yet.",
      semantic_boundary: FIXED_SEMANTIC_BOUNDARY,
      read_only_notice: "Read-only surfacing only. No approve/execute/complete action is exposed.",
      source: "no_intent_audit_for_lead",
    };
  }

  return {
    visibility_state: "visible",
    current_stage: latest.lifecycle_stage,
    operator_outcome: latest.operator_outcome,
    transition_note: transitionNoteByStage(latest.lifecycle_stage),
    semantic_boundary: FIXED_SEMANTIC_BOUNDARY,
    read_only_notice: "Read-only surfacing only. No approve/execute/complete action is exposed.",
    source: "audit_log_derived",
  };
}
