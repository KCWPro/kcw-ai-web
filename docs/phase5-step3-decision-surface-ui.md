# KCW AI Platform - Phase 5 Step 3 Decision Surface UI Landing

Date: 2026-03-20
Baseline: Phase 4 Final Freeze + Alignment Hotfix + Phase 5 Step 1/2
Stage: Phase 5 / Step 3

## 1) Step Goal

Step 3 lands the Phase 5 Step 2 Decision Surface model into the internal lead detail UI as a read-only decision section.

This step is UI presentation only and does not introduce:

- execution logic;
- submission flow;
- business write-back behavior.

## 2) What Was Added

- New UI component: `app/internal/leads/[id]/DecisionSurfaceSection.tsx`.
- Lead detail page now builds and renders `buildInternalWorkflowDecisionSurface(...)` after analysis and before deeper guidance/detail blocks.

Rendered decision-surface sections include:

- `decision_status`
- `decision_summary`
- `next_manual_review_action`
- `suggestion_only_items`
- `human_confirmed_paths`
- `automation_boundary_notices`
- `risk_flags`
- `source_alignment_notes`
- `priority`

## 3) Semantic Guardrails in UI Copy

The section keeps explicit conservative wording:

- Suggestion-only
- Human-confirmed path
- Not-yet-implemented automation
- Read-only guidance
- Does not auto-advance workflow
- Does not contact customer automatically
- Does not create tasks automatically
- Does not write business records automatically

## 4) Relationship with Step 2 and Existing Blocks

Step 3 does not replace continuity/follow-up/estimate/handoff sections.

Decision Surface is presented as the higher-level operator entry point, while existing lower-level detail blocks remain intact for drill-down review.

## 5) UI Test Coverage Added

New UI-oriented render test:

- `tests/internalDecisionSurfaceSection.test.tsx`

Covered assertions:

1. blocked scenario is rendered conservatively and keeps automation boundary visible;
2. needs-review scenario (`needs_intake_completion`) is not rendered as ready;
3. aligned ready scenario renders `ready_for_manual_progress` but keeps manual confirmation wording;
4. layer visibility for suggestion-only / human-confirmed path / not-yet-implemented automation;
5. no dangerous implied automation wording.

## 6) Out-of-Scope Confirmation

Still not implemented in Step 3:

- automatic customer contact
- automatic status progression
- automatic task creation
- automatic business writeback
- approval/submit/rollback workflow
- permissions/audit/database migration

## 7) Step 4 Focus Recommendation

Step 4 should focus on test hardening and semantic tightening (wording consistency and branch coverage completion), not execution-scope expansion.
