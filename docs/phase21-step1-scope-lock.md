# KCW AI Platform – Phase 21 Step 1 Scope Lock

Date: 2026-03-21  
Branch: `work`  
Stage: Phase 21 / Step 1 Scope Lock

---

## 1. Step 1 Objective

本步唯一目标：基于 `docs/phase21-pre-start-audit.md` 已完成裁定，正式锁定 Phase 21 范围与硬边界。  
本步不是审计重做，不是实现开发，不是功能扩展，不进入 runtime capability rollout / activation。

---

## 2. Confirmed Input from Pre-start Audit

已承接且不再重投票的输入结论（来自 `docs/phase21-pre-start-audit.md`）：

1. Phase 21 可以开启；
2. 仅存在唯一合理主线 Candidate B；
3. Candidate B 定义为 **Narrow Rollout/Activation-Level Skeleton Mainline, Contract-Gated, Still Non-executing**；
4. 这是首次允许的 rollout / activation-level skeleton mainline；
5. 该允许仅限 skeleton-level contract-gated lock，不等于 runtime capability rollout/activation；
6. execution/completion/persistence/orchestration/controller rollout 仍不允许。

因此，Step 1 仅负责 scope formalization + boundary lock。

---

## 3. Current Baseline and Real Capability State

基于当前仓库真实状态，能力边界仍为：

- single-object only；
- bounded / design-limited only；
- contract-only runtime-level semantics（Phase 20 继承态）；
- rollout/activation-level skeleton semantics 仅可进入 contract-gated lock（本阶段新锁定对象）；
- regression-safe only；
- non-executing；
- non-completion；
- non-persistent；
- read-only surfacing；
- read-only compatible != controller-capable；
- no external write / side effects；
- no orchestration-capable structure；
- no controller-capable UI rollout；
- no runtime capability rollout；
- no runtime capability activation。

当前系统仍是语义锁界态，不是 capability 开放态。

---

## 4. Locked Mainline for Phase 21

Phase 21 唯一允许主线（锁定）：

**Candidate B = Narrow Rollout/Activation-Level Skeleton Mainline, Contract-Gated, Still Non-executing**

必须同时满足：

- single-object only
- bounded / design-limited only
- rollout/activation-level skeleton semantics lock only
- contract-gated only
- regression-safe only
- non-executing
- non-completion
- non-persistent
- no external write / side effects
- no orchestration expansion
- no controller-capable rollout
- no runtime capability rollout
- no runtime capability activation
- no implementation prewire

说明：这是首次允许 rollout/activation-level skeleton mainline，但仅限 skeleton-level contract-gated lock；不等于 runtime rollout 已开放，不等于 runtime activation 已开放，不等于平台 fully operational。

---

## 5. Allowed Scope

Phase 21 在本锁定下仅允许以下极窄范围：

1. 对 rollout/activation-level skeleton semantics 的 contract-gated 边界进行正式定义与锁定；
2. 对“skeleton-level lock != runtime capability unlock”方程进行跨层固定表达；
3. 对 contract / regression / anti-misread 边界做最小补强；
4. 对 cross-layer wording / clause / notice / test-anchor 一致性进行收敛；
5. 对 Step 2（若进入）前置条件做禁止项前移锁定。

以上允许范围不包含任何实现开发，不包含任何 runtime capability 开放。

---

## 6. Explicitly Forbidden Scope

以下在 Step 1 及其后续默认仍禁止（除非未来新 Phase 重新审计并重锁）：

- real submission execution
- real approval/workflow completion
- real runtime activation/rollout implementation
- external write side effects
- persistence-backed audit rollout
- queue / retry / background automation runner
- orchestration / workflow engine
- multi-object mutation / multi-entity coordination
- controller-capable UI/action surface
- operator-triggered execution path
- implementation prewire
- 任何“看似 skeleton-level lock，实则 capability expansion”的包装

---

## 7. Single-object Boundary Lock

single-object 继续作为硬边界，理由：

1. 当前冻结语义与回归锚点均建立在单对象受限域；
2. Phase 21 仅允许 skeleton-level contract-gated lock，不允许 capability rollout；
3. multi-object 会立刻引入协调、补偿、跨对象一致性责任域；
4. 该责任域天然触发 orchestration 语义，违反本阶段 non-executing/non-completion/no-orchestration 边界。

结论：Phase 21 主线内 single-object boundary 不可放松。

---

## 8. Contract-Gated Rollout/Activation-Level Skeleton Boundary Lock

### 8.1 Definition

contract-gated rollout/activation-level skeleton lock = 仅在语义、条款、契约、回归锚点层定义“rollout/activation-level skeleton 边界”，不进入 runtime capability rollout/activation 实装。

### 8.2 Difference from Runtime Capability Rollout / Activation

- skeleton-level contract-gated lock：定义“可描述/可约束”的下一层级边界；
- runtime capability rollout/activation：引入真实执行、真实写入、真实控制或完成路径。

本阶段仅允许前者，明确禁止后者。

### 8.3 Allowed vs Out-of-Bounds

允许：

- rollout/activation-level skeleton semantics 的边界方程锁定；
- cross-layer wording/contract/notice/test-anchor 对齐；
- anti-misread 与 regression 锚点补强。

超界（禁止）：

- runtime execution/write/completion path；
- controller/orchestration capability path；
- persistence/automation capability path；
- implementation prewire。

结论：不得以“activation-level”名义进行 capability 预埋。

---

## 9. Why This Is First Allowed but Still Narrow

1. 这是首次允许 rollout/activation-level skeleton mainline：因为 Phase 21 Pre-start Audit 已完成并锁定唯一主线 Candidate B；
2. 现在才允许：因为 Phase 20 已完成 runtime-level contract-only 语义锁界并形成跨层防误读锚点；
3. 仍然极窄：仅 skeleton-level contract-gated lock，不开放 runtime capability rollout/activation；
4. 不能写成“activation 已开始落地”：该表述与 no capability rollout/activation 边界冲突；
5. Candidate A 不再最优：无法回答 Phase 21 核心问题；
6. Candidate C 仍越界：会直接触发 execution/completion/orchestration/controller/persistence 风险。

---

## 10. Deferred / Out-of-Scope Directions

本阶段明确 deferred / out-of-scope：

- Candidate A 作为并行主线：deferred（不再作为 Phase 21 主线）；
- Candidate C（direct capability rollout/activation progression）：out-of-scope；
- execution/completion/persistence/orchestration/controller/multi-object expansion：out-of-scope；
- runtime capability rollout/activation implementation：out-of-scope。

禁止并行多主线推进。

---

## 11. Step 2 Entry Criteria

Step 2 仅可在以下条件全部满足后进入：

1. Step 1 Scope Lock 文档完成并冻结；
2. 唯一主线仍为 Candidate B，且无 second mainline；
3. Step 2 范围仍保持 single-object / bounded / design-limited / contract-gated skeleton-level semantics lock / non-executing / non-completion；
4. Step 2 计划仅限 contract/regression/wording/notice/test-anchor 层最小硬化；
5. 明确无 runtime capability rollout/activation、无 execution/completion、无 orchestration/controller/persistence 扩展。

Step 2 可以做（仅限）：

- Candidate B 范围内 skeleton-level rollout/activation semantics 的最小条款硬化；
- `lock != capability unlock` 方程补强；
- cross-layer anti-misread consistency 收敛。

Step 2 不可以做：

- 任何 runtime capability rollout / activation 实装；
- 任何 execution/completion path；
- 任何 external write / persistence / orchestration / controller 扩张；
- 任何 implementation prewire；
- 任何 multi-object/workflow engine 扩线。

---

## 12. Final Scope Lock Statement

Phase 21 Step 1 Scope Lock 结论如下：

- Candidate B 已被正式锁定为唯一允许主线；
- 这是首次允许的 rollout/activation-level skeleton mainline，但仅限 skeleton-level contract-gated lock；
- 该允许不等于 runtime capability rollout 开放，不等于 runtime capability activation 开放；
- execution/completion/persistence/orchestration/controller/multi-object 边界继续严格生效；
- Step 1 到此结束，停止于 scope lock，不进入 Step 2 实施。

---

## Validation Log (Minimum Required)

1. `npx tsc --noEmit`
   - 结果：pass
2. `npm run test:ai-intake`
   - 结果：pass
3. `npx tsc --module commonjs --target es2020 --moduleResolution node --esModuleInterop --skipLibCheck --outDir .tmp-phase21-step1-tests lib/controlledSubmissionMutationIntent.ts lib/controlledSubmissionMutationIntentLifecycleSurfacing.ts lib/controlledSubmissionMutationIntentSemanticPackaging.ts tests/controlledSubmissionMutationIntentSemanticPackaging.test.ts tests/lifecycleCrossLayerContractMatrix.test.ts`
   - 结果：pass
4. `node .tmp-phase21-step1-tests/tests/controlledSubmissionMutationIntentSemanticPackaging.test.js`
   - 结果：pass
5. `node .tmp-phase21-step1-tests/tests/lifecycleCrossLayerContractMatrix.test.js`
   - 结果：pass
6. `node --test tests/controlledSubmissionMutationIntentSemanticPackaging.test.ts tests/lifecycleCrossLayerContractMatrix.test.ts`
   - 结果：fail
   - 原因：当前工具链下 Node ESM 直跑 TS 仍存在模块解析限制（`ERR_MODULE_NOT_FOUND`）。
   - 判定：既有工具链限制，非本步新增问题。
