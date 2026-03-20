import type { ControlledSubmissionContract } from "./controlledSubmissionContract";
import type { DecisionSurfaceCategory, InternalWorkflowDecisionSurfaceViewModel } from "./internalWorkflowDecisionSurface";
import type { ApprovalCheckpointContract } from "./approvalCheckpointContract";
import type { AuditTrailSkeleton } from "./auditTrailSkeleton";

export type BoundedWritePathContractStatus =
  | "not_eligible"
  | "review_required"
  | "boundary_blocked"
  | "dry_run_only"
  | "contract_ready_non_persistent";

export type BoundedWritePathPreconditionKey =
  | "human_confirmed_path_selected"
  | "decision_not_blocked"
  | "controlled_submission_semantics_aligned"
  | "checkpoint_semantics_aligned"
  | "audit_semantics_aligned"
  | "dry_run_mode_required";

export type BoundedWritePathContractInput = {
  decision_status: InternalWorkflowDecisionSurfaceViewModel["decision_status"];
  selected_path_category: DecisionSurfaceCategory;
  controlled_submission_status: ControlledSubmissionContract["status"];
  controlled_submission_gate_state: ControlledSubmissionContract["gate_state"];
  approval_checkpoint_overall_state: ApprovalCheckpointContract["summary"]["overall_state"];
  audit_trail_latest_state_hint: AuditTrailSkeleton["latest_state_hint"];
  has_blocking_risk: boolean;
  dry_run_requested: boolean;
};

export type BoundedWritePathPreconditionRow = {
  key: BoundedWritePathPreconditionKey;
  required: boolean;
  satisfied: boolean;
  note: string;
};

export type BoundedWritePathFailureTaxonomySummary = {
  not_eligible_reasons: string[];
  review_required_reasons: string[];
  boundary_blocked_reasons: string[];
  design_only_notice: string;
};

export type BoundedWritePathContract = {
  contract_version: "phase8-step2-bounded-write-contract-v1";
  mode: "design_only_contract_skeleton";
  status: BoundedWritePathContractStatus;
  reasons: string[];
  blockers: string[];
  missing_requirements: string[];
  precondition_matrix: BoundedWritePathPreconditionRow[];
  failure_taxonomy_summary: BoundedWritePathFailureTaxonomySummary;
  safety_boundary: {
    design_only_contract: true;
    persistence_performed: false;
    external_write_performed: false;
    mutation_committed: false;
    system_of_record_updated: false;
    rollback_not_implemented: true;
    idempotency_not_enforced: true;
    write_path_intent_is_not_write_executed: true;
    persistence_eligibility_is_not_persisted: true;
    dry_run_only_is_not_committed_mutation: true;
    contract_ready_is_not_storage_updated: true;
    rollback_boundary_defined_is_not_implemented: true;
    idempotency_boundary_defined_is_not_enforced: true;
  };
};

function evaluatePreconditions(input: BoundedWritePathContractInput): BoundedWritePathPreconditionRow[] {
  return [
    {
      key: "human_confirmed_path_selected",
      required: true,
      satisfied: input.selected_path_category === "human_confirmed_path",
      note: "write-path intent requires human_confirmed_path semantics.",
    },
    {
      key: "decision_not_blocked",
      required: true,
      satisfied: input.decision_status !== "blocked" && !input.has_blocking_risk,
      note: "blocked decision or blocking risk prevents contract alignment.",
    },
    {
      key: "controlled_submission_semantics_aligned",
      required: true,
      satisfied: input.controlled_submission_status === "submission_ready" && input.controlled_submission_gate_state === "allowed",
      note: "controlled submission semantics must be aligned for design-time readiness.",
    },
    {
      key: "checkpoint_semantics_aligned",
      required: true,
      satisfied: input.approval_checkpoint_overall_state === "checkpoint_ready_for_review",
      note: "approval checkpoint summary must remain review-ready semantics.",
    },
    {
      key: "audit_semantics_aligned",
      required: true,
      satisfied: input.audit_trail_latest_state_hint === "read_only_alignment",
      note: "audit semantic hint must remain read_only_alignment in design contract mode.",
    },
    {
      key: "dry_run_mode_required",
      required: true,
      satisfied: input.dry_run_requested,
      note: "bounded write-path contract in Phase 8 Step 2 is dry-run-only.",
    },
  ];
}

export function buildBoundedWritePathContract(input: BoundedWritePathContractInput): BoundedWritePathContract {
  const reasons: string[] = [];
  const blockers: string[] = [];
  const missingRequirements: string[] = [];

  const preconditionMatrix = evaluatePreconditions(input);
  const preconditionByKey = Object.fromEntries(preconditionMatrix.map((item) => [item.key, item])) as Record<
    BoundedWritePathPreconditionKey,
    BoundedWritePathPreconditionRow
  >;

  if (!preconditionByKey.human_confirmed_path_selected.satisfied) {
    reasons.push("Bounded write-path contract is not eligible outside human_confirmed_path.");
    missingRequirements.push("Select a human_confirmed_path to enter write-path intent evaluation.");
  }

  if (!preconditionByKey.decision_not_blocked.satisfied) {
    blockers.push("Boundary blocked: decision is blocked or blocking risk is present.");
  }

  if (!preconditionByKey.controlled_submission_semantics_aligned.satisfied) {
    reasons.push("Controlled submission semantics are not aligned for write-path design readiness.");
    missingRequirements.push("Require submission_ready + gate=allowed in semantic contract layer.");
  }

  if (!preconditionByKey.checkpoint_semantics_aligned.satisfied) {
    reasons.push("Approval checkpoint summary is not in checkpoint_ready_for_review state.");
    missingRequirements.push("Approval checkpoint contract must remain ready_for_review semantics.");
  }

  if (!preconditionByKey.audit_semantics_aligned.satisfied) {
    reasons.push("Audit trail semantic hint is not read_only_alignment.");
    missingRequirements.push("Audit trail skeleton must remain read_only_alignment for design-time contract alignment.");
  }

  if (!preconditionByKey.dry_run_mode_required.satisfied) {
    blockers.push("Boundary blocked: dry-run mode is required in Phase 8 Step 2.");
  }

  const status: BoundedWritePathContractStatus = !preconditionByKey.human_confirmed_path_selected.satisfied
    ? "not_eligible"
    : blockers.length > 0
      ? "boundary_blocked"
      : reasons.length > 0
        ? "review_required"
        : input.dry_run_requested
          ? "contract_ready_non_persistent"
          : "dry_run_only";

  const normalizedStatus: BoundedWritePathContractStatus =
    status === "contract_ready_non_persistent" && input.dry_run_requested ? "dry_run_only" : status;

  if (normalizedStatus === "dry_run_only") {
    reasons.push("All contract preconditions are aligned, but output remains dry-run-only and non-persistent.");
  }

  return {
    contract_version: "phase8-step2-bounded-write-contract-v1",
    mode: "design_only_contract_skeleton",
    status: normalizedStatus,
    reasons,
    blockers,
    missing_requirements: missingRequirements,
    precondition_matrix: preconditionMatrix,
    failure_taxonomy_summary: {
      not_eligible_reasons: ["human_confirmed_path_missing"],
      review_required_reasons: [
        "controlled_submission_semantics_not_aligned",
        "checkpoint_semantics_not_aligned",
        "audit_semantics_not_aligned",
      ],
      boundary_blocked_reasons: ["decision_or_risk_blocked", "dry_run_not_requested"],
      design_only_notice: "Failure taxonomy is design-time classification only; no runtime write or mutation handling is implemented.",
    },
    safety_boundary: {
      design_only_contract: true,
      persistence_performed: false,
      external_write_performed: false,
      mutation_committed: false,
      system_of_record_updated: false,
      rollback_not_implemented: true,
      idempotency_not_enforced: true,
      write_path_intent_is_not_write_executed: true,
      persistence_eligibility_is_not_persisted: true,
      dry_run_only_is_not_committed_mutation: true,
      contract_ready_is_not_storage_updated: true,
      rollback_boundary_defined_is_not_implemented: true,
      idempotency_boundary_defined_is_not_enforced: true,
    },
  };
}
