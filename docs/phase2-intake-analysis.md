# Phase 2 Intake Analysis (Internal Stabilized Contract)

## 1) Implemented scope in Phase 2
- Runtime intake analysis generated per lead request (not persisted).
- Rule-based engine as deterministic safety baseline.
- OpenAI provider integration with normalization and guarded fallback.
- Provider governance: retry, circuit breaker, policy defaults, env overrides.
- Policy registry and rollout/rollback protection (enabled policies + force policy switch).
- Audit metadata for observability of provider/policy/governance decisions.

## 2) Stable entry points
- **Default stable entry (business layer)**: `buildIntakeAnalysis(lead)` from `lib/aiIntakeAnalysis.ts`.
- **Advanced internal entry**: `buildIntakeAnalysisWithAudit(lead)` from `lib/aiIntakeAnalysis.ts`.

Business features should prefer the default entry unless audit metadata is explicitly needed.

## 3) Result contract (stable)
`IntakeAnalysisResult` top-level structure remains:
- `issue_classification`
- `info_completeness`
- `missing_fields`
- `recommended_action`
- `suggested_price_range`
- `next_step`
- `confidence`
- `analysis_version`

This is the Phase 2 stable output contract.

## 4) Provider architecture overview
- `lib/aiIntakeAnalysisRules.ts`: rules provider baseline and normalization.
- `lib/aiIntakeAnalysisOpenAI.ts`: OpenAI provider adapter + payload normalization.
- `lib/aiIntakeAnalysisProvider.ts`: provider selector/resolver and runtime execution with fallback.

Fallback principle: when configured provider is invalid/unavailable/fails, rules path remains final safety floor.

## 5) Governance / policy / rollout layers
- `lib/aiIntakeAnalysisGovernanceConfig.ts`: unified governance parsing and normalization.
- `lib/aiIntakeAnalysisProvider.ts`: runtime retry/circuit behavior and audit capture.
- Policy (`standard` / `conservative`) defines defaults and versioning.
- Rollout guard (`INTAKE_ANALYSIS_ENABLED_POLICIES`) limits allowed policies.
- Rollback switch (`INTAKE_ANALYSIS_FORCE_POLICY`) can force final policy.

## 6) Default behavior and fallback rules
- Default policy: `standard`.
- Default enabled policies: `standard` only.
- Invalid governance inputs normalize back to safe defaults with warnings/adjustments in audit.
- Rules analysis is always available as safe fallback.

## 7) Current test entry
- `npm run test:ai-intake`
- Covered suites:
  - `tests/aiIntakeAnalysis.test.ts`
  - `tests/aiIntakeAnalysisProvider.test.ts`

## 8) Minimal usage examples
```ts
import { buildIntakeAnalysis, buildIntakeAnalysisWithAudit } from "@/lib/aiIntakeAnalysis";

const result = await buildIntakeAnalysis(lead);
const withAudit = await buildIntakeAnalysisWithAudit(lead);
```

Environment controls (internal ops):
- `INTAKE_ANALYSIS_PROVIDER`
- `INTAKE_ANALYSIS_POLICY`
- `INTAKE_ANALYSIS_ENABLED_POLICIES`
- `INTAKE_ANALYSIS_FORCE_POLICY`

## 9) Explicitly out of Phase 2 scope
- Persisting analysis/audit/governance/policy data into DB or Sheet.
- Exposing internal governance/audit details in page UI.
- Estimate/quote workflows.
- Customer auto-communication.
- Marketing AI.
- Batch analysis pipelines.
