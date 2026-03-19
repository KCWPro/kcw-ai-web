# Phase 2 Intake Analysis Runbook (Internal)

## 1) Scope
This runbook only covers the **Phase 2 intake analysis runtime chain**:
- stable entries,
- provider selection and execution,
- fallback/audit/governance/policy/rollout behavior,
- minimal troubleshooting using tests.

## 2) Stable entry points
- `buildIntakeAnalysis(lead)`: default stable business entry.
- `buildIntakeAnalysisWithAudit(lead)`: internal troubleshooting entry with audit payload.

## 3) Normal runtime expectations
- Default behavior uses policy-driven governance; default policy is `standard`.
- Rules provider is always the safety baseline and fallback floor.
- OpenAI path requires valid runtime config (key/model) and valid normalized output.
- Policy + rollout + rollback decide `final_policy`, which then drives effective governance defaults.

## 4) How to read audit quickly
Key fields for first-pass diagnosis:
- `requested_provider`: requested provider input/env value.
- `resolved_provider`: normalized provider after config resolution.
- `final_provider`: actual provider that produced final result.
- `status`: `success` / `fallback_success` / `failed`.
- `fallback_used`, `fallback_reason`: whether fallback happened and why.
- `error_category`: normalized failure category.
- `retry_used`, `retry_count`: retry behavior summary.
- `circuit_breaker_state`, `skipped_provider_reason`: circuit behavior and skip reason.
- `requested_policy`, `resolved_policy`, `final_policy`: policy request vs effective final policy.
- `effective_governance_config`: runtime config actually applied.
- `config_adjustments`, `config_warnings`: env normalization/clamp outcomes.
- `policy_adjustments`: policy normalization, rollout guard, rollback switch notes.

## 5) Common scenarios and expected diagnosis
1. OpenAI missing key/model
   - Expect fallback to rules.
   - `fallback_reason = missing_config`.
2. OpenAI execution throws runtime error
   - Expect fallback to rules.
   - `fallback_reason = provider_execution_error`.
3. OpenAI output is invalid
   - Expect fallback to rules.
   - `fallback_reason = invalid_provider_output`.
4. Conservative policy blocked by rollout guard
   - Expect `final_policy` fallback to safe default.
   - `rollout_blocked = true`, reason indicates policy not enabled.
5. Rollback switch set
   - Expect forced safe policy as `final_policy`.
   - `rollback_switch_applied = true`.
6. Circuit breaker opens
   - Subsequent OpenAI calls are skipped during cooldown.
   - `skipped_provider_reason = circuit_open`.

## 6) Minimal debug workflow
- Optional debug signal: `INTAKE_ANALYSIS_DEBUG=true` for extra runtime warnings.
- Prefer test-driven diagnosis (not page inspection):
  - Run `npm run test:ai-intake`.
  - Use provider tests as runbook drills for missing config / runtime errors / invalid output / circuit-open skip / rollout guard / rollback switch.

## 7) Non-goals of this runbook
- No estimate/quote flow operations.
- No customer auto-communication operations.
- No marketing AI operations.
- No persistence operations for analysis/audit/governance runtime state.
