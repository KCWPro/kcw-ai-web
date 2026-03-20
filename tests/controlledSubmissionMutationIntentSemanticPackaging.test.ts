import assert from "node:assert/strict";
import {
  CONTROLLED_SUBMISSION_MUTATION_INTENT_FORBIDDEN_SUCCESS_PHRASES,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_CLAUSES,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_NOTICE_LINES,
} from "../lib/controlledSubmissionMutationIntent";
import {
  CONTROLLED_SUBMISSION_MUTATION_INTENT_SEMANTIC_PACKAGING,
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

  console.log("controlledSubmissionMutationIntentSemanticPackaging tests passed");
}

run();
