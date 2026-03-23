import assert from "node:assert/strict";
import {
  ACTIVE_RUNTIME_CANDIDATE_IS_NARROW_CONTRACT_GATED_ONLY_NOTICE,
  ACTIVE_RUNTIME_CANDIDATE_IS_NOT_COMPLETION_UNLOCK_CLAUSE,
  ACTIVE_RUNTIME_CANDIDATE_IS_NOT_CONTROLLER_ROLLOUT_CLAUSE,
  ACTIVE_RUNTIME_CANDIDATE_IS_NOT_EXECUTION_UNLOCK_CLAUSE,
  ACTIVE_RUNTIME_CANDIDATE_IS_NOT_GENERALIZED_CAPABILITY_ACTIVATION_ACTIVE_CLAUSE,
  ACTIVE_RUNTIME_CANDIDATE_IS_NOT_GENERALIZED_CAPABILITY_ROLLOUT_ACTIVE_CLAUSE,
  ACTIVE_RUNTIME_CONTINUITY_IS_NOT_GENERALIZED_EXECUTION_COMPLETION_CLAUSE,
  ACTIVE_RUNTIME_CONTINUITY_IS_NOT_GENERALIZED_EXECUTION_COMPLETION_NOTICE,
  ACTIVE_RUNTIME_CONTINUITY_IS_NOT_OPERATIONAL_CLOSE_CLAUSE,
  ACTIVE_RUNTIME_CONTINUITY_IS_NOT_OPERATIONAL_CLOSE_NOTICE,
  ACTIVE_READY_ALLOWED_IS_NOT_CAPABILITY_ACTIVE_OPEN_CLAUSE,
  ACTIVE_READY_ALLOWED_IS_NOT_CAPABILITY_ACTIVE_OPEN_NOTICE,
  ACTIVE_READY_IS_BOUNDARY_ONLY_NOTICE,
  ACTIVE_READY_IS_NOT_CAPABILITY_ACTIVATION_ACTIVE_CLAUSE,
  ACTIVE_READY_IS_NOT_CAPABILITY_ROLLOUT_ACTIVE_CLAUSE,
  ACTIVE_READY_IS_NOT_CONTROLLER_ROLLOUT_CLAUSE,
  ACTIVE_READY_IS_NOT_EXECUTION_UNLOCK_CLAUSE,
  ADJUDICATION_LEVEL_SKELETON_CARRYING_IS_NOT_RUNTIME_ACTIVATION_CLAUSE,
  ADJUDICATION_LEVEL_SKELETON_CARRYING_IS_NOT_RUNTIME_CARRYING_CLAUSE,
  ADJUDICATION_LEVEL_SKELETON_CARRYING_IS_NOT_RUNTIME_NOTICE,
  ADJUDICATION_LEVEL_SKELETON_CARRYING_IS_NOT_RUNTIME_ROLLOUT_CLAUSE,
  ALLOWED_ELIGIBLE_READ_MODEL_PRESENCE_IS_NOT_EXECUTION_AUTHORITY_CLAUSE,
  CAPABILITY_LEVEL_SEMANTICS_LOCK_IS_BOUNDARY_ONLY_NOTICE,
  CAPABILITY_LEVEL_SEMANTICS_LOCK_IS_NOT_CAPABILITY_ACTIVATION_ACTIVE_CLAUSE,
  CAPABILITY_LEVEL_SEMANTICS_LOCK_IS_NOT_CONTROLLER_ROLLOUT_CLAUSE,
  CAPABILITY_LEVEL_SEMANTICS_LOCK_IS_NOT_EXECUTION_UNLOCK_CLAUSE,
  CAPABILITY_LEVEL_SEMANTICS_LOCK_IS_NOT_CAPABILITY_ROLLOUT_ACTIVE_CLAUSE,
  CANDIDATE_B_SCOPE_LOCK_IS_BOUNDARY_ONLY_NOTICE,
  CANDIDATE_B_SCOPE_LOCK_IS_NOT_RUNTIME_CAPABILITY_UNLOCK_CLAUSE,
  CONTRACT_GATED_ROLLOUT_ACTIVATION_LEVEL_SKELETON_LOCK_IS_NOT_IMPLEMENTATION_PREWIRE_CLAUSE,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_FORBIDDEN_SUCCESS_PHRASES,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_CLAUSES,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_NOTICE_LINES,
  NARROW_CONTRACT_GATED_ACTIVE_RUNTIME_IS_NOT_IMPLEMENTATION_PREWIRE_BEYOND_SCOPE_CLAUSE,
  NARROW_CONTRACT_GATED_ACTIVE_RUNTIME_IS_NOT_IMPLEMENTATION_PREWIRE_BEYOND_SCOPE_NOTICE,
  NON_ACTIVE_CONTINUITY_IS_BOUNDARY_ONLY_NOTICE,
  NON_ACTIVE_CONTINUITY_IS_NOT_IMPLEMENTATION_PREWIRE_CLAUSE,
  NON_ACTIVE_CONTINUITY_IS_NOT_IMPLEMENTATION_PREWIRE_NOTICE,
  NON_ACTIVE_CONTINUITY_IS_NOT_CAPABILITY_ACTIVATION_ACTIVE_CLAUSE,
  NON_ACTIVE_CONTINUITY_IS_NOT_CAPABILITY_ROLLOUT_ACTIVE_CLAUSE,
  NON_ACTIVE_CONTINUITY_IS_NOT_CONTROLLER_ROLLOUT_CLAUSE,
  NON_ACTIVE_CONTINUITY_IS_NOT_EXECUTION_UNLOCK_CLAUSE,
  READINESS_CONTRACT_IS_BOUNDARY_ONLY_NOTICE,
  READINESS_CONTRACT_IS_NOT_IMPLEMENTATION_PREWIRE_CLAUSE,
  RUNTIME_READINESS_GAP_CLARIFICATION_IS_NON_ACTIVE_ONLY_NOTICE,
  RUNTIME_READINESS_GAP_CLARIFICATION_IS_NOT_IMPLEMENTATION_PREWIRE_CLAUSE,
  RUNTIME_READINESS_GAP_CLARIFICATION_IS_NOT_IMPLEMENTATION_PREWIRE_NOTICE,
  RUNTIME_READINESS_GAP_CLARIFICATION_IS_NOT_RUNTIME_UNLOCK_CLAUSE,
  ROLLOUT_ACTIVATION_LEVEL_SKELETON_LOCK_IS_BOUNDARY_ONLY_NOTICE,
  ROLLOUT_ACTIVATION_LEVEL_SKELETON_LOCK_IS_NOT_CONTROLLER_ROLLOUT_CLAUSE,
  ROLLOUT_ACTIVATION_LEVEL_SKELETON_LOCK_IS_NOT_EXECUTION_UNLOCK_CLAUSE,
  ROLLOUT_ACTIVATION_LEVEL_SKELETON_LOCK_IS_NOT_RUNTIME_CAPABILITY_ACTIVATION_CLAUSE,
  ROLLOUT_ACTIVATION_LEVEL_SKELETON_LOCK_IS_NOT_RUNTIME_CAPABILITY_ROLLOUT_CLAUSE,
  RUNTIME_LEVEL_SEMANTICS_LOCK_IS_BOUNDARY_ONLY_NOTICE,
  RUNTIME_LEVEL_SEMANTICS_LOCK_IS_NOT_CONTROLLER_ROLLOUT_CLAUSE,
  CONTRACT_ONLY_RUNTIME_LEVEL_LOCK_IS_NOT_IMPLEMENTATION_PREWIRE_CLAUSE,
  RUNTIME_LEVEL_SEMANTICS_LOCK_IS_NOT_EXECUTION_UNLOCK_CLAUSE,
  RUNTIME_LEVEL_SEMANTICS_LOCK_IS_NOT_RUNTIME_ACTIVATION_CLAUSE,
  RUNTIME_LEVEL_SEMANTICS_LOCK_IS_NOT_RUNTIME_ROLLOUT_CLAUSE,
} from "../lib/controlledSubmissionMutationIntent";
import {
  CONTROLLED_SUBMISSION_MUTATION_INTENT_SEMANTIC_PACKAGING,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_FREEZE_PREP_HANDOFF_SUMMARY,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE19_ADJUDICATION_LOCK_SUMMARY,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE20_RUNTIME_LEVEL_LOCK_SUMMARY,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE21_ROLLOUT_ACTIVATION_LEVEL_LOCK_SUMMARY,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE22_CAPABILITY_LEVEL_LOCK_HARDENING_SUMMARY,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE23_NON_ACTIVE_CONTINUITY_HARDENING_SUMMARY,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE24_MINIMAL_READINESS_CONTRACT_HARDENING_SUMMARY,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE25_STEP2_MINIMAL_NON_ACTIVE_RUNTIME_READINESS_GAP_HARDENING_SUMMARY,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE26_STEP2_MINIMAL_NARROW_CONTRACT_GATED_ACTIVE_RUNTIME_HARDENING_SUMMARY,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE27_STEP2_MINIMAL_NARROW_ACTIVE_RUNTIME_CONTINUITY_HARDENING_SUMMARY,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE27_STEP3_FREEZE_PREP_NARROW_ACTIVE_RUNTIME_CONTINUITY_CONSISTENCY_CONSOLIDATION_SUMMARY,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE28_STEP2_MINIMAL_NARROW_ACTIVE_RUNTIME_CONTINUITY_HARDENING_SUMMARY,
  getControlledSubmissionMutationIntentFreezePrepHandoffSummary,
  getControlledSubmissionMutationIntentPhase19AdjudicationLockSummary,
  getControlledSubmissionMutationIntentPhase20RuntimeLevelLockSummary,
  getControlledSubmissionMutationIntentPhase21RolloutActivationLevelLockSummary,
  getControlledSubmissionMutationIntentPhase22CapabilityLevelLockHardeningSummary,
  getControlledSubmissionMutationIntentPhase23NonActiveContinuityHardeningSummary,
  getControlledSubmissionMutationIntentPhase24MinimalReadinessContractHardeningSummary,
  getControlledSubmissionMutationIntentPhase25Step2MinimalNonActiveRuntimeReadinessGapHardeningSummary,
  getControlledSubmissionMutationIntentPhase26Step2MinimalNarrowContractGatedActiveRuntimeHardeningSummary,
  getControlledSubmissionMutationIntentPhase27Step2MinimalNarrowActiveRuntimeContinuityHardeningSummary,
  getControlledSubmissionMutationIntentPhase27Step3FreezePrepNarrowActiveRuntimeContinuityConsistencyConsolidationSummary,
  getControlledSubmissionMutationIntentPhase28Step2MinimalNarrowActiveRuntimeContinuityHardeningSummary,
  getControlledSubmissionMutationIntentSemanticPackaging,
} from "../lib/controlledSubmissionMutationIntentSemanticPackaging";

function run() {
  const packaging = getControlledSubmissionMutationIntentSemanticPackaging();
  assert.equal(packaging, CONTROLLED_SUBMISSION_MUTATION_INTENT_SEMANTIC_PACKAGING);
  assert.ok(Object.isFrozen(packaging));
  assert.deepEqual(packaging.boundary_clauses, CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_CLAUSES);
  assert.deepEqual(packaging.boundary_notice_lines, CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_NOTICE_LINES);
  assert.deepEqual(packaging.forbidden_success_phrases, CONTROLLED_SUBMISSION_MUTATION_INTENT_FORBIDDEN_SUCCESS_PHRASES);

  const sample = JSON.stringify({
    boundary_clauses: packaging.boundary_clauses,
    boundary_notice_lines: packaging.boundary_notice_lines,
  });
  assert.doesNotMatch(sample, packaging.forbidden_success_pattern);
  assert.match(sample, /intent recorded != submission completed/i);
  assert.match(sample, /checkpoint availability != approval completion/i);
  assert.match(sample, /readiness\/allowed\/eligible != executed/i);
  assert.match(sample, /allowed\/eligible read-model presence != execution authority/i);
  assert.match(sample, /read-only compatible != controller-capable/i);
  assert.match(sample, /audit trace != persisted audit system/i);
  assert.match(sample, /scope-prep != implementation prewire/i);
  assert.match(sample, /boundary revalidation != skeleton runtime rollout/i);
  assert.match(sample, /boundary revalidation != skeleton runtime activation/i);
  assert.match(sample, /skeleton-readiness adjudication prep != skeleton runtime rollout/i);
  assert.match(sample, /skeleton-readiness adjudication prep != skeleton runtime activation/i);
  assert.match(sample, /adjudication-level skeleton carrying != runtime carrying/i);
  assert.match(sample, /adjudication-level skeleton carrying != skeleton runtime rollout/i);
  assert.match(sample, /adjudication-level skeleton carrying != skeleton runtime activation/i);
  assert.match(sample, /candidate-b scope lock != runtime capability unlock/i);
  assert.match(sample, /runtime-level semantics lock != runtime rollout/i);
  assert.match(sample, /runtime-level semantics lock != runtime activation/i);
  assert.match(sample, /runtime-level semantics lock != execution unlock/i);
  assert.match(sample, /runtime-level semantics lock != controller rollout/i);
  assert.match(sample, /contract-only runtime-level lock != implementation prewire/i);
  assert.match(sample, /rollout\/activation-level skeleton lock != runtime capability rollout/i);
  assert.match(sample, /rollout\/activation-level skeleton lock != runtime capability activation/i);
  assert.match(sample, /rollout\/activation-level skeleton lock != execution unlock/i);
  assert.match(sample, /rollout\/activation-level skeleton lock != controller rollout/i);
  assert.match(sample, /contract-gated rollout\/activation-level skeleton lock != implementation prewire/i);
  assert.match(sample, /capability-level semantics lock != capability rollout active/i);
  assert.match(sample, /capability-level semantics lock != capability activation active/i);
  assert.match(sample, /capability-level semantics lock != execution unlock/i);
  assert.match(sample, /capability-level semantics lock != controller rollout/i);
  assert.match(sample, /non-active continuity != capability rollout active/i);
  assert.match(sample, /non-active continuity != capability activation active/i);
  assert.match(sample, /non-active continuity != execution unlock/i);
  assert.match(sample, /non-active continuity != controller rollout/i);
  assert.match(sample, /non-active continuity != implementation prewire/i);
  assert.match(sample, /active-ready != capability rollout active/i);
  assert.match(sample, /active-ready allowed != capability active open/i);
  assert.match(sample, /active-runtime candidate != generalized capability rollout active/i);
  assert.match(sample, /active-runtime candidate != generalized capability activation active/i);
  assert.match(sample, /active-runtime candidate != execution unlock/i);
  assert.match(sample, /active-runtime candidate != completion unlock/i);
  assert.match(sample, /active-runtime candidate != controller rollout/i);
  assert.match(sample, /active-runtime continuity != operational close/i);
  assert.match(sample, /active-runtime continuity != generalized execution\/completion behavior/i);
  assert.match(sample, /narrow contract-gated active-runtime != implementation prewire beyond scope/i);
  assert.match(sample, /active-ready != capability activation active/i);
  assert.match(sample, /active-ready != execution unlock/i);
  assert.match(sample, /active-ready != controller rollout/i);
  assert.match(sample, /readiness-contract != implementation prewire/i);
  assert.match(sample, /Boundary revalidation hardening never opens skeleton runtime activation\./i);
  assert.match(sample, /Skeleton-readiness adjudication prep never opens skeleton runtime rollout or activation\./i);
  assert.match(sample, /Adjudication-level skeleton carrying never opens runtime carrying, rollout, or activation\./i);
  assert.match(sample, /Candidate-B scope lock is boundary-only and never unlocks runtime capabilities\./i);
  assert.match(sample, /Runtime-level semantics lock is contract-only and never opens rollout, activation, execution, or controller rollout\./i);
  assert.match(
    sample,
    /Rollout\/activation-level skeleton lock is contract-gated and never opens runtime capability rollout, activation, execution, or controller rollout\./i,
  );
  assert.match(
    sample,
    /Capability-level semantics lock is contract-gated candidate-level only and never means capability rollout active, capability activation active, execution unlock, or controller rollout\./i,
  );
  assert.match(
    sample,
    /Active-ready semantics are eligibility-only and never runtime rollout, runtime activation, execution unlock, or controller rollout\./i,
  );
  assert.match(sample, /Readiness-contract semantics are boundary-only and never implementation prewire\./i);
  assert.match(sample, /Active-ready allowed is a readiness-contract state only; capability active remains not open\./i);
  assert.match(
    sample,
    /Active-runtime continuity is boundary-only and never means operational close, platform completion, or unrestricted execution\/completion behavior\./i,
  );
  assert.match(
    sample,
    /Active-runtime continuity remains single-object boundary hardening only; it never opens generalized execution\/completion behavior\./i,
  );
  assert.match(sample, /Continuity revalidation hardening is boundary-only and never capability expansion\./i);
  assert.match(sample, /integrity hardening != capability expansion/i);
  assert.match(sample, /regression anchor != future unrestricted execution contract/i);
  assert.ok(packaging.boundary_clauses.includes(ADJUDICATION_LEVEL_SKELETON_CARRYING_IS_NOT_RUNTIME_CARRYING_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ALLOWED_ELIGIBLE_READ_MODEL_PRESENCE_IS_NOT_EXECUTION_AUTHORITY_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ADJUDICATION_LEVEL_SKELETON_CARRYING_IS_NOT_RUNTIME_ROLLOUT_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ADJUDICATION_LEVEL_SKELETON_CARRYING_IS_NOT_RUNTIME_ACTIVATION_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(CANDIDATE_B_SCOPE_LOCK_IS_NOT_RUNTIME_CAPABILITY_UNLOCK_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(RUNTIME_LEVEL_SEMANTICS_LOCK_IS_NOT_RUNTIME_ROLLOUT_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(RUNTIME_LEVEL_SEMANTICS_LOCK_IS_NOT_RUNTIME_ACTIVATION_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(RUNTIME_LEVEL_SEMANTICS_LOCK_IS_NOT_EXECUTION_UNLOCK_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(RUNTIME_LEVEL_SEMANTICS_LOCK_IS_NOT_CONTROLLER_ROLLOUT_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(CONTRACT_ONLY_RUNTIME_LEVEL_LOCK_IS_NOT_IMPLEMENTATION_PREWIRE_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ROLLOUT_ACTIVATION_LEVEL_SKELETON_LOCK_IS_NOT_RUNTIME_CAPABILITY_ROLLOUT_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ROLLOUT_ACTIVATION_LEVEL_SKELETON_LOCK_IS_NOT_RUNTIME_CAPABILITY_ACTIVATION_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ROLLOUT_ACTIVATION_LEVEL_SKELETON_LOCK_IS_NOT_EXECUTION_UNLOCK_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ROLLOUT_ACTIVATION_LEVEL_SKELETON_LOCK_IS_NOT_CONTROLLER_ROLLOUT_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(CAPABILITY_LEVEL_SEMANTICS_LOCK_IS_NOT_CAPABILITY_ROLLOUT_ACTIVE_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(CAPABILITY_LEVEL_SEMANTICS_LOCK_IS_NOT_CAPABILITY_ACTIVATION_ACTIVE_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(CAPABILITY_LEVEL_SEMANTICS_LOCK_IS_NOT_EXECUTION_UNLOCK_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(CAPABILITY_LEVEL_SEMANTICS_LOCK_IS_NOT_CONTROLLER_ROLLOUT_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(NON_ACTIVE_CONTINUITY_IS_NOT_CAPABILITY_ROLLOUT_ACTIVE_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(NON_ACTIVE_CONTINUITY_IS_NOT_CAPABILITY_ACTIVATION_ACTIVE_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(NON_ACTIVE_CONTINUITY_IS_NOT_EXECUTION_UNLOCK_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(NON_ACTIVE_CONTINUITY_IS_NOT_CONTROLLER_ROLLOUT_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(NON_ACTIVE_CONTINUITY_IS_NOT_IMPLEMENTATION_PREWIRE_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ACTIVE_READY_IS_NOT_CAPABILITY_ROLLOUT_ACTIVE_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ACTIVE_READY_ALLOWED_IS_NOT_CAPABILITY_ACTIVE_OPEN_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ACTIVE_RUNTIME_CANDIDATE_IS_NOT_GENERALIZED_CAPABILITY_ROLLOUT_ACTIVE_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ACTIVE_RUNTIME_CANDIDATE_IS_NOT_GENERALIZED_CAPABILITY_ACTIVATION_ACTIVE_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ACTIVE_RUNTIME_CANDIDATE_IS_NOT_EXECUTION_UNLOCK_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ACTIVE_RUNTIME_CANDIDATE_IS_NOT_COMPLETION_UNLOCK_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ACTIVE_RUNTIME_CANDIDATE_IS_NOT_CONTROLLER_ROLLOUT_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ACTIVE_RUNTIME_CONTINUITY_IS_NOT_OPERATIONAL_CLOSE_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ACTIVE_RUNTIME_CONTINUITY_IS_NOT_GENERALIZED_EXECUTION_COMPLETION_CLAUSE));
  assert.ok(
    packaging.boundary_clauses.includes(
      NARROW_CONTRACT_GATED_ACTIVE_RUNTIME_IS_NOT_IMPLEMENTATION_PREWIRE_BEYOND_SCOPE_CLAUSE,
    ),
  );
  assert.ok(packaging.boundary_clauses.includes(RUNTIME_READINESS_GAP_CLARIFICATION_IS_NOT_RUNTIME_UNLOCK_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(RUNTIME_READINESS_GAP_CLARIFICATION_IS_NOT_IMPLEMENTATION_PREWIRE_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ACTIVE_READY_IS_NOT_CAPABILITY_ACTIVATION_ACTIVE_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ACTIVE_READY_IS_NOT_EXECUTION_UNLOCK_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ACTIVE_READY_IS_NOT_CONTROLLER_ROLLOUT_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(READINESS_CONTRACT_IS_NOT_IMPLEMENTATION_PREWIRE_CLAUSE));
  assert.ok(
    packaging.boundary_clauses.includes(CONTRACT_GATED_ROLLOUT_ACTIVATION_LEVEL_SKELETON_LOCK_IS_NOT_IMPLEMENTATION_PREWIRE_CLAUSE),
  );
  assert.ok(packaging.boundary_notice_lines.includes(ADJUDICATION_LEVEL_SKELETON_CARRYING_IS_NOT_RUNTIME_NOTICE));
  assert.ok(packaging.boundary_notice_lines.includes(CANDIDATE_B_SCOPE_LOCK_IS_BOUNDARY_ONLY_NOTICE));
  assert.ok(packaging.boundary_notice_lines.includes(RUNTIME_LEVEL_SEMANTICS_LOCK_IS_BOUNDARY_ONLY_NOTICE));
  assert.ok(packaging.boundary_notice_lines.includes(ROLLOUT_ACTIVATION_LEVEL_SKELETON_LOCK_IS_BOUNDARY_ONLY_NOTICE));
  assert.ok(packaging.boundary_notice_lines.includes(CAPABILITY_LEVEL_SEMANTICS_LOCK_IS_BOUNDARY_ONLY_NOTICE));
  assert.ok(packaging.boundary_notice_lines.includes(NON_ACTIVE_CONTINUITY_IS_BOUNDARY_ONLY_NOTICE));
  assert.ok(packaging.boundary_notice_lines.includes(NON_ACTIVE_CONTINUITY_IS_NOT_IMPLEMENTATION_PREWIRE_NOTICE));
  assert.ok(packaging.boundary_notice_lines.includes(ACTIVE_READY_IS_BOUNDARY_ONLY_NOTICE));
  assert.ok(packaging.boundary_notice_lines.includes(READINESS_CONTRACT_IS_BOUNDARY_ONLY_NOTICE));
  assert.ok(packaging.boundary_notice_lines.includes(ACTIVE_READY_ALLOWED_IS_NOT_CAPABILITY_ACTIVE_OPEN_NOTICE));
  assert.ok(packaging.boundary_notice_lines.includes(ACTIVE_RUNTIME_CANDIDATE_IS_NARROW_CONTRACT_GATED_ONLY_NOTICE));
  assert.ok(packaging.boundary_notice_lines.includes(ACTIVE_RUNTIME_CONTINUITY_IS_NOT_OPERATIONAL_CLOSE_NOTICE));
  assert.ok(
    packaging.boundary_notice_lines.includes(ACTIVE_RUNTIME_CONTINUITY_IS_NOT_GENERALIZED_EXECUTION_COMPLETION_NOTICE),
  );
  assert.ok(
    packaging.boundary_notice_lines.includes(
      NARROW_CONTRACT_GATED_ACTIVE_RUNTIME_IS_NOT_IMPLEMENTATION_PREWIRE_BEYOND_SCOPE_NOTICE,
    ),
  );
  assert.ok(packaging.boundary_notice_lines.includes(RUNTIME_READINESS_GAP_CLARIFICATION_IS_NON_ACTIVE_ONLY_NOTICE));
  assert.ok(packaging.boundary_notice_lines.includes(RUNTIME_READINESS_GAP_CLARIFICATION_IS_NOT_IMPLEMENTATION_PREWIRE_NOTICE));

  const freezePrep = getControlledSubmissionMutationIntentFreezePrepHandoffSummary();
  assert.equal(freezePrep, CONTROLLED_SUBMISSION_MUTATION_INTENT_FREEZE_PREP_HANDOFF_SUMMARY);
  assert.ok(Object.isFrozen(freezePrep));
  assert.equal(freezePrep.scope, "candidate_a_single_object_non_execution_non_completion");
  assert.ok(freezePrep.boundary_equations.includes("lifecycle visibility != completion"));
  assert.ok(freezePrep.boundary_equations.includes("checkpoint availability != approval completion"));
  assert.ok(freezePrep.boundary_equations.includes("blocked by boundary != approval finalized"));
  assert.ok(freezePrep.boundary_equations.includes("read-only compatible != controller-capable"));
  assert.ok(freezePrep.boundary_equations.includes("surfacing != controller"));
  assert.ok(freezePrep.boundary_equations.includes("single-object semantic package != multi-object workflow engine"));
  assert.ok(freezePrep.boundary_equations.includes("scope-prep != implementation prewire"));
  assert.ok(freezePrep.boundary_equations.includes("boundary revalidation != skeleton runtime rollout"));
  assert.ok(freezePrep.boundary_equations.includes("boundary revalidation != skeleton runtime activation"));
  assert.ok(freezePrep.boundary_equations.includes("skeleton-readiness adjudication prep != skeleton runtime rollout"));
  assert.ok(freezePrep.boundary_equations.includes("skeleton-readiness adjudication prep != skeleton runtime activation"));
  assert.ok(freezePrep.boundary_equations.includes("continuity revalidation != capability expansion"));
  assert.ok(freezePrep.boundary_equations.includes("integrity hardening != capability expansion"));
  assert.ok(freezePrep.boundary_equations.includes("regression anchor != future unrestricted execution contract"));
  assert.ok(freezePrep.forbidden_actions.includes("no skeleton runtime rollout"));
  assert.ok(freezePrep.forbidden_actions.includes("no skeleton runtime activation"));
  assert.ok(freezePrep.forbidden_actions.includes("no completion/execution runtime states"));
  assert.ok(freezePrep.forbidden_actions.includes("no implementation prewire"));
  assert.ok(freezePrep.forbidden_actions.includes("no UI write authority increase"));
  assert.ok(freezePrep.non_goals.includes("workflow completion"));
  assert.ok(freezePrep.non_goals.includes("external execution"));

  const phase19Lock = getControlledSubmissionMutationIntentPhase19AdjudicationLockSummary();
  assert.equal(phase19Lock, CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE19_ADJUDICATION_LOCK_SUMMARY);
  assert.ok(Object.isFrozen(phase19Lock));
  assert.equal(phase19Lock.scope, "candidate_b_single_object_adjudication_level_non_runtime");
  assert.ok(phase19Lock.boundary_equations.includes("adjudication-level skeleton carrying != runtime carrying"));
  assert.ok(phase19Lock.boundary_equations.includes("adjudication-level skeleton carrying != skeleton runtime rollout"));
  assert.ok(phase19Lock.boundary_equations.includes("adjudication-level skeleton carrying != skeleton runtime activation"));
  assert.ok(phase19Lock.boundary_equations.includes("candidate-b scope lock != runtime capability unlock"));
  assert.ok(phase19Lock.forbidden_actions.includes("no runtime carrying"));
  assert.ok(phase19Lock.forbidden_actions.includes("no skeleton runtime rollout"));
  assert.ok(phase19Lock.forbidden_actions.includes("no skeleton runtime activation"));
  assert.ok(phase19Lock.forbidden_actions.includes("no execution/completion runtime states"));
  assert.ok(phase19Lock.forbidden_actions.includes("no implementation prewire"));

  const phase20Lock = getControlledSubmissionMutationIntentPhase20RuntimeLevelLockSummary();
  assert.equal(phase20Lock, CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE20_RUNTIME_LEVEL_LOCK_SUMMARY);
  assert.ok(Object.isFrozen(phase20Lock));
  assert.equal(phase20Lock.scope, "candidate_b_single_object_runtime_level_semantics_lock_only");
  assert.ok(phase20Lock.boundary_equations.includes("runtime-level semantics lock != runtime rollout"));
  assert.ok(phase20Lock.boundary_equations.includes("runtime-level semantics lock != runtime activation"));
  assert.ok(phase20Lock.boundary_equations.includes("runtime-level semantics lock != execution unlock"));
  assert.ok(phase20Lock.boundary_equations.includes("runtime-level semantics lock != controller rollout"));
  assert.ok(phase20Lock.boundary_equations.includes("contract-only runtime-level lock != implementation prewire"));
  assert.ok(phase20Lock.forbidden_actions.includes("no runtime rollout"));
  assert.ok(phase20Lock.forbidden_actions.includes("no runtime activation"));
  assert.ok(phase20Lock.forbidden_actions.includes("no execution unlock"));
  assert.ok(phase20Lock.forbidden_actions.includes("no controller rollout"));
  assert.ok(phase20Lock.forbidden_actions.includes("no implementation prewire"));

  const phase21Lock = getControlledSubmissionMutationIntentPhase21RolloutActivationLevelLockSummary();
  assert.equal(phase21Lock, CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE21_ROLLOUT_ACTIVATION_LEVEL_LOCK_SUMMARY);
  assert.ok(Object.isFrozen(phase21Lock));
  assert.equal(phase21Lock.scope, "candidate_b_single_object_rollout_activation_level_skeleton_lock_only");
  assert.ok(phase21Lock.boundary_equations.includes("rollout/activation-level skeleton lock != runtime capability rollout"));
  assert.ok(phase21Lock.boundary_equations.includes("rollout/activation-level skeleton lock != runtime capability activation"));
  assert.ok(phase21Lock.boundary_equations.includes("rollout/activation-level skeleton lock != execution unlock"));
  assert.ok(phase21Lock.boundary_equations.includes("rollout/activation-level skeleton lock != controller rollout"));
  assert.ok(phase21Lock.boundary_equations.includes("capability-level semantics lock != capability rollout active"));
  assert.ok(phase21Lock.boundary_equations.includes("capability-level semantics lock != capability activation active"));
  assert.ok(phase21Lock.boundary_equations.includes("capability-level semantics lock != execution unlock"));
  assert.ok(phase21Lock.boundary_equations.includes("capability-level semantics lock != controller rollout"));
  assert.ok(phase21Lock.boundary_equations.includes("allowed/eligible read-model presence != execution authority"));
  assert.ok(
    phase21Lock.boundary_equations.includes("contract-gated rollout/activation-level skeleton lock != implementation prewire"),
  );
  assert.ok(phase21Lock.forbidden_actions.includes("no runtime capability rollout"));
  assert.ok(phase21Lock.forbidden_actions.includes("no runtime capability activation"));
  assert.ok(phase21Lock.forbidden_actions.includes("no execution unlock"));
  assert.ok(phase21Lock.forbidden_actions.includes("no controller rollout"));
  assert.ok(phase21Lock.forbidden_actions.includes("no implementation prewire"));
  assert.ok(phase21Lock.forbidden_actions.includes("no capability rollout active"));
  assert.ok(phase21Lock.forbidden_actions.includes("no capability activation active"));

  const phase22Lock = getControlledSubmissionMutationIntentPhase22CapabilityLevelLockHardeningSummary();
  assert.equal(phase22Lock, CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE22_CAPABILITY_LEVEL_LOCK_HARDENING_SUMMARY);
  assert.ok(Object.isFrozen(phase22Lock));
  assert.equal(phase22Lock.scope, "candidate_b_single_object_capability_level_semantics_lock_only");
  assert.ok(phase22Lock.boundary_equations.includes("capability-level semantics lock != capability rollout active"));
  assert.ok(phase22Lock.boundary_equations.includes("capability-level semantics lock != capability activation active"));
  assert.ok(phase22Lock.boundary_equations.includes("capability-level semantics lock != execution unlock"));
  assert.ok(phase22Lock.boundary_equations.includes("capability-level semantics lock != controller rollout"));
  assert.ok(
    phase22Lock.boundary_equations.includes("contract-gated rollout/activation-level skeleton lock != implementation prewire"),
  );
  assert.ok(phase22Lock.boundary_notice_lines.includes(ROLLOUT_ACTIVATION_LEVEL_SKELETON_LOCK_IS_BOUNDARY_ONLY_NOTICE));
  assert.ok(phase22Lock.boundary_notice_lines.includes(CAPABILITY_LEVEL_SEMANTICS_LOCK_IS_BOUNDARY_ONLY_NOTICE));
  assert.ok(phase22Lock.forbidden_actions.includes("no capability rollout active"));
  assert.ok(phase22Lock.forbidden_actions.includes("no capability activation active"));
  assert.ok(phase22Lock.forbidden_actions.includes("no execution unlock"));
  assert.ok(phase22Lock.forbidden_actions.includes("no controller rollout"));
  assert.ok(phase22Lock.forbidden_actions.includes("no implementation prewire"));
  assert.ok(phase22Lock.forbidden_actions.includes("no multi-object workflow expansion"));

  const phase23Lock = getControlledSubmissionMutationIntentPhase23NonActiveContinuityHardeningSummary();
  assert.equal(phase23Lock, CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE23_NON_ACTIVE_CONTINUITY_HARDENING_SUMMARY);
  assert.ok(Object.isFrozen(phase23Lock));
  assert.equal(phase23Lock.scope, "candidate_a_single_object_contract_gated_non_active_continuity_only");
  assert.ok(phase23Lock.boundary_equations.includes("non-active continuity != capability rollout active"));
  assert.ok(phase23Lock.boundary_equations.includes("non-active continuity != capability activation active"));
  assert.ok(phase23Lock.boundary_equations.includes("non-active continuity != execution unlock"));
  assert.ok(phase23Lock.boundary_equations.includes("non-active continuity != controller rollout"));
  assert.ok(phase23Lock.boundary_equations.includes("non-active continuity != implementation prewire"));
  assert.ok(phase23Lock.boundary_equations.includes("allowed/eligible read-model presence != execution authority"));
  assert.ok(phase23Lock.boundary_notice_lines.includes(CAPABILITY_LEVEL_SEMANTICS_LOCK_IS_BOUNDARY_ONLY_NOTICE));
  assert.ok(phase23Lock.boundary_notice_lines.includes(NON_ACTIVE_CONTINUITY_IS_BOUNDARY_ONLY_NOTICE));
  assert.ok(phase23Lock.boundary_notice_lines.includes(NON_ACTIVE_CONTINUITY_IS_NOT_IMPLEMENTATION_PREWIRE_NOTICE));
  assert.ok(phase23Lock.forbidden_actions.includes("no capability rollout active"));
  assert.ok(phase23Lock.forbidden_actions.includes("no capability activation active"));
  assert.ok(phase23Lock.forbidden_actions.includes("no execution unlock"));
  assert.ok(phase23Lock.forbidden_actions.includes("no controller rollout"));
  assert.ok(phase23Lock.forbidden_actions.includes("no implementation prewire"));

  const phase24Lock = getControlledSubmissionMutationIntentPhase24MinimalReadinessContractHardeningSummary();
  assert.equal(phase24Lock, CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE24_MINIMAL_READINESS_CONTRACT_HARDENING_SUMMARY);
  assert.ok(Object.isFrozen(phase24Lock));
  assert.equal(phase24Lock.scope, "candidate_b_single_object_minimal_readiness_contract_hardening_only");
  assert.ok(phase24Lock.boundary_equations.includes("active-ready != capability rollout active"));
  assert.ok(phase24Lock.boundary_equations.includes("active-ready allowed != capability active open"));
  assert.ok(phase24Lock.boundary_equations.includes("active-ready != capability activation active"));
  assert.ok(phase24Lock.boundary_equations.includes("active-ready != execution unlock"));
  assert.ok(phase24Lock.boundary_equations.includes("active-ready != controller rollout"));
  assert.ok(phase24Lock.boundary_equations.includes("readiness-contract != implementation prewire"));
  assert.ok(phase24Lock.boundary_notice_lines.includes(ACTIVE_READY_IS_BOUNDARY_ONLY_NOTICE));
  assert.ok(phase24Lock.boundary_notice_lines.includes(READINESS_CONTRACT_IS_BOUNDARY_ONLY_NOTICE));
  assert.ok(phase24Lock.boundary_notice_lines.includes(ACTIVE_READY_ALLOWED_IS_NOT_CAPABILITY_ACTIVE_OPEN_NOTICE));
  assert.ok(phase24Lock.boundary_notice_lines.includes(RUNTIME_READINESS_GAP_CLARIFICATION_IS_NON_ACTIVE_ONLY_NOTICE));
  assert.ok(phase24Lock.forbidden_actions.includes("no capability rollout active"));
  assert.ok(phase24Lock.forbidden_actions.includes("no capability activation active"));
  assert.ok(phase24Lock.forbidden_actions.includes("no execution unlock"));
  assert.ok(phase24Lock.forbidden_actions.includes("no controller rollout"));
  assert.ok(phase24Lock.forbidden_actions.includes("no implementation prewire"));

  const phase25Step2Lock = getControlledSubmissionMutationIntentPhase25Step2MinimalNonActiveRuntimeReadinessGapHardeningSummary();
  assert.equal(
    phase25Step2Lock,
    CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE25_STEP2_MINIMAL_NON_ACTIVE_RUNTIME_READINESS_GAP_HARDENING_SUMMARY,
  );
  assert.ok(Object.isFrozen(phase25Step2Lock));
  assert.equal(
    phase25Step2Lock.scope,
    "candidate_a_single_object_minimal_non_active_runtime_readiness_gap_hardening_only",
  );
  assert.ok(phase25Step2Lock.boundary_equations.includes("active-ready allowed != capability active open"));
  assert.ok(phase25Step2Lock.boundary_equations.includes("active-ready != capability rollout active"));
  assert.ok(phase25Step2Lock.boundary_equations.includes("active-ready != capability activation active"));
  assert.ok(phase25Step2Lock.boundary_equations.includes("active-ready != execution unlock"));
  assert.ok(phase25Step2Lock.boundary_equations.includes("active-ready != controller rollout"));
  assert.ok(phase25Step2Lock.boundary_equations.includes("runtime-readiness gap clarification != runtime unlock"));
  assert.ok(phase25Step2Lock.boundary_equations.includes("runtime-readiness gap clarification != implementation prewire"));
  assert.ok(phase25Step2Lock.boundary_equations.includes("readiness-contract != implementation prewire"));
  assert.ok(
    phase25Step2Lock.boundary_notice_lines.includes(RUNTIME_READINESS_GAP_CLARIFICATION_IS_NON_ACTIVE_ONLY_NOTICE),
  );
  assert.ok(
    phase25Step2Lock.boundary_notice_lines.includes(RUNTIME_READINESS_GAP_CLARIFICATION_IS_NOT_IMPLEMENTATION_PREWIRE_NOTICE),
  );
  assert.ok(phase25Step2Lock.forbidden_actions.includes("no runtime unlock"));
  assert.ok(phase25Step2Lock.forbidden_actions.includes("no capability rollout active"));
  assert.ok(phase25Step2Lock.forbidden_actions.includes("no capability activation active"));
  assert.ok(phase25Step2Lock.forbidden_actions.includes("no execution unlock"));
  assert.ok(phase25Step2Lock.forbidden_actions.includes("no controller rollout"));
  assert.ok(phase25Step2Lock.forbidden_actions.includes("no implementation prewire"));

  const phase26Step2Lock = getControlledSubmissionMutationIntentPhase26Step2MinimalNarrowContractGatedActiveRuntimeHardeningSummary();
  assert.equal(
    phase26Step2Lock,
    CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE26_STEP2_MINIMAL_NARROW_CONTRACT_GATED_ACTIVE_RUNTIME_HARDENING_SUMMARY,
  );
  assert.ok(Object.isFrozen(phase26Step2Lock));
  assert.equal(
    phase26Step2Lock.scope,
    "candidate_b_single_object_minimal_narrow_contract_gated_active_runtime_hardening_only",
  );
  assert.ok(
    phase26Step2Lock.boundary_equations.includes("active-runtime candidate != generalized capability rollout active"),
  );
  assert.ok(
    phase26Step2Lock.boundary_equations.includes("active-runtime candidate != generalized capability activation active"),
  );
  assert.ok(phase26Step2Lock.boundary_equations.includes("active-runtime candidate != execution unlock"));
  assert.ok(phase26Step2Lock.boundary_equations.includes("active-runtime candidate != completion unlock"));
  assert.ok(phase26Step2Lock.boundary_equations.includes("active-runtime candidate != controller rollout"));
  assert.ok(
    phase26Step2Lock.boundary_equations.includes(
      "narrow contract-gated active-runtime != implementation prewire beyond scope",
    ),
  );
  assert.ok(
    phase26Step2Lock.boundary_notice_lines.includes(ACTIVE_RUNTIME_CANDIDATE_IS_NARROW_CONTRACT_GATED_ONLY_NOTICE),
  );
  assert.ok(
    phase26Step2Lock.boundary_notice_lines.includes(
      NARROW_CONTRACT_GATED_ACTIVE_RUNTIME_IS_NOT_IMPLEMENTATION_PREWIRE_BEYOND_SCOPE_NOTICE,
    ),
  );
  assert.ok(phase26Step2Lock.forbidden_actions.includes("no generalized capability rollout active"));
  assert.ok(phase26Step2Lock.forbidden_actions.includes("no generalized capability activation active"));
  assert.ok(phase26Step2Lock.forbidden_actions.includes("no completion unlock"));

  const phase27Step2Lock = getControlledSubmissionMutationIntentPhase27Step2MinimalNarrowActiveRuntimeContinuityHardeningSummary();
  assert.equal(
    phase27Step2Lock,
    CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE27_STEP2_MINIMAL_NARROW_ACTIVE_RUNTIME_CONTINUITY_HARDENING_SUMMARY,
  );
  assert.ok(Object.isFrozen(phase27Step2Lock));
  assert.equal(
    phase27Step2Lock.scope,
    "candidate_a_single_object_minimal_narrow_active_runtime_continuity_hardening_only",
  );
  assert.ok(
    phase27Step2Lock.boundary_equations.includes("active-runtime candidate != generalized capability rollout active"),
  );
  assert.ok(
    phase27Step2Lock.boundary_equations.includes("active-runtime candidate != generalized capability activation active"),
  );
  assert.ok(phase27Step2Lock.boundary_equations.includes("active-runtime candidate != execution unlock"));
  assert.ok(phase27Step2Lock.boundary_equations.includes("active-runtime candidate != completion unlock"));
  assert.ok(phase27Step2Lock.boundary_equations.includes("active-runtime candidate != controller rollout"));
  assert.ok(phase27Step2Lock.boundary_equations.includes(ACTIVE_RUNTIME_CONTINUITY_IS_NOT_OPERATIONAL_CLOSE_CLAUSE));
  assert.ok(
    phase27Step2Lock.boundary_equations.includes(ACTIVE_RUNTIME_CONTINUITY_IS_NOT_GENERALIZED_EXECUTION_COMPLETION_CLAUSE),
  );
  assert.ok(
    phase27Step2Lock.boundary_notice_lines.includes(ACTIVE_RUNTIME_CANDIDATE_IS_NARROW_CONTRACT_GATED_ONLY_NOTICE),
  );
  assert.ok(phase27Step2Lock.boundary_notice_lines.includes(ACTIVE_RUNTIME_CONTINUITY_IS_NOT_OPERATIONAL_CLOSE_NOTICE));
  assert.ok(
    phase27Step2Lock.boundary_notice_lines.includes(
      ACTIVE_RUNTIME_CONTINUITY_IS_NOT_GENERALIZED_EXECUTION_COMPLETION_NOTICE,
    ),
  );
  assert.ok(
    phase27Step2Lock.boundary_notice_lines.includes(
      NARROW_CONTRACT_GATED_ACTIVE_RUNTIME_IS_NOT_IMPLEMENTATION_PREWIRE_BEYOND_SCOPE_NOTICE,
    ),
  );
  assert.ok(phase27Step2Lock.forbidden_actions.includes("no generalized capability rollout active"));
  assert.ok(phase27Step2Lock.forbidden_actions.includes("no generalized capability activation active"));
  assert.ok(phase27Step2Lock.forbidden_actions.includes("no execution unlock"));
  assert.ok(phase27Step2Lock.forbidden_actions.includes("no completion unlock"));
  assert.ok(phase27Step2Lock.forbidden_actions.includes("no operational close"));
  assert.ok(phase27Step2Lock.forbidden_actions.includes("no generalized execution/completion behavior"));

  const phase27Step3FreezePrep =
    getControlledSubmissionMutationIntentPhase27Step3FreezePrepNarrowActiveRuntimeContinuityConsistencyConsolidationSummary();
  assert.equal(
    phase27Step3FreezePrep,
    CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE27_STEP3_FREEZE_PREP_NARROW_ACTIVE_RUNTIME_CONTINUITY_CONSISTENCY_CONSOLIDATION_SUMMARY,
  );
  assert.ok(Object.isFrozen(phase27Step3FreezePrep));
  assert.equal(
    phase27Step3FreezePrep.scope,
    "candidate_a_single_object_freeze_prep_narrow_active_runtime_continuity_consistency_only",
  );
  assert.ok(
    phase27Step3FreezePrep.boundary_equations.includes("active-runtime candidate != generalized capability rollout active"),
  );
  assert.ok(
    phase27Step3FreezePrep.boundary_equations.includes("active-runtime candidate != generalized capability activation active"),
  );
  assert.ok(phase27Step3FreezePrep.boundary_equations.includes("active-runtime candidate != execution unlock"));
  assert.ok(phase27Step3FreezePrep.boundary_equations.includes("active-runtime candidate != completion unlock"));
  assert.ok(phase27Step3FreezePrep.boundary_equations.includes("active-runtime candidate != controller rollout"));
  assert.ok(
    phase27Step3FreezePrep.boundary_equations.includes(ACTIVE_RUNTIME_CONTINUITY_IS_NOT_OPERATIONAL_CLOSE_CLAUSE),
  );
  assert.ok(
    phase27Step3FreezePrep.boundary_equations.includes(
      ACTIVE_RUNTIME_CONTINUITY_IS_NOT_GENERALIZED_EXECUTION_COMPLETION_CLAUSE,
    ),
  );
  assert.ok(phase27Step3FreezePrep.boundary_equations.includes("regression anchor != future unrestricted execution contract"));
  assert.ok(
    phase27Step3FreezePrep.boundary_notice_lines.includes(ACTIVE_RUNTIME_CANDIDATE_IS_NARROW_CONTRACT_GATED_ONLY_NOTICE),
  );
  assert.ok(
    phase27Step3FreezePrep.boundary_notice_lines.includes(ACTIVE_RUNTIME_CONTINUITY_IS_NOT_OPERATIONAL_CLOSE_NOTICE),
  );
  assert.ok(
    phase27Step3FreezePrep.boundary_notice_lines.includes(
      ACTIVE_RUNTIME_CONTINUITY_IS_NOT_GENERALIZED_EXECUTION_COMPLETION_NOTICE,
    ),
  );
  assert.ok(phase27Step3FreezePrep.forbidden_actions.includes("no operational close"));
  assert.ok(phase27Step3FreezePrep.forbidden_actions.includes("no generalized execution/completion behavior"));

  const phase28Step2Lock = getControlledSubmissionMutationIntentPhase28Step2MinimalNarrowActiveRuntimeContinuityHardeningSummary();
  assert.equal(
    phase28Step2Lock,
    CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE28_STEP2_MINIMAL_NARROW_ACTIVE_RUNTIME_CONTINUITY_HARDENING_SUMMARY,
  );
  assert.ok(Object.isFrozen(phase28Step2Lock));
  assert.equal(
    phase28Step2Lock.scope,
    "candidate_a_single_object_phase28_step2_minimal_narrow_active_runtime_continuity_hardening_only",
  );
  assert.ok(
    phase28Step2Lock.boundary_equations.includes(ACTIVE_RUNTIME_CONTINUITY_IS_NOT_OPERATIONAL_CLOSE_CLAUSE),
  );
  assert.ok(
    phase28Step2Lock.boundary_equations.includes(
      ACTIVE_RUNTIME_CONTINUITY_IS_NOT_GENERALIZED_EXECUTION_COMPLETION_CLAUSE,
    ),
  );
  assert.ok(
    phase28Step2Lock.boundary_notice_lines.includes(
      ACTIVE_RUNTIME_CONTINUITY_IS_NOT_GENERALIZED_EXECUTION_COMPLETION_NOTICE,
    ),
  );
  assert.ok(phase28Step2Lock.forbidden_actions.includes("no generalized execution/completion behavior"));

  console.log("controlledSubmissionMutationIntentSemanticPackaging tests passed");
}

run();
