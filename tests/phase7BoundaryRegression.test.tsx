import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { buildControlledSubmissionContract } from "../lib/controlledSubmissionContract";
import { buildApprovalCheckpointContract } from "../lib/approvalCheckpointContract";
import { buildAuditTrailSkeleton } from "../lib/auditTrailSkeleton";
import type { InternalWorkflowDecisionSurfaceViewModel } from "../lib/internalWorkflowDecisionSurface";
import DecisionSurfaceSection from "../app/internal/leads/[id]/DecisionSurfaceSection";

const decisionSurfaceStub: InternalWorkflowDecisionSurfaceViewModel = {
  model_version: "phase5-step2-decision-surface-v1",
  decision_status: "ready_for_manual_progress",
  decision_summary: "Stub decision surface summary for regression hardening.",
  suggestion_only_items: [],
  human_confirmed_paths: [],
  automation_boundary_notices: [],
  next_manual_review_action: "Review only.",
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
  assert.equal(trail.boundary_flags.system_of_record, false);
  assert.ok(trail.events.some((item) => item.category === "boundary_asserted"));

  const html = renderToStaticMarkup(
    <DecisionSurfaceSection
      decisionSurface={decisionSurfaceStub}
      controlledSubmissionContract={controlled}
      approvalCheckpointContract={checkpoint}
      auditTrailSkeleton={trail}
    />, 
  );

  assert.match(html, /Controlled Submission Readiness \(Read-only\)/);
  assert.match(html, /Approval Checkpoints \(Read-only Skeleton\)/);
  assert.match(html, /Audit Trail Skeleton \(Derived \/ Read-only\)/);
  assert.match(html, /Readiness does not equal execution/);
  assert.match(html, /Checkpoint is not approval completion/);
  assert.match(html, /not a persisted production audit system/);

  assert.doesNotMatch(html, /approve now|submit now|execute now|dispatch now/i);
  assert.doesNotMatch(html, /persisted log|logged externally|official audit record|workflow engine/i);

  console.log("phase7BoundaryRegression tests passed");
}

run();
