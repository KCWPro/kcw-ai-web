# KCW AI Platform – Phase 22 Step 2 Minimal Contract-Gated Capability-Level Hardening

Date: 2026-03-22  
Branch: `work`  
Stage: Phase 22 / Step 2

---

## 1. Step 2 Objective

本步目标：仅沿 Candidate B（Narrow Capability Rollout/Activation Mainline, Contract-Gated, Non-executing）对 capability-level semantics 的合同边界做最小 hardening。  
本步不是功能开发，不是 capability rollout/activation active 开启，不是 execution/completion/persistence/orchestration/controller 扩张。

---

## 2. Confirmed Scope Input

本步严格承接：

- `docs/phase21-final-freeze.md`
- `docs/phase22-pre-start-audit.md`
- `docs/phase22-step1-scope-lock.md`

并承接以下锁定结论：

1. 唯一主线仅 Candidate B；
2. 首次允许 capability rollout/activation-level mainline，但仅 candidate-level contract-gated lock；
3. capability rollout active / capability activation active 仍禁止；
4. execution / completion / persistence / orchestration / controller 仍禁止；
5. Step 2 只能做最小 anti-misread / anti-drift hardening。

---

## 3. What Was Hardened

本步最小 hardening 内容（不改变 runtime 本质语义）：

1. 在 `lib/controlledSubmissionMutationIntent.ts` 新增 capability-level 边界条款：
   - `capability-level semantics lock != capability rollout active`
   - `capability-level semantics lock != capability activation active`
   并将其纳入 lifecycle boundary clauses 与 boundary notice lines。
2. 在 `lib/controlledSubmissionMutationIntentSemanticPackaging.ts`：
   - 将上述 capability-level 边界方程纳入 Phase 21 lock summary（强化 anti-misread continuity）；
   - 新增 `CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE22_CAPABILITY_LEVEL_LOCK_HARDENING_SUMMARY`，将 Step 2 的 contract-gated capability-level lock 明确成可回归锚定的 summary 对象。
3. 在 `app/internal/leads/[id]/DecisionSurfaceSection.tsx` 补入 capability-level boundary-only notice，保持 UI read-only guardrail 与 contract clauses 同源。
4. 在 `tests/controlledSubmissionMutationIntentSemanticPackaging.test.ts` 与 `tests/lifecycleCrossLayerContractMatrix.test.ts` 增补 capability-level 非 active 断言，收紧跨层 anti-drift anchors。

---

## 4. What Was Explicitly Not Expanded

本步明确未扩张：

- 未新增 execution path；
- 未新增 submission/approval/workflow completion；
- 未新增 external write / side effects；
- 未新增 persistence-backed audit system；
- 未新增 queue/retry/runner/automation/timer/async job；
- 未新增 multi-object / batch / chain / series / graph / orchestration；
- 未新增 controller-capable UI；
- 未新增 operator-triggered execution entry；
- 未新增 capability rollout active；
- 未新增 capability activation active；
- 未做 implementation prewire。

---

## 5. Boundary Preservation

本步后逐条确认仍成立：

- single-object only；
- bounded / design-limited / contract-gated capability-level；
- non-executing；
- non-completion；
- non-persistent；
- read-only surfacing；
- read-only compatible != controller-capable；
- no external write；
- no persistence expansion；
- no orchestration；
- no controller-capable UI；
- no capability rollout active；
- no capability activation active。

结论：本步是边界表达收紧，不是能力空间扩张。

---

## 6. Test Anchor Changes

本步测试锚点调整（最小且直接相关）：

1. `tests/controlledSubmissionMutationIntentSemanticPackaging.test.ts`
   - 新增 capability-level lock != capability rollout active / activation active 的 boundary clause & notice 断言；
   - 新增 Phase 22 hardening summary 的 scope / equations / forbidden_actions / notice 断言。
2. `tests/lifecycleCrossLayerContractMatrix.test.ts`
   - 新增序列化断言，锁定 capability-level lock 非 active 的跨层表达。

这些测试仅用于防语义回退，不引入未来能力契约。

---

## 7. Residual Drift / Misread Risks

本步后仍需持续关注的误读风险：

1. 将 “capability-level semantics lock” 误读为 capability rollout active；
2. 将 “capability-level semantics lock” 误读为 capability activation active；
3. 将 read-only surfacing 误读为 controller-capable action surface；
4. 将 boundary hardening 误读为 implementation prewire。

当前缓解方式：

- 通过 clause + notice + packaging summary + UI wording + regression tests 五层同源锚定持续收紧。

---

## 8. Step 3 Entry Recommendation

建议：**可进入 Step 3（yes, conditional）**。

条件：

1. 仍保持 Candidate B 唯一主线；
2. Step 3 只能做 freeze-prep consistency consolidation；
3. 不得新增 execution/completion/persistence/orchestration/controller/capability active；
4. 不得新增 implementation prewire 与未来能力结构预埋；
5. Step 3 目标仅限收口，不得扩线。

---

## 9. Final Statement

Phase 22 Step 2 已完成最小 contract-gated capability-level hardening。  
本步只收紧“capability-level semantics allowed, non-active”的边界表达与回归锚点，不引入任何 runtime capability unlock。  
完成后停止在 Step 2，不进入 Step 3 执行。

