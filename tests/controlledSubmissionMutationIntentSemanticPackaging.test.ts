import assert from "node:assert/strict";
import {
  CONTROLLED_SUBMISSION_MUTATION_INTENT_FORBIDDEN_SUCCESS_PHRASES,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_CLAUSES,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_NOTICE_LINES,
} from "../lib/controlledSubmissionMutationIntent";
import {
  CONTROLLED_SUBMISSION_MUTATION_INTENT_SEMANTIC_PACKAGING,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_FREEZE_PREP_HANDOFF_SUMMARY,
  getControlledSubmissionMutationIntentFreezePrepHandoffSummary,
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

  const freezePrep = getControlledSubmissionMutationIntentFreezePrepHandoffSummary();
  assert.equal(freezePrep, CONTROLLED_SUBMISSION_MUTATION_INTENT_FREEZE_PREP_HANDOFF_SUMMARY);
  assert.ok(Object.isFrozen(freezePrep));
  assert.equal(freezePrep.scope, "candidate_a_single_object_non_execution_non_completion");
  assert.ok(freezePrep.boundary_equations.includes("lifecycle visibility != completion"));
  assert.ok(freezePrep.boundary_equations.includes("blocked by boundary != approval finalized"));
  assert.ok(freezePrep.forbidden_actions.includes("no completion/execution runtime states"));
  assert.ok(freezePrep.forbidden_actions.includes("no UI write authority increase"));
  assert.ok(freezePrep.non_goals.includes("workflow completion"));
  assert.ok(freezePrep.non_goals.includes("external execution"));

  console.log("controlledSubmissionMutationIntentSemanticPackaging tests passed");
}

run();
