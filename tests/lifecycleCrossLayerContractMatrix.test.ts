import assert from "node:assert/strict";
import {
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_CLAUSES,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_READ_ONLY_NOTICE,
  CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_TRANSITION_NOTES,
  listControlledSubmissionMutationIntentAuditLog,
  recordControlledSubmissionMutationIntent,
  resetControlledSubmissionMutationIntentStore,
} from "../lib/controlledSubmissionMutationIntent";
import { buildControlledSubmissionMutationIntentLifecycleReadModel } from "../lib/controlledSubmissionMutationIntentLifecycleSurfacing";
import { getControlledSubmissionMutationIntentSemanticPackaging } from "../lib/controlledSubmissionMutationIntentSemanticPackaging";

function readyInput() {
  return {
    decision_status: "ready_for_manual_progress" as const,
    selected_path_category: "human_confirmed_path" as const,
    selected_path_id: "path_follow_up_review",
    manual_confirmation_received: true,
    intake_quality_gate_passed: true,
    follow_up_alignment_status: "aligned" as const,
    path_availability: "available" as const,
    has_blocking_risk: false,
  };
}

function key(leadId: string) {
  return `intent::${leadId}::path:path_follow_up_review::v1`;
}

function run() {
  const packaging = getControlledSubmissionMutationIntentSemanticPackaging();
  resetControlledSubmissionMutationIntentStore();

  const accepted = recordControlledSubmissionMutationIntent({
    lead_id: "lead-1001",
    actor_id: "operator_1",
    source: "internal_operator",
    intent_key: key("lead-1001"),
    readiness_input: readyInput(),
  });
  const replayed = recordControlledSubmissionMutationIntent({
    lead_id: "lead-1001",
    actor_id: "operator_1",
    source: "internal_operator",
    intent_key: key("lead-1001"),
    readiness_input: readyInput(),
  });
  const rejected = recordControlledSubmissionMutationIntent({
    lead_id: "lead-missing",
    actor_id: "operator_1",
    source: "internal_operator",
    intent_key: key("lead-missing"),
    readiness_input: readyInput(),
  });

  assert.equal(accepted.lifecycle_visibility.current_stage, "accepted_for_intent_recording");
  assert.equal(replayed.lifecycle_visibility.current_stage, "replayed_idempotently");
  assert.equal(rejected.lifecycle_visibility.current_stage, "blocked_by_boundary");

  assert.equal(
    accepted.lifecycle_visibility.transition_note,
    CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_TRANSITION_NOTES.accepted_for_intent_recording,
  );
  assert.equal(
    replayed.lifecycle_visibility.transition_note,
    CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_TRANSITION_NOTES.replayed_idempotently,
  );
  assert.equal(
    rejected.lifecycle_visibility.transition_note,
    CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_TRANSITION_NOTES.blocked_by_boundary,
  );

  const audit = listControlledSubmissionMutationIntentAuditLog();
  const readModelVisible = buildControlledSubmissionMutationIntentLifecycleReadModel({
    lead_id: "lead-1001",
    audit_log: audit,
  });
  const readModelMissing = buildControlledSubmissionMutationIntentLifecycleReadModel({
    lead_id: "lead-no-audit",
    audit_log: audit,
  });

  assert.equal(readModelVisible.current_stage, replayed.lifecycle_visibility.current_stage);
  assert.equal(readModelVisible.operator_outcome, replayed.lifecycle_visibility.operator_outcome);
  assert.equal(readModelVisible.transition_note, replayed.lifecycle_visibility.transition_note);
  assert.equal(readModelVisible.read_only_notice, CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_READ_ONLY_NOTICE);
  assert.deepEqual(readModelVisible.semantic_boundary_clauses, CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_CLAUSES);
  assert.deepEqual(readModelVisible.boundary_notice_lines, packaging.boundary_notice_lines);

  assert.equal(readModelMissing.visibility_state, "not_available");
  assert.equal(readModelMissing.current_stage, "not_available");
  assert.equal(readModelMissing.operator_outcome, "not_available");
  assert.match(readModelMissing.transition_note, /No lifecycle audit entry is available for this lead yet/);
  assert.deepEqual(readModelMissing.semantic_boundary_clauses, CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_CLAUSES);
  assert.deepEqual(readModelMissing.boundary_notice_lines, packaging.boundary_notice_lines);

  const serialized = JSON.stringify({ accepted, replayed, rejected, readModelVisible, readModelMissing });
  assert.doesNotMatch(serialized, packaging.forbidden_success_pattern);
  assert.match(serialized, /intent recorded != submission completed/);
  assert.match(serialized, /checkpoint availability != approval completion/);
  assert.match(serialized, /replayed idempotently != workflow completed/);
  assert.match(serialized, /blocked by boundary != approval finalized/);
  assert.match(serialized, /readiness\/allowed\/eligible != executed/);
  assert.match(serialized, /allowed\/eligible read-model presence != execution authority/);
  assert.match(serialized, /read-only compatible != controller-capable/);
  assert.match(serialized, /audit trace != persisted audit system/);
  assert.match(serialized, /scope-prep != implementation prewire/);
  assert.match(serialized, /boundary revalidation != skeleton runtime rollout/);
  assert.match(serialized, /boundary revalidation != skeleton runtime activation/);
  assert.match(serialized, /skeleton-readiness adjudication prep != skeleton runtime rollout/);
  assert.match(serialized, /skeleton-readiness adjudication prep != skeleton runtime activation/);
  assert.match(serialized, /adjudication-level skeleton carrying != runtime carrying/);
  assert.match(serialized, /adjudication-level skeleton carrying != skeleton runtime rollout/);
  assert.match(serialized, /adjudication-level skeleton carrying != skeleton runtime activation/);
  assert.match(serialized, /candidate-b scope lock != runtime capability unlock/);
  assert.match(serialized, /runtime-level semantics lock != runtime rollout/);
  assert.match(serialized, /runtime-level semantics lock != runtime activation/);
  assert.match(serialized, /runtime-level semantics lock != execution unlock/);
  assert.match(serialized, /runtime-level semantics lock != controller rollout/);
  assert.match(serialized, /contract-only runtime-level lock != implementation prewire/);
  assert.match(serialized, /rollout\/activation-level skeleton lock != runtime capability rollout/);
  assert.match(serialized, /rollout\/activation-level skeleton lock != runtime capability activation/);
  assert.match(serialized, /rollout\/activation-level skeleton lock != execution unlock/);
  assert.match(serialized, /rollout\/activation-level skeleton lock != controller rollout/);
  assert.match(serialized, /contract-gated rollout\/activation-level skeleton lock != implementation prewire/);
  assert.match(serialized, /capability-level semantics lock != capability rollout active/);
  assert.match(serialized, /capability-level semantics lock != capability activation active/);
  assert.match(serialized, /capability-level semantics lock != execution unlock/);
  assert.match(serialized, /capability-level semantics lock != controller rollout/);
  assert.match(serialized, /non-active continuity != capability rollout active/);
  assert.match(serialized, /non-active continuity != capability activation active/);
  assert.match(serialized, /non-active continuity != execution unlock/);
  assert.match(serialized, /non-active continuity != controller rollout/);
  assert.match(serialized, /non-active continuity != implementation prewire/);
  assert.match(serialized, /active-ready != capability rollout active/);
  assert.match(serialized, /active-ready allowed != capability active open/);
  assert.match(serialized, /active-ready != capability activation active/);
  assert.match(serialized, /active-ready != execution unlock/);
  assert.match(serialized, /active-ready != controller rollout/);
  assert.match(serialized, /active-runtime candidate != generalized capability rollout active/);
  assert.match(serialized, /active-runtime candidate != generalized capability activation active/);
  assert.match(serialized, /active-runtime candidate != execution unlock/);
  assert.match(serialized, /active-runtime candidate != completion unlock/);
  assert.match(serialized, /active-runtime candidate != controller rollout/);
  assert.match(serialized, /active-runtime continuity != operational close/);
  assert.match(serialized, /active-runtime continuity != generalized execution\/completion behavior/);
  assert.match(serialized, /narrow contract-gated active-runtime != implementation prewire beyond scope/);
  assert.match(serialized, /runtime-readiness gap clarification != runtime unlock/);
  assert.match(serialized, /runtime-readiness gap clarification != implementation prewire/);
  assert.match(serialized, /readiness-contract != implementation prewire/);
  assert.match(serialized, /Boundary revalidation hardening never opens skeleton runtime activation\./);
  assert.match(serialized, /Skeleton-readiness adjudication prep never opens skeleton runtime rollout or activation\./);
  assert.match(serialized, /Adjudication-level skeleton carrying never opens runtime carrying, rollout, or activation\./);
  assert.match(serialized, /Candidate-B scope lock is boundary-only and never unlocks runtime capabilities\./);
  assert.match(
    serialized,
    /Runtime-level semantics lock is contract-only and never opens rollout, activation, execution, or controller rollout\./,
  );
  assert.match(
    serialized,
    /Rollout\/activation-level skeleton lock is contract-gated and never opens runtime capability rollout, activation, execution, or controller rollout\./,
  );
  assert.match(
    serialized,
    /Capability-level semantics lock is contract-gated candidate-level only and never means capability rollout active, capability activation active, execution unlock, or controller rollout\./,
  );
  assert.match(
    serialized,
    /Non-active continuity hardening is contract-gated only and never means capability rollout active, capability activation active, execution unlock, or controller rollout\./,
  );
  assert.match(
    serialized,
    /Non-active continuity hardening is boundary-only and never implementation prewire\./,
  );
  assert.match(
    serialized,
    /Active-ready semantics are eligibility-only and never runtime rollout, runtime activation, execution unlock, or controller rollout\./,
  );
  assert.match(serialized, /Readiness-contract semantics are boundary-only and never implementation prewire\./);
  assert.match(serialized, /Active-ready allowed is a readiness-contract state only; capability active remains not open\./);
  assert.match(
    serialized,
    /Active-runtime candidate is narrow contract-gated only; it never means generalized capability rollout active, generalized capability activation active, execution\/completion unlock, or controller rollout\./,
  );
  assert.match(
    serialized,
    /Active-runtime continuity is boundary-only and never means operational close, platform completion, or unrestricted execution\/completion behavior\./,
  );
  assert.match(
    serialized,
    /Active-runtime continuity remains single-object boundary hardening only; it never opens generalized execution\/completion behavior\./,
  );
  assert.match(
    serialized,
    /Narrow contract-gated active-runtime hardening is boundary-only and never implementation prewire beyond scope\./,
  );
  assert.match(serialized, /Runtime-readiness gap clarification is non-active boundary-only and never runtime unlock\./);
  assert.match(serialized, /Runtime-readiness gap clarification is boundary-only and never implementation prewire\./);
  assert.match(serialized, /Continuity revalidation hardening is boundary-only and never capability expansion\./);
  assert.match(serialized, /single-object semantic package != multi-object workflow engine/);
  assert.match(serialized, /continuity revalidation != capability expansion/);
  assert.match(serialized, /integrity hardening != capability expansion/);
  assert.match(serialized, /regression anchor != future unrestricted execution contract/);

  console.log("lifecycleCrossLayerContractMatrix tests passed");
}

run();
