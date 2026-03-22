# KCW AI Platform – Phase 23 Step 1 Scope Lock

Date: 2026-03-22  
Branch: `work`  
Stage: Phase 23 / Step 1 Scope Lock

---

## 1. Step 1 Objective

本步唯一目标：在已完成 `docs/phase23-pre-start-audit.md` 的基础上，完成 Phase 23 范围正式锁定（scope formalization / boundary lock）。

本步不是：

- 审计重做；
- 实现开发；
- capability active 落地；
- execution / completion / persistence / orchestration / controller 能力开放。

---

## 2. Confirmed Input from Pre-start Audit

已确认并承接以下已锁定前提（来自 Phase 23 Pre-start Audit）：

1. Phase 23 可以开启；
2. 仅存在唯一合理主线 Candidate A；
3. Candidate A = Contract-Gated Hardening Continuity, Non-active；
4. 当前不具备 capability active mainline 条件；
5. 当前仍不得进入 capability active；
6. 当前仍不允许 execution / completion / persistence / orchestration / controller rollout。

因此：Step 1 不负责重新投票 Candidate，不负责重新审计，只负责锁范围。

---

## 3. Current Baseline and Real Capability State

基于当前仓库真实状态，当前能力边界仍为：

- single-object / bounded / design-limited 轨道；
- non-executing / non-completion / non-persistent；
- read-only surfacing（UI / read model）而非 controller-capable surface；
- 无真实 submission completion；
- 无真实 approval completion；
- 无 external write / side effects；
- 无 multi-object / multi-entity / multi-stage orchestration；
- 无 production persistence expansion；
- 无 capability rollout active；
- 无 capability activation active；
- 当前仅为 capability-level semantics allowed, non-active。

---

## 4. Locked Mainline for Phase 23

Phase 23 Step 1 正式锁定唯一主线：

**Candidate A = Contract-Gated Hardening Continuity, Non-active**

锁定约束：

- 不存在 Candidate B / Candidate C 并行推进；
- 不存在 second mainline；
- 后续步骤（若进入 Step 2）只能沿 Candidate A 前进；
- 任何偏离 Candidate A 的提案默认 out-of-scope。

---

## 5. Allowed Scope

Phase 23 在本主线下仅允许以下极窄范围：

1. 对既有 non-active 边界的 contract-level 表达和 boundary equation 做进一步锁定；
2. 对 contract / regression / anti-misread 约束做最小必要强化；
3. 对“已允许 capability-level semantics，但仍非 active”的边界做更清晰、不可误读表达；
4. 对 cross-layer wording / contract / notice 一致性继续收敛；
5. 对 non-active allowed scope 做文档级与契约级归并；
6. 对 capability active / controller / orchestration / execution 的禁止边界做更强显式表达。

共性限制：

- 仅限 boundary/contract/regression/doc 明确化；
- 不进入 runtime unlock；
- 不新增执行路径、写路径、完成路径。

---

## 6. Explicitly Forbidden Scope

以下内容在 Phase 23 Step 1 及其后续默认仍然禁止（除非未来新 Phase 明确重新立项）：

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
- capability rollout active
- capability activation active
- platform capability completion
- “looks like non-active hardening continuity but actually adds active behavior” 的任何包装

附加禁止：

- 不得借 Step 1 名义预埋 implementation prewire；
- 不得把 read-only surfacing 改写为 action-capable surface；
- 不得把 non-active continuity 叙述为 capability 已开放。

---

## 7. Single-object Boundary Lock

为何当前仍只能 single-object：

1. 当前 freeze boundary 的稳定前提是 single-object bounded 语义收敛；
2. multi-object 会引入对象间顺序/一致性/失败恢复问题，天然滑向 orchestration；
3. batch / queue / chain / series / graph 会形成流程编排语义，触发 workflow engine 风险；
4. 当前未开放 completion/persistence/orchestration/controller，无法承载 multi-object 治理复杂度；
5. single-object 仍是唯一可回归验证、可边界锁定、可防误读的承接方式。

锁定结论：

- Phase 23 当前仅允许 single-object；
- 任何 multi-object / batch / queue / chain / series / graph 提案均判定越界。

---

## 8. Contract-Gated Non-active Continuity Boundary Lock

### 8.1 定义

contract-gated hardening continuity, non-active 指：

- 继续在既有 capability-level semantics（已允许）范围内做边界表达加固；
- 仅允许 contract/regression/notice 级别的连续性强化；
- 明确保持 non-active，不触发任何 runtime capability unlock。

### 8.2 与 capability active 的区别

- non-active continuity：边界澄清与约束收敛；
- capability active：运行能力打开并可触发行为路径。

本阶段仅允许前者，明确禁止后者。

### 8.3 Allowed non-active continuity

属于 allowed：

- boundary equations 的补强与对称化；
- anti-misread wording 的跨层一致性收敛；
- regression anchors 的最小补强；
- “semantics allowed != active opened” 的强表达。

以下即越界（不属于当前范围）：

- capability execution path
- capability write path
- completion path
- orchestration semantics
- controller-capable action path

### 8.4 Why No Implementation Prewire

implementation prewire 会结构性降低后续 active 解锁门槛，即使包装为“continuity”也会实质突破 freeze boundary，因此本阶段必须禁止。

---

## 9. Why Capability Active Is Still Not Open

当前 capability active 仍未开放，原因明确：

1. 仍不具备 capability active mainline 条件（Pre-start Audit 已裁定）；
2. 当前证据仅支持 capability-level semantics allowed, non-active；
3. 将本阶段写成“capability 已开始开放”会构成误导并冲突于锁定边界；
4. Candidate A 是唯一可在不越界前提下推进的主线；
5. Candidate B 在本阶段会引入“active eligibility -> active unlock”滑移风险；
6. Candidate C 直接越界到 active/implementation，不成立。

补充澄清：

- 本阶段不等于 capability rollout 已开放；
- 本阶段不等于 capability activation 已开放；
- 本阶段不等于平台 fully operational；
- 本阶段不等于 execution/completion/orchestration 已开放。

---

## 10. Deferred / Out-of-Scope Directions

以下方向在 Phase 23 当前阶段全部 deferred / out-of-scope：

- Candidate B / Candidate C 方向及其任何并行路线；
- capability active 相关提案；
- execution/completion/persistence/orchestration/controller 任一扩线；
- multi-object / batch / queue / graph 化方向；
- 外部系统写入、自动化 runner、后台任务系统；
- 任何 implementation prewire。

---

## 11. Step 2 Entry Criteria

Step 2 只能在 Step 1 Scope Lock 完成后进入，且必须全部满足：

1. Step 1 文档冻结并明确唯一主线仍为 Candidate A；
2. 继续保持 single-object / bounded / design-limited；
3. 继续保持 contract-gated non-active continuity；
4. 继续保持 non-executing / non-completion / non-persistent；
5. Step 2 计划项仅限 boundary/contract/regression/wording 的最小硬化，且可审计；
6. 所有 forbidden scope 保持冻结，不得出现 capability active 描述。

Step 2 可以做什么（具体）：

- 补强 non-active boundary clauses；
- 补强 anti-misread / anti-drift contract anchors；
- 对 cross-layer wording/notice/test anchors 做一致性硬化；
- 对“semantics allowed != active unlocked”方程做更强回归锚定。

Step 2 不可以做什么（具体）：

- 不可新增 capability rollout active / capability activation active；
- 不可新增 execution/completion path；
- 不可新增 external write / side effect；
- 不可新增 persistence/orchestration/controller 结构；
- 不可新增 queue/retry/automation runner；
- 不可新增 multi-object mutation/coordination；
- 不可把 Step 2 描述成“开始开发完整能力”；
- 不可把 Step 2 描述成“进入 capability active”。

---

## 12. Final Scope Lock Statement

Phase 23 Step 1 Scope Lock 至此完成并生效：

- 唯一主线已锁定为 Candidate A（Contract-Gated Hardening Continuity, Non-active）；
- capability active mainline 条件仍不具备；
- capability active 仍未开放；
- execution / completion / persistence / orchestration / controller 仍未开放；
- 本阶段仅允许 non-active continuity 范围内的 contract-gated hardening。

本步完成后立即停止，不进入 Step 2 实施。
