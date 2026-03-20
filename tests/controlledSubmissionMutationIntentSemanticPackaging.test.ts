import assert from "node:assert/strict";
import {
  ADJUDICATION_LEVEL_SKELETON_CARRYING_IS_NOT_RUNTIME_ACTIVATION_CLAUSE,
  ADJUDICATION_LEVEL_SKELETON_CARRYING_IS_NOT_RUNTIME_CARRYING_CLAUSE,
  ADJUDICATION_LEVEL_SKELETON_CARRYING_IS_NOT_RUNTIME_NOTICE,
  ADJUDICATION_LEVEL_SKELETON_CARRYING_IS_NOT_RUNTIME_ROLLOUT_CLAUSE,
  CANDIDATE_B_SCOPE_LOCK_IS_BOUNDARY_ONLY_NOTICE,
  CANDIDATE_B_SCOPE_LOCK_IS_NOT_RUNTIME_CAPABILITY_UNLOCK_CLAUSE,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_FORBIDDEN_SUCCESS_PHRASES,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_CLAUSES,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_NOTICE_LINES,
} from "../lib/controlledSubmissionMutationIntent";
import {
  CONTROLLED_SUBMISSION_MUTATION_INTENT_SEMANTIC_PACKAGING,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_FREEZE_PREP_HANDOFF_SUMMARY,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE19_ADJUDICATION_LOCK_SUMMARY,
  getControlledSubmissionMutationIntentFreezePrepHandoffSummary,
  getControlledSubmissionMutationIntentPhase19AdjudicationLockSummary,
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
  assert.match(sample, /Boundary revalidation hardening never opens skeleton runtime activation\./i);
  assert.match(sample, /Skeleton-readiness adjudication prep never opens skeleton runtime rollout or activation\./i);
  assert.match(sample, /Adjudication-level skeleton carrying never opens runtime carrying, rollout, or activation\./i);
  assert.match(sample, /Candidate-B scope lock is boundary-only and never unlocks runtime capabilities\./i);
  assert.match(sample, /Continuity revalidation hardening is boundary-only and never capability expansion\./i);
  assert.match(sample, /integrity hardening != capability expansion/i);
  assert.match(sample, /regression anchor != future execution contract/i);
  assert.ok(packaging.boundary_clauses.includes(ADJUDICATION_LEVEL_SKELETON_CARRYING_IS_NOT_RUNTIME_CARRYING_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ADJUDICATION_LEVEL_SKELETON_CARRYING_IS_NOT_RUNTIME_ROLLOUT_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(ADJUDICATION_LEVEL_SKELETON_CARRYING_IS_NOT_RUNTIME_ACTIVATION_CLAUSE));
  assert.ok(packaging.boundary_clauses.includes(CANDIDATE_B_SCOPE_LOCK_IS_NOT_RUNTIME_CAPABILITY_UNLOCK_CLAUSE));
  assert.ok(packaging.boundary_notice_lines.includes(ADJUDICATION_LEVEL_SKELETON_CARRYING_IS_NOT_RUNTIME_NOTICE));
  assert.ok(packaging.boundary_notice_lines.includes(CANDIDATE_B_SCOPE_LOCK_IS_BOUNDARY_ONLY_NOTICE));

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
  assert.ok(freezePrep.boundary_equations.includes("regression anchor != future execution contract"));
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

  console.log("controlledSubmissionMutationIntentSemanticPackaging tests passed");
}

run();
