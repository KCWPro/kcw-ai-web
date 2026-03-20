export type ReadinessGuardrailStatement =
  | "readiness_defined != implementation_permitted"
  | "mutation_intent_defined != mutation_committed"
  | "source_of_truth_mapped != source_of_truth_updated"
  | "write_authority_defined != write_authority_granted"
  | "commit_eligible != commit_executed"
  | "lifecycle_defined != runtime_engine_implemented"
  | "audit_minimum_defined != audit_persisted"
  | "idempotency_policy_defined != idempotency_enforced"
  | "rollback_boundary_defined != rollback_executed"
  | "recovery_policy_defined != recovery_performed"
  | "partial_failure_policy_defined != runtime_failure_handled";

export type AntiMisreadTermKey =
  | "minimal_write_object"
  | "controlled_submission_mutation_intent"
  | "commit_eligibility"
  | "commit_attemptable"
  | "persisted_audit_minimum"
  | "future_commit_authority_layer"
  | "source_of_truth";

export type AntiMisreadTerminologyRule = {
  term: AntiMisreadTermKey;
  misread_risk: string;
  forbidden_wording: string;
  preferred_wording: string;
  freeze_compatibility_note: string;
};

export type ReadinessContractHardening = {
  contract_version: "phase9-step3-readiness-hardening-v1";
  mode: "design_time_non_executing_contract";
  guardrails: ReadonlyArray<ReadinessGuardrailStatement>;
  terminology_rules: ReadonlyArray<AntiMisreadTerminologyRule>;
  non_execution_boundary: {
    implementation_permitted: false;
    mutation_committed: false;
    persistence_performed: false;
    external_write_performed: false;
    execution_control_available: false;
    external_side_effects: false;
  };
};

const guardrails: ReadonlyArray<ReadinessGuardrailStatement> = [
  "readiness_defined != implementation_permitted",
  "mutation_intent_defined != mutation_committed",
  "source_of_truth_mapped != source_of_truth_updated",
  "write_authority_defined != write_authority_granted",
  "commit_eligible != commit_executed",
  "lifecycle_defined != runtime_engine_implemented",
  "audit_minimum_defined != audit_persisted",
  "idempotency_policy_defined != idempotency_enforced",
  "rollback_boundary_defined != rollback_executed",
  "recovery_policy_defined != recovery_performed",
  "partial_failure_policy_defined != runtime_failure_handled",
];

const terminologyRules: ReadonlyArray<AntiMisreadTerminologyRule> = [
  {
    term: "minimal_write_object",
    misread_risk: "Can be misread as immediate writable object in runtime.",
    forbidden_wording: "ready to write now",
    preferred_wording: "readiness-defined candidate only",
    freeze_compatibility_note: "Design object definition does not grant write permission.",
  },
  {
    term: "controlled_submission_mutation_intent",
    misread_risk: "Can be misread as mutation execution record.",
    forbidden_wording: "committed submission mutation",
    preferred_wording: "intent record candidate, non-committed",
    freeze_compatibility_note: "Intent semantics must remain non-executing and non-persistent in current phase.",
  },
  {
    term: "commit_eligibility",
    misread_risk: "Can be misread as commit already completed.",
    forbidden_wording: "commit completed",
    preferred_wording: "eligible for future commit attempt only",
    freeze_compatibility_note: "eligible != executed boundary remains mandatory.",
  },
  {
    term: "commit_attemptable",
    misread_risk: "Can be misread as automatic commit path.",
    forbidden_wording: "will auto-commit",
    preferred_wording: "attemptable state in lifecycle design only",
    freeze_compatibility_note: "Lifecycle state naming does not imply runtime engine exists.",
  },
  {
    term: "persisted_audit_minimum",
    misread_risk: "Can be misread as production audit persistence already implemented.",
    forbidden_wording: "audit persisted successfully",
    preferred_wording: "minimum audit contract draft",
    freeze_compatibility_note: "Audit minimum definition does not equal persisted audit system.",
  },
  {
    term: "future_commit_authority_layer",
    misread_risk: "Can be misread as current route/page authority.",
    forbidden_wording: "UI can commit",
    preferred_wording: "future isolated authority owner (not implemented)",
    freeze_compatibility_note: "UI/page layer must remain without write authority.",
  },
  {
    term: "source_of_truth",
    misread_risk: "Can be misread as current source record already updated.",
    forbidden_wording: "source-of-truth updated now",
    preferred_wording: "source-of-truth mapping defined only",
    freeze_compatibility_note: "SoT mapping must remain distinct from record update execution.",
  },
];

export function buildBoundedWriteImplementationReadinessContract(): ReadinessContractHardening {
  return {
    contract_version: "phase9-step3-readiness-hardening-v1",
    mode: "design_time_non_executing_contract",
    guardrails,
    terminology_rules: terminologyRules,
    non_execution_boundary: {
      implementation_permitted: false,
      mutation_committed: false,
      persistence_performed: false,
      external_write_performed: false,
      execution_control_available: false,
      external_side_effects: false,
    },
  };
}
