# KCW AI Platform – Phase 24 Step 1 Scope Lock

Date: 2026-03-22  
Branch: `work`  
Stage: Phase 24 / Step 1 Scope Lock

---

## 1. Step 1 Objective

本步目标仅为：在已完成的 Phase 24 Pre-start Audit 结论基础上，正式锁定 Phase 24 的唯一主线、允许范围、禁止范围与 Step 2 进入条件。  
本步不是审计重做，不是实现开发，不是能力扩张，不进入 capability active runtime。

---

## 2. Confirmed Input from Pre-start Audit

已确认承接输入：

- `docs/phase24-pre-start-audit.md` 已完成并正式裁定：
  - Phase 24 可以开启；
  - 唯一合理主线为 Candidate B；
  - Candidate B = Capability-Active Readiness Contract Mainline（Eligibility-only, Non-executing）；
  - 这是首次允许的 capability active mainline；
  - 但仅限 readiness-contract / eligibility-only，不等于 runtime capability active 开放。

因此，Step 1 只负责 scope formalization / boundary lock，不重新投票主线、不重开 Candidate A/C 并行路线。

---

## 3. Current Baseline and Real Capability State

基于当前仓库真实状态，继续确认以下事实：

1. 仍在 single-object / bounded / design-limited 轨道；
2. 仍受 non-executing / non-completion / non-persistent / read-only 语义约束；
3. UI 与 read model 仍是 surfacing，不是 controller-capable surface；
4. 没有真实 submission completion；
5. 没有真实 approval completion；
6. 没有真实 workflow completion；
7. 没有真实 external write / side effects；
8. 没有 multi-object / multi-entity / multi-stage orchestration；
9. 没有 production persistence expansion；
10. capability rollout active 仍未开放；
11. capability activation active 仍未开放；
12. 当前“首次允许 capability active mainline”仅指 readiness-contract / eligibility-only 主线被允许，不指向 capability active runtime 落地。

---

## 4. Locked Mainline for Phase 24

Phase 24 唯一允许主线正式锁定为：

**Candidate B = Capability-Active Readiness Contract Mainline（Eligibility-only, Non-executing）**

该主线必须同时满足且不得突破：

- single-object only
- bounded / design-limited only
- readiness-contract only
- eligibility-only
- regression-safe only
- non-executing
- non-completion
- non-persistent
- no external side effects
- no workflow expansion
- no multi-entity / multi-stage orchestration
- no controller-capable rollout
- no capability rollout active
- no capability activation active

锁定说明：

- 这是首次允许 capability active mainline（治理/判定层）；
- 但不等于 capability rollout active 已开放；
- 不等于 capability activation active 已开放；
- 不等于平台 fully operational；
- 不等于 execution/completion/orchestration/controller 已开放。

---

## 5. Allowed Scope

Phase 24 在 Candidate B 主线下仅允许以下极窄范围：

1. 对 capability active readiness 条件做 contract-level、可审计、可回归的正式锁定；
2. 对 eligibility / readiness / anti-misread / regression 边界进行收敛与约束；
3. 对“可被判定为 active-ready，但不可 active/unlock”的边界做最小清晰化；
4. 对 cross-layer wording / contract / notice 一致性进行锁定；
5. 对 readiness-only allowed scope 做文档级与契约级收敛；
6. 对 capability active / controller / orchestration / execution 的禁止边界做更强表达。

Allowed scope 解释：

- 仅允许“判定与约束语义”层面的收敛；
- 不允许“行为与执行语义”层面的扩展；
- 任何会产生 runtime unlock 暗示的内容均不在允许范围内。

---

## 6. Explicitly Forbidden Scope

以下内容在 Phase 24 Step 1 及其后续默认仍禁止（除非未来新 Phase 明确重新立项）：

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
- “looks like readiness contract but actually adds active behavior” 的任何包装

---

## 7. Single-object Boundary Lock

即使首次允许 capability active mainline，当前仍必须严格 single-object，原因如下：

1. 当前边界安全性建立在 single-object 的可判定、可回归、可隔离前提上；
2. 一旦扩展为 multi-object，将立即引入跨对象状态耦合与时序问题，超出现有冻结边界；
3. batch / queue / chain / series / graph 任一形态都天然带来 orchestration 语义，直接越界；
4. multi-object 扩展会使“eligibility-only”滑向“execution coordination”，与本阶段目标冲突；
5. 在当前 non-executing/non-completion 约束下，single-object 是唯一可控承接方式。

结论：single-object boundary 继续作为硬约束，不得弱化。

---

## 8. Readiness-Contract / Eligibility-Only Boundary Lock

### 8.1 定义

readiness-contract / eligibility-only 指：

- 仅对“是否具备进入 active 判定资格”的条件进行契约化表达；
- 仅输出判定语义与边界语义；
- 不触发任何执行、写入、完成、编排、控制行为。

### 8.2 与 capability active 的区别

- readiness-contract / eligibility-only：判断“可否被认定为 ready”；
- capability active：意味着 runtime rollout/activation 与行为开放。

本阶段只允许前者，明确禁止后者。

### 8.3 Allowed readiness semantics

允许：

- readiness 条件条款化；
- eligibility 判定边界条款化；
- anti-misread / regression 锚点强化；
- cross-layer 术语一致性锁定。

不允许：

- capability execution path；
- write path；
- completion path；
- orchestration semantics；
- 任何 implementation prewire。

### 8.4 Prewire 禁止说明

本阶段不能借 readiness 名义进行 implementation prewire。  
一旦出现可被直接复用为 active runtime unlock 的结构，即视为越界。

---

## 9. Why This Is First Allowed but Still Narrow

1. 这是首次允许 capability active mainline，因为 Phase 24 Pre-start Audit 已正式确认可以进入“active readiness 判定主线”；
2. 之所以现在才允许，是因为 Phase 23 已完成 non-active continuity 的收口与边界强化，具备了可审计承接基础；
3. 之所以仍是极窄受控版本，是因为 runtime capability active、execution、completion、orchestration、controller 仍全部冻结；
4. 本阶段不能表述为“capability 已开始开放”，准确表述应是“capability-active readiness-contract mainline 首次允许”；
5. Candidate A 不再最优，因为无法正面解决 Phase 24 核心问题；Candidate C 仍越界，因为会直接滑入 active/runtime 扩张。

---

## 10. Deferred / Out-of-Scope Directions

以下方向在 Phase 24 当前范围内全部 deferred / out-of-scope：

- Candidate A 并行重开（不允许 second mainline）
- Candidate C（direct capability active rollout/activation）
- execution/completion 能力扩张
- persistence/orchestration/controller 能力扩张
- external write 与 automation runner 相关能力扩张
- 任何以“先预埋后启用”为名义的实现路径扩张

---

## 11. Step 2 Entry Criteria

Step 2 进入前提（必须同时满足）：

1. Step 1 Scope Lock 文档完成并冻结；
2. Step 2 继续且只能沿 Candidate B 单主线推进；
3. Step 2 仍必须保持：single-object / bounded / design-limited / readiness-contract / eligibility-only / non-executing / non-completion。

Step 2 可以做什么（若进入）：

- 对 readiness-contract 条款做最小 contract hardening；
- 对 eligibility 判定边界做 anti-misread 强化；
- 对 cross-layer wording/notice/regression anchors 做一致性补强；
- 对“active-ready != active runtime”表达做更强可审计化收敛。

Step 2 不可以做什么（若进入）：

- 不得进入 capability active runtime；
- 不得新增 execution/write/completion/orchestration/controller path；
- 不得新增 persistence-backed audit / queue / retry / async automation；
- 不得新增 multi-object/multi-entity/multi-stage 机制；
- 不得把 Step 2 描述为“开始开发完整能力”或“进入 capability active”。

---

## 12. Final Scope Lock Statement

Phase 24 Step 1 Scope Lock 至此正式完成锁定：

- 唯一主线：Candidate B（Capability-Active Readiness Contract Mainline，Eligibility-only，Non-executing）；
- 首次允许 capability active mainline：**yes（仅 readiness-contract / eligibility-only）**；
- capability rollout active / capability activation active：**no**；
- execution / completion / persistence / orchestration / controller rollout：**no**；
- single-object / bounded / design-limited / regression-safe：**持续硬约束**。

本步完成后停止，不进入 Step 2 实施。
