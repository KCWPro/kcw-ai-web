# KCW AI Platform – Phase 20 Step 1 Scope Lock

Date: 2026-03-20  
Branch: `work`  
Stage: Phase 20 / Step 1 Scope Lock

---

## 1. Step 1 Objective

本步唯一目标：基于 `docs/phase20-pre-start-audit.md` 已完成裁定，正式锁定 Phase 20 范围与硬边界。  
本步不是审计重做，不是实现开发，不是能力扩张，不进入 runtime rollout / activation。

---

## 2. Confirmed Input from Pre-start Audit

已承接且不再重投票的输入结论（来自 `docs/phase20-pre-start-audit.md`）：

1. Phase 20 可以开启；
2. 仅存在唯一合理主线 Candidate B；
3. Candidate B 定义为 **Narrow Runtime-Level Skeleton Mainline / Contract-Only Runtime Semantics Lock**；
4. 这是首次允许的 runtime-level skeleton mainline；
5. 该允许仅限 contract-only runtime semantics lock，不等于 rollout/activation；
6. execution/completion/persistence/orchestration/controller rollout 仍不允许。

因此，Step 1 只负责 scope formalization + boundary lock。

---

## 3. Current Baseline and Real Capability State

基于当前仓库真实状态，能力边界仍为：

- single-object only；
- bounded / design-limited only；
- runtime-level semantics lock only（contract-level）；
- non-executing；
- non-completion；
- non-persistent；
- read-only surfacing；
- read-only compatible != controller-capable；
- no external side effects / external write；
- no multi-object / multi-stage orchestration；
- no controller-capable rollout；
- no runtime rollout；
- no runtime activation。

当前 UI/read model 仍是 surfacing，不是 controller。  
当前没有真实 approval completion。  
当前没有真实 submission completion。  
当前没有生产级 persistence 扩张。  
当前仅首次允许 runtime-level skeleton semantics lock，而非 runtime 结构落地。

---

## 4. Locked Mainline for Phase 20

Phase 20 唯一允许主线（锁定）：

**Candidate B = Narrow Runtime-Level Skeleton Mainline / Contract-Only Runtime Semantics Lock**

必须同时满足：

- single-object only
- bounded / design-limited only
- runtime-level semantics lock only
- contract-level only
- regression-safe only
- non-executing
- non-completion
- non-persistent
- no external side effects
- no workflow expansion
- no multi-entity / multi-stage orchestration
- no controller-capable rollout
- no runtime rollout
- no runtime activation

说明：这是首次允许 runtime-level skeleton mainline，但仅限 contract-only runtime semantics lock；不等于 rollout 已开放，不等于 activation 已开放，不等于平台 fully operational。

---

## 5. Allowed Scope

Phase 20 在本锁定下仅允许以下极窄范围：

1. 对 runtime-level skeleton semantics 的 contract-level 表达与边界进行正式锁定；
2. 对 contract / regression / anti-misread 边界进行进一步约束；
3. 对“可进入 runtime-level semantics，但不可 rollout/activation”的边界做最小清晰化；
4. 对 cross-layer wording / contract / notice 一致性进行锁定；
5. 对 runtime-level allowed scope 做文档级和契约级收敛；
6. 对 rollout / activation / controller / orchestration / execution 的禁止边界做更强表达。

上述允许范围不包含任何实现开发，不包含任何 runtime capability 开放。

---

## 6. Explicitly Forbidden Scope

以下在 Step 1 及其后续阶段默认仍禁止，除非未来新 Phase 明确重新立项：

- real submission execution
- real approval completion
- real workflow completion
- real external side effects
- real persistence-backed audit system
- queue / retry / background runner
- async automation
- multi-object mutation
- multi-entity coordination
- multi-stage orchestration
- generalized workflow engine
- controller-capable rollout
- operator-triggered execution path
- runtime rollout
- runtime activation
- platform runtime skeleton completion
- 任何“looks like runtime-level semantics lock but actually adds runtime capability”的包装

---

## 7. Single-object Boundary Lock

single-object 继续作为硬边界，理由如下：

1. 当前冻结结论与合同锚点建立在单对象受限语义上；
2. 即使首次允许 runtime-level skeleton mainline，本阶段允许内容仍是 contract-only lock，而不是 runtime capability；
3. 一旦扩展为 multi-object，将立即引入对象间协调、状态联动与失败恢复责任域；
4. batch / queue / chain / series / graph 形态天然触发 orchestration 语义；
5. orchestration 语义将直接突破 non-executing/non-completion/no-workflow-expansion 边界；
6. 因此 single-object 仍是唯一安全承接方式。

结论：Phase 20 主线内，single-object boundary 不可放松。

---

## 8. Contract-Only Runtime-Level Skeleton Boundary Lock

### 8.1 Definition

contract-only runtime-level semantics lock = 仅在语义、条款、契约、回归锚点层锁定 runtime-level skeleton 边界，不进入 rollout/activation/execution 结构。

### 8.2 Difference from Runtime Rollout / Activation

- contract-only lock：定义“可描述/可约束的 runtime-level skeleton 语义边界”；
- rollout / activation：引入运行时能力、执行路径、写路径、完成路径或编排路径。

本阶段仅允许前者，明确禁止后者。

### 8.3 Allowed vs Out-of-Bounds

允许：

- runtime-level semantics 的边界公式锁定；
- cross-layer wording/contract/notice 对齐；
- anti-misread 与 regression 锚点强化。

超界（禁止）：

- runtime semantics execution path；
- runtime write path；
- completion path；
- orchestration semantics；
- 任何 implementation prewire。

结论：不得以 runtime-level semantics 名义进行实现预埋。

---

## 9. Why This Is First Allowed but Still Narrow

1. 这是首次允许 runtime-level skeleton mainline：因为 Pre-start Audit 已完成并锁定唯一主线 Candidate B；
2. 现在才放开：因为前序阶段已完成 non-runtime skeleton 完成态与跨层 anti-misread/anti-drift 锚点；
3. 仍然极窄：仅 contract-only runtime semantics lock，不开放 rollout/activation；
4. 不能写成“runtime 骨架已开始落地”：该表述与 no rollout/no activation 边界冲突；
5. Candidate A 不再最优：无法回答 Phase 20 核心问题（runtime-level mainline 是否可被锁定承接）；
6. Candidate C 仍越界：会直接触发 runtime capability expansion 与 execution/orchestration/controller 风险。

---

## 10. Deferred / Out-of-Scope Directions

本阶段明确 deferred / out-of-scope：

- Candidate A 作为并行主线：deferred（不再作为 Phase 20 主线）；
- Candidate C（runtime rollout/activation progression）：out-of-scope；
- 所有 execution/completion/orchestration/controller/persistence expansion 路线：out-of-scope；
- 所有 multi-object / multi-stage workflow expansion 路线：out-of-scope。

并行多路线推进被禁止。

---

## 11. Step 2 Entry Criteria

Step 2 只能在以下条件全部满足后进入：

1. Step 1 Scope Lock 文档完成并冻结；
2. 唯一主线仍为 Candidate B，且无 second mainline；
3. Step 2 范围仍保持 single-object / bounded / design-limited / contract-only runtime-level semantics lock / non-executing / non-completion；
4. Step 2 计划项仅限于 contract/regression/wording/notice 层的最小边界硬化与一致性收敛；
5. 明确无 rollout/activation、无 execution/completion、无 orchestration/controller 扩展。

Step 2 可以做（仅限）：

- Candidate B 范围内 runtime-level semantics 边界条款最小硬化；
- contract/regression anti-misread 锚点补强；
- cross-layer wording / notice / clause 一致性收敛。

Step 2 不可以做：

- 任何 runtime rollout / activation；
- 任何 execution/completion path；
- 任何 external write / persistence / orchestration / controller 扩张；
- 任何 implementation prewire；
- 任何 multi-object 或 workflow engine 方向扩线。

---

## 12. Final Scope Lock Statement

Phase 20 Step 1 Scope Lock 结论如下：

- Candidate B 已被正式锁定为唯一允许主线；
- 这是首次允许的 runtime-level skeleton mainline，但仅限 contract-only runtime semantics lock；
- 该允许不等于 rollout 开放，不等于 activation 开放，不等于 execution/completion/orchestration/controller 开放；
- 全部既有冻结边界继续生效；
- Step 1 到此结束，停止于 scope lock，不进入 Step 2 实施。
