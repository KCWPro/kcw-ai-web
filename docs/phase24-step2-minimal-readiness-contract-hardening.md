# KCW AI Platform – Phase 24 Step 2 Minimal Readiness-Contract Hardening

Date: 2026-03-22  
Branch: `work`  
Stage: Phase 24 / Step 2 Minimal Readiness-Contract Hardening

---

## 1. Step 2 Objective

本步目标是：在 Candidate B（Capability-Active Readiness Contract Mainline, Eligibility-only, Non-executing）范围内，做最小 hardening。  
本步不是开始开发，不是 capability active runtime 开始实现，不是 execution/completion/persistence/orchestration/controller 能力开放。

本步只允许：

- 收紧误读空间（anti-misread）；
- 收紧防漂移空间（anti-drift）；
- 强化 readiness-contract / eligibility-only 的 contract 与 regression anchors；
- 保持 runtime 本质语义不变。

---

## 2. Confirmed Scope Input

承接输入：

1. `docs/phase24-pre-start-audit.md`（Phase 24 可开启，且唯一主线为 Candidate B）；
2. `docs/phase24-step1-scope-lock.md`（Step 1 已锁死 Candidate B + readiness-contract/eligibility-only 边界）；
3. 当前代码与测试仍处于 single-object / bounded / design-limited / non-executing / non-completion / non-persistent / read-only compatible 基线。

因此本步仅执行 Candidate B 范围内最小 hardening，不新增能力空间。

---

## 3. What Was Hardened

本步实际 hardening（最小且可验证）：

1. 在 `lib/controlledSubmissionMutationIntent.ts` 增补并挂接 Phase 24 readiness-contract 边界方程：
   - `active-ready != capability rollout active`
   - `active-ready != capability activation active`
   - `active-ready != execution unlock`
   - `active-ready != controller rollout`
   - `readiness-contract != implementation prewire`
2. 在同文件补充对应 notice lines：
   - active-ready 仅 eligibility-only，不开放 runtime rollout/activation、execution unlock、controller rollout；
   - readiness-contract 仅 boundary-only，不是 implementation prewire。
3. 在 `lib/controlledSubmissionMutationIntentSemanticPackaging.ts` 新增 Phase 24 Step 2 summary：
   - `CONTROLLED_SUBMISSION_MUTATION_INTENT_PHASE24_MINIMAL_READINESS_CONTRACT_HARDENING_SUMMARY`
   - 并提供 getter：`getControlledSubmissionMutationIntentPhase24MinimalReadinessContractHardeningSummary()`
4. 在 `app/internal/leads/[id]/DecisionSurfaceSection.tsx` 的 read-only readiness 区块补齐上述两条 notice，确保 UI surfacing 与 contract 层同向。
5. 在测试层最小补强：
   - `tests/controlledSubmissionMutationIntentSemanticPackaging.test.ts`：新增 clause/notice 覆盖与 Phase 24 summary 断言；
   - `tests/lifecycleCrossLayerContractMatrix.test.ts`：新增 serialized anti-misread 断言；
   - `tests/phase8BoundaryRegression.test.tsx`：新增 UI 文本锚点断言。

---

## 4. What Was Explicitly Not Expanded

本步明确未扩张：

- 未新增 real submission execution；
- 未新增 real approval completion；
- 未新增 real workflow completion；
- 未新增 external write / API write / side effects；
- 未新增 persistence-backed audit system；
- 未新增 queue / retry / runner / automation / timer / async job；
- 未新增 multi-object / batch / chain / series / graph / orchestration；
- 未新增 controller-capable UI 或 operator-triggered execution entry；
- 未新增 capability rollout active；
- 未新增 capability activation active；
- 未新增 implementation prewire。

---

## 5. Boundary Preservation

本步后再次确认以下冻结边界仍成立：

- single-object only：成立
- bounded / design-limited / readiness-contract：成立
- non-executing：成立
- non-completion：成立
- read-only surfacing：成立
- read-only compatible != controller-capable：成立
- no external write：成立
- no persistence expansion：成立
- no orchestration：成立
- no controller-capable UI：成立
- no capability rollout active：成立
- no capability activation active：成立

---

## 6. Test Anchor Changes

本步测试锚点改动（最小）：

1. `tests/controlledSubmissionMutationIntentSemanticPackaging.test.ts`
   - 新增 active-ready 与 readiness-contract 边界方程断言；
   - 新增 active-ready/readiness-contract notice 断言；
   - 新增 Phase 24 summary scope/boundary/forbidden_actions 断言。
2. `tests/lifecycleCrossLayerContractMatrix.test.ts`
   - 新增 serialized 断言，锁定 active-ready != runtime active/unlock/controller 与 readiness-contract != prewire。
3. `tests/phase8BoundaryRegression.test.tsx`
   - 新增 UI read-only 文本断言，防止 surfacing 语义漂移。

这些改动仅服务边界防漂移，不承载未来能力预写。

---

## 7. Residual Drift / Misread Risks

本步后仍需持续关注的误读风险：

1. 将 active-ready 误读为 capability rollout active；
2. 将 active-ready 误读为 capability activation active；
3. 将 readiness-contract 误读为 implementation prewire；
4. 将 allowed/eligible/readiness 误读为 execution authority；
5. 将 read-only surfacing 误读为 controller-capable action surface。

当前缓解策略：通过 clause + notice + semantic packaging + UI text + regression tests 跨层锚定。

---

## 8. Step 3 Entry Recommendation

是否建议进入 Step 3：**yes（仅在 Candidate B 单主线下）**。

若进入 Step 3，仅允许：

- freeze-prep consistency consolidation；
- 对 Step 2 新增条款/notice/测试锚点做跨层一致性收口；
- 继续保持 single-object / readiness-contract / eligibility-only / non-executing / non-completion。

Step 3 仍禁止：

- capability rollout active / capability activation active runtime；
- execution/completion/persistence/orchestration/controller 扩张；
- external write / automation / multi-object / implementation prewire。

---

## 9. Final Statement

Phase 24 Step 2 至此完成：

- 已沿 Candidate B 完成最小 readiness-contract hardening；
- 已补强 active-ready ≠ active-runtime/unlock/controller 的跨层表达；
- 已补齐 regression anchors，防止语义漂移；
- 未触发 execution/completion/persistence/orchestration/controller/capability active runtime 扩张。

本步完成后停止，不进入 Step 3 实施。
