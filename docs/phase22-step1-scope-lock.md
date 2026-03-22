# KCW AI Platform – Phase 22 Step 1 Scope Lock

Date: 2026-03-22  
Branch: `work`  
Stage: Phase 22 / Step 1 Scope Lock

---

## 1. Step 1 Objective

本步唯一目标：基于已完成的 `docs/phase22-pre-start-audit.md`，将 Phase 22 范围进行正式锁定并形成不可误读的边界文档。  
本步不是审计重做，不是实现开发，不是能力落地，不新增 execution/completion/persistence/orchestration/controller/capability active。

---

## 2. Confirmed Input from Pre-start Audit

已承接且确认以下输入结论（来自 Phase 22 Pre-start Audit）：

1. Phase 22 可以开启；
2. 唯一合理主线仅有 Candidate B；
3. Candidate B = Narrow Capability Rollout/Activation Mainline, Contract-Gated, Non-executing；
4. 这是首次允许 capability rollout / activation-level mainline；
5. 但仅限 candidate-level contract-gated lock；
6. capability rollout active / capability activation active 仍未开放；
7. execution / completion / persistence / orchestration / controller rollout 仍未开放。

因此：Step 1 只负责 scope formalization / boundary lock，不负责重新裁定主线，不负责进入 Step 2 开发。

---

## 3. Current Baseline and Real Capability State

基于当前真实仓库状态，当前能力边界仍为：

- single-object / bounded / design-limited 轨道；
- non-executing / non-completion / non-persistent；
- read-only surfacing / read-model visibility，不是 controller-capable surface；
- 无真实 submission completion；
- 无真实 approval completion；
- 无 external write / side effects；
- 无 multi-object / multi-entity / multi-stage orchestration；
- 无 production persistence expansion；
- 无 capability rollout active；
- 无 capability activation active；
- 当前仅首次允许 capability-level semantics lock（contract-gated candidate-level），不是 capability 结构落地。

---

## 4. Locked Mainline for Phase 22

Phase 22 Step 1 正式锁定唯一主线：

**Candidate B = Narrow Capability Rollout/Activation Mainline, Contract-Gated, Non-executing**

锁定说明：

- 不存在 Candidate A / Candidate C 并行推进；
- 不存在 second mainline；
- 所有后续步骤（含 Step 2）只能沿该唯一主线推进；
- 若出现偏离该主线的提案，默认判定为 out-of-scope。

---

## 5. Allowed Scope

Phase 22 在本主线下仅允许以下极窄范围：

1. 对 capability rollout/activation-level semantics 的 **contract-level 表达与边界** 做正式锁定；
2. 对 contract / regression / anti-misread 边界进行最小强化；
3. 对“可进入 capability-level semantics，但不可 capability active”做边界清晰化；
4. 对 cross-layer wording / contract / notice 一致性做锁定；
5. 对 capability-level allowed scope 做文档级与契约级收敛；
6. 对 capability rollout / activation / controller / orchestration / execution 的禁止边界做更强、可测试、可审计表达。

允许范围的共性限制：

- 仅限语义/条款/回归锚点层；
- 不进入运行时能力路径；
- 不产生任何新执行、新写入、新编排行为。

---

## 6. Explicitly Forbidden Scope

以下内容在 Phase 22 Step 1 及其后续默认仍然禁止（除非未来新 Phase 明确重新立项）：

- real submission execution；
- real approval completion；
- real workflow completion；
- real external side effects；
- real persistence-backed audit system；
- queue / retry / background runner；
- async automation；
- multi-object mutation；
- multi-entity coordination；
- multi-stage orchestration；
- generalized workflow engine；
- controller-capable rollout；
- operator-triggered execution path；
- capability rollout active；
- capability activation active；
- platform capability completion；
- “looks like capability-level semantics lock but actually adds capability behavior” 的任何包装。

附加禁止：

- 不得借 Step 1 名义预埋 implementation prewire；
- 不得将 read-only surfacing 扩写为 action-capable surface；
- 不得把 contract-gated lock 叙述为 capability 已开放。

---

## 7. Single-object Boundary Lock

为何当前即使首次允许 capability-level mainline 也必须保持 single-object：

1. 既有 freeze boundary 的安全前提是 single-object bounded mutation intent；
2. multi-object 会引入对象间依赖、顺序协调、失败恢复与一致性问题，天然指向 orchestration 语义；
3. batch / queue / chain / series / graph 一旦出现，即进入 workflow engine 或 automation runner 风险域；
4. 当前阶段未开放 completion/persistence/orchestration/controller，无法承载 multi-object 的治理复杂度；
5. single-object 仍是唯一可回归验证、可边界收敛、可防误读的承接方式。

锁定结论：

- Phase 22 当前主线只允许 single-object；
- 任何 multi-object / multi-entity / multi-stage 提案在本阶段均判定越界。

---

## 8. Contract-Gated Capability-Level Boundary Lock

### 8.1 定义

contract-gated capability-level semantics lock 指：

- 在 capability rollout/activation-level 语义域中，仅允许定义“是否可被讨论/标注/约束”的合同门控边界；
- 仅允许 candidate-level 可审计表达；
- 不允许 runtime unlock，不允许 capability active。

### 8.2 与 capability active 的区别

- contract-gated semantics lock：是边界定义与禁止条件强化；
- capability rollout/activation active：是运行时能力被打开并可触发行为；
- 当前阶段只允许前者，明确禁止后者。

### 8.3 允许与越界判定

属于 allowed：

- boundary equations / notices / contract clauses 的清晰化；
- regression anchor 的最小加强；
- cross-layer wording 对齐，防止“allowed semantics”被误读成“active capability”。

一旦出现以下即越界：

- capability execution path；
- capability write path；
- completion path；
- orchestration semantics；
- controller-capable action path；
- implementation prewire。

### 8.4 不允许 prewire 的原因

implementation prewire 会在结构上预留 capability 行为通道，虽可伪装为“语义准备”，但实质会降低后续能力解锁门槛，直接破坏当前 freeze boundary。

---

## 9. Why This Is First Allowed but Still Narrow

1. 这是首次允许 capability rollout/activation-level mainline，是因为 Phase 21 已完成 rollout/activation-level skeleton semantics 的 contract-gated 稳定锁界；
2. 当前才放开，是因为此前阶段仅具备 runtime-level 或 skeleton-level 语义锁，不具备 capability-level 主线承接条件；
3. 本次放开仍为极窄受控版本，仅限 candidate-level contract gating；
4. 不得将本阶段表述为“capability 已开始开放”，准确表述必须是“首次允许 capability-level mainline，但仍非 capability active”；
5. Candidate A 不再最优，因为无法回答 Phase 22 核心问题；Candidate C 仍越界，因为会直接滑向 capability 实装与运行时解锁。

---

## 10. Deferred / Out-of-Scope Directions

以下方向在 Phase 22 当前阶段全部 deferred / out-of-scope：

- Candidate A: 继续 hardening-only 但不处理 capability-level 主线问题；
- Candidate C: 直接 capability implementation / activation / rollout 路线；
- execution/completion/persistence/orchestration/controller 任何扩线提案；
- multi-object / batch / queue / graph 化方向；
- 外部系统写入、自动化运行器、后台任务系统。

---

## 11. Step 2 Entry Criteria

Step 2 进入条件（必须全部满足）：

1. Step 1 Scope Lock 文档完成并冻结；
2. 仍沿唯一主线 Candidate B 推进；
3. 仍保持 single-object / bounded / design-limited / contract-gated capability-level semantics lock / non-executing / non-completion；
4. Step 2 计划项仅限“最小 contract/regression/wording 锁界硬化”，且可审计；
5. 明确列出并继续冻结 forbidden scope，不得出现 capability active 描述。

Step 2 可以做什么（具体）：

- 对 capability-level boundary clauses 做最小增补或收紧；
- 对跨层 notice/wording/test anchors 做一致性硬化；
- 对“candidate-level lock != capability active”方程做更强回归锚定；
- 对既有文档与契约条款做防误读整理。

Step 2 不可以做什么（具体）：

- 不可新增 execution/completion path；
- 不可新增 external write / side effects；
- 不可新增 persistence/orchestration/controller 结构；
- 不可新增 queue/retry/automation runner；
- 不可新增 multi-object mutation/coordination；
- 不可将 Step 2 叙述为 capability rollout/activation 已进入；
- 不可将 Step 2 叙述为完整能力开发启动。

---

## 12. Final Scope Lock Statement

Phase 22 Step 1 Scope Lock 至此完成并正式生效：

- 唯一主线已锁定为 Candidate B；
- 这是首次允许 capability rollout / activation-level mainline；
- 但仅限 contract-gated candidate-level semantics lock；
- 不等于 capability rollout 已开放；
- 不等于 capability activation 已开放；
- 不等于平台 fully operational；
- 不等于 execution / completion / orchestration / controller 已开放。

后续仅可在本锁定范围内评估 Step 2；本步完成后立即停止，不进入 Step 2 执行。

