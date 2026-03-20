import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { buildControlledSubmissionContract } from "../lib/controlledSubmissionContract";
import { buildApprovalCheckpointContract } from "../lib/approvalCheckpointContract";
import { buildAuditTrailSkeleton } from "../lib/auditTrailSkeleton";
import { buildBoundedWritePathContract } from "../lib/boundedWritePathContract";
import type { InternalWorkflowDecisionSurfaceViewModel } from "../lib/internalWorkflowDecisionSurface";
import DecisionSurfaceSection from "../app/internal/leads/[id]/DecisionSurfaceSection";

const decisionSurfaceStub: InternalWorkflowDecisionSurfaceViewModel = {
  model_version: "phase5-step2-decision-surface-v1",
  decision_status: "ready_for_manual_progress",
  decision_summary: "Phase 8 boundary hardening regression stub.",
  suggestion_only_items: [],
  human_confirmed_paths: [],
  automation_boundary_notices: [],
  next_manual_review_action: "Review-only.",
  priority: "low",
  review_notes: ["Read-only guidance"],
  risk_flags: [],
  source_alignment_notes: ["stub"],
};

function run() {
  const controlled = buildControlledSubmissionContract({
    decision_status: "ready_for_manual_progress",
    selected_path_category: "human_confirmed_path",
    selected_path_id: "path_follow_up_review",
    manual_confirmation_received: true,
    intake_quality_gate_passed: true,
    follow_up_alignment_status: "aligned",
    path_availability: "available",
    has_blocking_risk: false,
  });

  assert.equal(controlled.status, "submission_ready");
  assert.equal(controlled.gate_state, "allowed");
  assert.equal(controlled.automation_boundary.submitted, false);
  assert.equal(controlled.automation_boundary.readiness_is_not_submission, true);

  const checkpoint = buildApprovalCheckpointContract({
    decision_status: decisionSurfaceStub.decision_status,
    selected_path_category: "human_confirmed_path",
    manual_confirmation_received: true,
    controlled_submission_status: controlled.status,
    controlled_submission_gate_state: controlled.gate_state,
    has_blocking_risk: false,
  });

  assert.equal(checkpoint.compatibility_assertions.readiness_is_not_execution, true);
  assert.equal(checkpoint.compatibility_assertions.checkpoint_is_not_approval_completion, true);
  assert.equal(checkpoint.execution_boundary.approval_actions_available, false);

  const trail = buildAuditTrailSkeleton({
    selected_path_category: "human_confirmed_path",
    decision_status: decisionSurfaceStub.decision_status,
    controlled_submission_status: controlled.status,
    controlled_submission_gate_state: controlled.gate_state,
    manual_confirmation_received: true,
    approval_checkpoint_contract: checkpoint,
  });

  assert.equal(trail.boundary_flags.non_persistent, true);
  assert.equal(trail.boundary_flags.persistence_performed, false);
  assert.equal(trail.boundary_flags.system_of_record, false);

  const boundedWrite = buildBoundedWritePathContract({
    decision_status: decisionSurfaceStub.decision_status,
    selected_path_category: "human_confirmed_path",
    controlled_submission_status: controlled.status,
    controlled_submission_gate_state: controlled.gate_state,
    approval_checkpoint_overall_state: checkpoint.summary.overall_state,
    audit_trail_latest_state_hint: trail.latest_state_hint,
    has_blocking_risk: false,
    dry_run_requested: true,
  });

  assert.equal(boundedWrite.status, "dry_run_only");
  assert.equal(boundedWrite.safety_boundary.design_only_contract, true);
  assert.equal(boundedWrite.safety_boundary.persistence_performed, false);
  assert.equal(boundedWrite.safety_boundary.external_write_performed, false);
  assert.equal(boundedWrite.safety_boundary.mutation_committed, false);
  assert.equal(boundedWrite.safety_boundary.system_of_record_updated, false);
  assert.equal(boundedWrite.safety_boundary.write_path_intent_is_not_write_executed, true);
  assert.equal(boundedWrite.safety_boundary.persistence_eligibility_is_not_persisted, true);
  assert.equal(boundedWrite.safety_boundary.dry_run_only_is_not_committed_mutation, true);
  assert.equal(boundedWrite.safety_boundary.contract_ready_is_not_storage_updated, true);
  assert.equal(boundedWrite.safety_boundary.rollback_boundary_defined_is_not_implemented, true);
  assert.equal(boundedWrite.safety_boundary.idempotency_boundary_defined_is_not_enforced, true);

  const html = renderToStaticMarkup(
    <DecisionSurfaceSection
      decisionSurface={decisionSurfaceStub}
      controlledSubmissionContract={controlled}
      approvalCheckpointContract={checkpoint}
      auditTrailSkeleton={trail}
      boundedWritePathContract={boundedWrite}
    />,
  );

  assert.match(html, /Controlled Submission Readiness \(Read-only\)/);
  assert.match(html, /Approval Checkpoints \(Read-only Skeleton\)/);
  assert.match(html, /Audit Trail Skeleton \(Derived \/ Read-only\)/);
  assert.match(html, /Bounded Write-Path Contract \(Design-only \/ Read-only\)/);

  assert.match(html, /Readiness does not equal execution/);
  assert.match(html, /Checkpoint is not approval completion/);
  assert.match(html, /not a persisted production audit system/);
  assert.match(html, /Dry-run semantic interpretation only/);
  assert.match(html, /No persistence is performed/);
  assert.match(html, /No external write is performed/);
  assert.match(html, /No mutation is committed/);
  assert.match(html, /Not a system-of-record update/);

  assert.doesNotMatch(html, /<button[^>]*>.*execute/i);
  assert.doesNotMatch(html, /<button[^>]*>.*submit/i);
  assert.doesNotMatch(html, /<button[^>]*>.*write/i);
  assert.doesNotMatch(html, /write now|commit now|persist now|submit now|execute now/i);
  assert.doesNotMatch(html, /persisted successfully|mutation committed successfully|record updated successfully/i);

  console.log("phase8BoundaryRegression tests passed");
}

run();
