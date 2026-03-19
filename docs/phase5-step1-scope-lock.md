# KCW AI Platform - Phase 5 Step 1 Scope Lock / Guardrail Contract

Date: 2026-03-19
Baseline: Phase 4 Final Freeze + Alignment Hotfix
Stage: Phase 5 / Step 1

## 1) Step Goal

Lock Phase 5 into a single mainline: **Internal Workflow Decision Surface**.

This step does **not** add execution logic. It defines the Phase 5 operating contract so future implementation stays inside the Phase 1-4 baseline and does not drift into automation semantics.

## 2) Phase 5 Mainline Definition

Phase 5 exists to upgrade the current suggestion-layer capabilities into a clearer **human-confirmed internal workflow decision surface**.

It must continue to consume and respect the existing capabilities:

- external intake
- AI intake analysis
- internal operator guidance
- action handoff
- estimate draft
- follow-up workflow suggestion
- workflow continuity
- continuity ↔ follow-up alignment

The core objective is:

- make current suggestions easier to act on manually;
- clarify what an operator should review next;
- separate suggestion-only outputs from human-confirmed handling paths;
- explicitly mark what is still not implemented as automation.

## 3) Mandatory Semantic Layers (Phase 5 Contract)

Every Phase 5 enhancement must distinguish these three layers clearly.

### 3.1 `suggestion_only`
Definition:
- A read-only recommendation, explanation, summary, or warning.
- It may help the operator decide what to do next.
- It does **not** mean the system has executed anything.

Examples:
- intake analysis findings
- operator guidance notes
- handoff suggestion
- estimate draft readiness note
- follow-up recommendation
- continuity summary / risk flags / checklist

### 3.2 `human_confirmed_path`
Definition:
- A manually reviewed path that tells the operator what action can be taken next.
- It is still a guidance layer unless and until a later phase introduces a controlled submission flow.
- In Phase 5, this layer is for **clarity of manual handling**, not automatic action execution.

Examples:
- “Review missing intake info before follow-up”
- “Operator may prepare estimate draft after confirming scope details”
- “Operator should confirm handoff direction before any downstream step”

### 3.3 `not_yet_implemented_automation`
Definition:
- A future automation concept that must be named explicitly as **not implemented**.
- No UI or copy should imply that the system has already done it.

Examples:
- automatic client contact
- automatic status progression
- automatic task creation
- automatic quote write/send
- automatic downstream workflow execution

## 4) In-Scope for Phase 5

The approved Phase 5 mainline is limited to the following:

1. Formalize an **Internal Workflow Decision Surface**.
2. Build a read-only / suggestion-driven aggregation layer that helps the operator interpret cross-capability outputs together.
3. Clarify a **human-confirmed path** for estimate / handoff / follow-up / continuity relationships.
4. Improve operator-facing wording, labels, grouping, and priority clarity.
5. Add tests and documents to ensure the semantics stay conservative and auditable.

## 5) Out of Scope for Phase 5

The following remain explicitly forbidden unless separately re-scoped in a later phase:

- automatic client contact
- automatic status progression
- automatic task creation
- automatic write-back of formal business records
- automatic quote creation or sending
- Phase 2 analysis contract changes
- permissions / roles / audit systems
- database migration / large schema redesign
- external workflow engine integration
- large-scale architectural rewrite

## 6) Future Work (Not This Step / Not This Phase Mainline)

Related items that may be considered later but are **not** part of Step 1 and are **not approved for implicit implementation** now:

- controlled submission flow after human confirmation
- approval checkpoints
- audit trail / rollback strategy
- operator role model / permission boundaries
- real task orchestration / SLA management
- external automation switches and execution controls

## 7) Phase 5 Implementation Guardrails

All subsequent Phase 5 steps must satisfy all of the following:

1. Do not break or replace the Phase 1-4 baseline.
2. Do not change the system into an automation engine.
3. Do not imply execution where only suggestion exists.
4. Keep wording conservative when rendering readiness or next-step guidance.
5. Preserve the Phase 4 alignment hotfix principle:
   - avoid optimistic interpretation for mixed or incomplete follow-up readiness;
   - keep mismatch cases review-oriented, not auto-progress oriented.
6. Keep document, code, and tests synchronized.

## 8) Decision Surface Requirements for Next Steps

When Step 2+ implementation begins, the Decision Surface should make the following obvious to an operator:

- current decision status
- what is suggestion-only
- what requires human review or confirmation
- what cannot happen automatically
- what the safest next manual handling step is

## 9) Known Risks Being Addressed by Step 1

Step 1 exists to reduce these risks before code expansion:

- suggestion wording becoming too close to execution wording
- operator misunderstanding `aligned` as permission to auto-progress
- continuity / follow-up / estimate / handoff outputs appearing adjacent but not prioritized clearly
- future implementation drifting into write-path behavior without explicit re-scoping

## 10) Acceptance Criteria for Step 1

Step 1 is complete when:

- the Phase 5 mainline is documented;
- the three semantic layers are defined;
- in-scope / out-of-scope / future work are locked;
- the guardrails explicitly preserve the Phase 4 freeze boundary;
- Step 2 can proceed without ambiguity about execution semantics.

## Step 1 Declaration

This document formally locks Phase 5 into a **decision-surface and human-confirmed-path clarification** track.

Any later attempt to introduce automatic actioning, write-back, task creation, client contact, or status progression must be treated as a future-phase scope expansion and cannot be implied by Phase 5 wording alone.
