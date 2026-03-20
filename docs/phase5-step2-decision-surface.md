# KCW AI Platform - Phase 5 Step 2 Decision Surface ViewModel

Date: 2026-03-19
Baseline: Phase 4 Final Freeze + Alignment Hotfix + Phase 5 Step 1 Scope Lock
Stage: Phase 5 / Step 2

## 1) Step Goal

Step 2 introduces a unified, read-only **Internal Workflow Decision Surface ViewModel** for internal operator decision aggregation.

This step is model-layer only:

- it does not add execution behavior;
- it does not add submission flow;
- it does not add write-back to business systems.

## 2) What Was Added

New model builder:

- `lib/internalWorkflowDecisionSurface.ts`

Primary exported concepts:

- `DecisionSurfaceItem`
- `InternalWorkflowDecisionSurfaceViewModel`
- `buildInternalWorkflowDecisionSurface(...)`

Core model fields include:

- `model_version`
- `decision_status`
- `decision_summary`
- `suggestion_only_items`
- `human_confirmed_paths`
- `automation_boundary_notices`
- `next_manual_review_action`
- `priority`
- `review_notes`
- `risk_flags`
- `source_alignment_notes`

## 3) Required Semantic Layers (Step 2 Enforcement)

Step 2 explicitly enforces the three-layer contract from Phase 5 Step 1:

1. `suggestion_only`
   - read-only recommendation and context aggregation;
   - never treated as executed action.

2. `human_confirmed_path`
   - manual path candidates for operator confirmation;
   - still model representation only (no submission/action execution in Step 2).

3. `not_yet_implemented_automation`
   - explicit boundary notices for automation not implemented;
   - prevents optimistic interpretation in UI or downstream consumption.

## 4) Relationship with Phase 4 Workflow Continuity

Step 2 does **not** replace Phase 4 continuity logic.

It consumes continuity outputs and preserves the conservative semantics:

- `continuity_state=blocked` -> decision surface remains blocked;
- `continuity_state=needs_intake_completion` -> decision surface remains review-oriented;
- continuity/follow-up mismatch (`needs_review`) remains non-ready;
- only aligned + ready scenarios become `ready_for_manual_progress`.

## 5) Explicit Non-Automation Boundary

Step 2 keeps the system in suggestion/read-only mode.

Not implemented in this step:

- automatic client contact
- automatic lead status progression
- automatic task creation
- automatic quote write/send
- any API write behavior expansion

## 6) Test Coverage Added in Step 2

New test file:

- `tests/internalWorkflowDecisionSurface.test.ts`

Covered scenarios:

1. analysis missing -> blocked status, no optimistic human path readiness.
2. continuity `needs_intake_completion` + follow-up available -> still `needs_review`.
3. continuity `ready_for_follow_up` + follow-up available/aligned -> `ready_for_manual_progress`.
4. continuity/follow-up forced mismatch -> `needs_review`.
5. explicit layer separation assertions:
   - suggestion-only items
   - human-confirmed paths
   - automation boundary notices

## 7) Step Boundary to Step 3

Step 2 delivers the model contract only.

Step 3 (future) may render this model in UI, but Step 2 does not introduce execution controls, action submission endpoints, or write-path behavior.
