import {
  buildControlledSubmissionMutationIntentForbiddenSuccessPattern,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_FORBIDDEN_SUCCESS_PHRASES,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_CLAUSES,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_NOTICE_LINES,
} from "./controlledSubmissionMutationIntent";

export const CONTROLLED_SUBMISSION_MUTATION_INTENT_SEMANTIC_PACKAGING = Object.freeze({
  boundary_clauses: CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_CLAUSES,
  boundary_notice_lines: CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_NOTICE_LINES,
  forbidden_success_phrases: CONTROLLED_SUBMISSION_MUTATION_INTENT_FORBIDDEN_SUCCESS_PHRASES,
  forbidden_success_pattern: buildControlledSubmissionMutationIntentForbiddenSuccessPattern(),
});

export const CONTROLLED_SUBMISSION_MUTATION_INTENT_FREEZE_PREP_HANDOFF_SUMMARY = Object.freeze({
  scope: "candidate_a_single_object_non_execution_non_completion",
  boundary_equations: [
    "lifecycle visibility != completion",
    "read-only surfacing != execution trigger",
    "terminology alignment != semantic expansion",
    "regression hardening != generalized workflow engine",
    "handoff readiness != workflow executed",
    "intent recorded != submission completed",
    "checkpoint availability != approval completion",
    "replayed idempotently != workflow completed",
    "blocked by boundary != approval finalized",
    "readiness/allowed/eligible != executed",
    "read-only compatible != controller-capable",
    "audit trace != persisted audit system",
    "surfacing != controller",
    "single-object semantic package != multi-object workflow engine",
    "integrity hardening != capability expansion",
    "regression anchor != future execution contract",
  ] as const,
  forbidden_actions: [
    "no approve/execute/finalize/complete entry",
    "no completion/execution runtime states",
    "no real execution logic",
    "no external side effects",
    "no persistence expansion",
    "no durable audit platform",
    "no multi-object orchestration",
    "no generalized workflow engine",
    "no workflow completed state",
    "no UI write authority increase",
    "no implementation prewire",
  ] as const,
  non_goals: [
    "submission completion",
    "approval completion",
    "workflow completion",
    "external execution",
    "durable audit platform rollout",
  ] as const,
});

export function getControlledSubmissionMutationIntentSemanticPackaging() {
  return CONTROLLED_SUBMISSION_MUTATION_INTENT_SEMANTIC_PACKAGING;
}

export function getControlledSubmissionMutationIntentFreezePrepHandoffSummary() {
  return CONTROLLED_SUBMISSION_MUTATION_INTENT_FREEZE_PREP_HANDOFF_SUMMARY;
}
