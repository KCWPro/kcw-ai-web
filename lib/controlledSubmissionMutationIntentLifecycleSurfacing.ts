import type {
  ControlledSubmissionMutationIntentAuditEntry,
  ControlledSubmissionMutationIntentLifecycleStage,
  ControlledSubmissionMutationIntentLifecycleVisibility,
} from "./controlledSubmissionMutationIntent";
import {
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_NOTICE_LINES,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_CLAUSES,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_READ_ONLY_NOTICE,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_SEMANTIC_BOUNDARY,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_TRANSITION_NOTES,
} from "./controlledSubmissionMutationIntent";

export type ControlledSubmissionMutationIntentLifecycleReadModel = {
  visibility_state: "visible" | "not_available";
  current_stage: ControlledSubmissionMutationIntentLifecycleVisibility["current_stage"] | "not_available";
  operator_outcome: ControlledSubmissionMutationIntentLifecycleVisibility["operator_outcome"] | "not_available";
  transition_note: string;
  semantic_boundary_clauses: ControlledSubmissionMutationIntentLifecycleVisibility["semantic_boundary_clauses"];
  boundary_notice_lines: typeof CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_NOTICE_LINES;
  semantic_boundary: ControlledSubmissionMutationIntentLifecycleVisibility["semantic_boundary"];
  read_only_notice: string;
  source: "audit_log_derived" | "no_intent_audit_for_lead";
};

function transitionNoteByStage(stage: ControlledSubmissionMutationIntentLifecycleStage) {
  return CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_TRANSITION_NOTES[stage];
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
      semantic_boundary_clauses: CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_CLAUSES,
      boundary_notice_lines: CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_NOTICE_LINES,
      semantic_boundary: CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_SEMANTIC_BOUNDARY,
      read_only_notice: CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_READ_ONLY_NOTICE,
      source: "no_intent_audit_for_lead",
    };
  }

  return {
    visibility_state: "visible",
    current_stage: latest.lifecycle_stage,
    operator_outcome: latest.operator_outcome,
    transition_note: transitionNoteByStage(latest.lifecycle_stage),
    semantic_boundary_clauses: CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_CLAUSES,
    boundary_notice_lines: CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_NOTICE_LINES,
    semantic_boundary: CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_SEMANTIC_BOUNDARY,
    read_only_notice: CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_READ_ONLY_NOTICE,
    source: "audit_log_derived",
  };
}
