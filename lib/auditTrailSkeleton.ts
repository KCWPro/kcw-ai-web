import type { ApprovalCheckpointContract } from "./approvalCheckpointContract";
import type { ControlledSubmissionContract } from "./controlledSubmissionContract";
import type { DecisionSurfaceCategory, InternalWorkflowDecisionSurfaceViewModel } from "./internalWorkflowDecisionSurface";

export type AuditTrailEventCategory =
  | "path_selected"
  | "readiness_evaluated"
  | "gate_evaluated"
  | "manual_confirmation_state_observed"
  | "checkpoint_contract_built"
  | "boundary_asserted";

export type AuditTrailEventState = "observed" | "review_oriented" | "boundary_only";

export type AuditTrailSkeletonEvent = {
  event_key: string;
  category: AuditTrailEventCategory;
  title: string;
  description: string;
  derived_from: string[];
  derived_marker: `derived_seq_${number}`;
  state: AuditTrailEventState;
  visible: boolean;
  boundary_note: string;
};

export type AuditTrailSkeletonInput = {
  selected_path_category: DecisionSurfaceCategory;
  decision_status: InternalWorkflowDecisionSurfaceViewModel["decision_status"];
  controlled_submission_status: ControlledSubmissionContract["status"];
  controlled_submission_gate_state: ControlledSubmissionContract["gate_state"];
  manual_confirmation_received: boolean;
  approval_checkpoint_contract: ApprovalCheckpointContract;
};

export type AuditTrailSkeleton = {
  trail_version: "phase7-step3-audit-trail-skeleton-v1";
  trail_id: string;
  trail_label: string;
  events: AuditTrailSkeletonEvent[];
  event_count: number;
  latest_state_hint: "review_focus" | "read_only_alignment" | "eligibility_outside_scope";
  summary: {
    note: string;
    checkpoint_summary: string;
    readiness_gate_summary: string;
  };
  boundary_flags: {
    derived_only: true;
    read_only: true;
    non_executing: true;
    non_persistent: true;
    persistence_performed: false;
    external_write_performed: false;
    system_of_record: false;
    compliance_audit_platform: false;
    submitted: false;
    executed: false;
  };
};

function buildEvent(
  seq: number,
  payload: Omit<AuditTrailSkeletonEvent, "derived_marker">,
): AuditTrailSkeletonEvent {
  return {
    ...payload,
    derived_marker: `derived_seq_${seq}`,
  };
}

export function buildAuditTrailSkeleton(input: AuditTrailSkeletonInput): AuditTrailSkeleton {
  const events: AuditTrailSkeletonEvent[] = [];

  events.push(
    buildEvent(1, {
      event_key: "event_path_selected",
      category: "path_selected",
      title: "Path category observed",
      description: `Selected path category observed as ${input.selected_path_category}.`,
      derived_from: ["selected_path_category"],
      state: input.selected_path_category === "human_confirmed_path" ? "observed" : "boundary_only",
      visible: true,
      boundary_note: "Derived semantic event only; not a persisted selection record.",
    }),
  );

  const reviewState: AuditTrailEventState =
    input.decision_status === "blocked" || input.controlled_submission_gate_state === "blocked"
      ? "review_oriented"
      : "observed";

  events.push(
    buildEvent(2, {
      event_key: "event_readiness_evaluated",
      category: "readiness_evaluated",
      title: "Readiness semantic evaluated",
      description: `Decision status=${input.decision_status}; controlled submission status=${input.controlled_submission_status}.`,
      derived_from: ["decision_status", "controlled_submission_status"],
      state: reviewState,
      visible: true,
      boundary_note: "Readiness semantics do not imply submission execution.",
    }),
  );

  events.push(
    buildEvent(3, {
      event_key: "event_gate_evaluated",
      category: "gate_evaluated",
      title: "Manual confirmation gate semantic evaluated",
      description: `Gate state observed as ${input.controlled_submission_gate_state}.`,
      derived_from: ["controlled_submission_gate_state"],
      state: input.controlled_submission_gate_state === "blocked" ? "review_oriented" : "observed",
      visible: true,
      boundary_note: "Gate state is semantic interpretation only; allowed is not executed.",
    }),
  );

  events.push(
    buildEvent(4, {
      event_key: "event_manual_confirmation_state_observed",
      category: "manual_confirmation_state_observed",
      title: "Manual confirmation signal observed",
      description: input.manual_confirmation_received
        ? "Manual confirmation signal is present."
        : "Manual confirmation signal is missing.",
      derived_from: ["manual_confirmation_received"],
      state: input.manual_confirmation_received ? "observed" : "review_oriented",
      visible: true,
      boundary_note: "Manual confirmation signal is not submission and not approval completion.",
    }),
  );

  events.push(
    buildEvent(5, {
      event_key: "event_checkpoint_contract_built",
      category: "checkpoint_contract_built",
      title: "Approval checkpoint contract consumed",
      description: `Checkpoint mode=${input.approval_checkpoint_contract.mode}; overall=${input.approval_checkpoint_contract.summary.overall_state}.`,
      derived_from: ["approval_checkpoint_contract.summary", "approval_checkpoint_contract.mode"],
      state: input.approval_checkpoint_contract.summary.overall_state === "checkpoint_review_required" ? "review_oriented" : "observed",
      visible: true,
      boundary_note: "Checkpoint contract is read-only skeleton, not approval workflow execution.",
    }),
  );

  events.push(
    buildEvent(6, {
      event_key: "event_boundary_asserted",
      category: "boundary_asserted",
      title: "Boundary assertions applied",
      description: "Derived trail remains non-persistent, non-executing, and not a system-of-record.",
      derived_from: ["phase6_freeze_boundary", "phase7_step1_scope_lock", "phase7_step2_checkpoint_contract"],
      state: "boundary_only",
      visible: true,
      boundary_note: "This event is a guardrail reminder; no external audit record is created.",
    }),
  );

  const latestStateHint: AuditTrailSkeleton["latest_state_hint"] =
    input.selected_path_category !== "human_confirmed_path"
      ? "eligibility_outside_scope"
      : events.some((item) => item.state === "review_oriented")
        ? "review_focus"
        : "read_only_alignment";

  return {
    trail_version: "phase7-step3-audit-trail-skeleton-v1",
    trail_id: `trail_${input.decision_status}_${input.controlled_submission_gate_state}`,
    trail_label: "Derived audit trail skeleton (read-only)",
    events,
    event_count: events.length,
    latest_state_hint: latestStateHint,
    summary: {
      note: "Derived semantic trail only. No persistence, no external write, no execution.",
      checkpoint_summary: input.approval_checkpoint_contract.summary.note,
      readiness_gate_summary: `decision=${input.decision_status}, readiness=${input.controlled_submission_status}, gate=${input.controlled_submission_gate_state}`,
    },
    boundary_flags: {
      derived_only: true,
      read_only: true,
      non_executing: true,
      non_persistent: true,
      persistence_performed: false,
      external_write_performed: false,
      system_of_record: false,
      compliance_audit_platform: false,
      submitted: false,
      executed: false,
    },
  };
}
