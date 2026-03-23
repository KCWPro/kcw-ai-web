# KCW AI Platform – Phase 25 Step 1 Scope Lock

Date: 2026-03-22  
Branch: `work`  
Stage: Phase 25 / Step 1 Scope Lock

---

## 1. Step 1 Objective

本步唯一目标：基于已完成的 Phase 25 Pre-start Audit 结论，正式锁定 Phase 25 的唯一主线、允许范围、禁止范围与 Step 2 进入条件。  
本步不是审计重做，不是实现开发，不是 capability active runtime 落地。

---

## 2. Confirmed Input from Pre-start Audit

已确认承接输入：

- `docs/phase25-pre-start-audit.md` 已完成；
- 审计已裁定：Phase 25 可开启，且仅允许 Candidate A；
- Candidate A = Readiness-Contract Continuity & Runtime-Readiness Gap Clarification, Non-active；
- 当前不具备 capability active runtime mainline 条件；
- Step 1 不负责重新审计，只负责 scope formalization / boundary lock。

因此，本步不重开 Candidate B/C，不做并行路线。

---

## 3. Current Baseline and Real Capability State

基于当前仓库状态，继续确认：

1. 仍处于 single-object / bounded / design-limited 轨道；
2. 仍受 non-executing / non-completion / non-persistent / read-only 语义约束；
3. 当前 UI / read model 仍是 surfacing，不是 controller-capable action surface；
4. 没有真实 approval completion；
5. 没有真实 submission completion；
6. 没有真实 workflow completion；
7. 没有真实 external write / side effects（就本主线语义而言）；
8. 没有 multi-object / multi-stage orchestration；
9. 没有 production persistence expansion；
10. capability rollout active 未开放；
11. capability activation active 未开放；
12. 当前层级仍是 capability-active mainline allowed, readiness-contract frozen, non-active runtime。

---

## 4. Locked Mainline for Phase 25

Phase 25 唯一允许主线正式锁定为：

**Candidate A = Readiness-Contract Continuity & Runtime-Readiness Gap Clarification, Non-active**

该主线必须同时满足以下硬约束，不得突破：

- single-object only
- bounded / design-limited only
- non-active only
- readiness-contract continuity only
- runtime-readiness gap clarification only
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

- 本阶段仍不具备 capability active runtime mainline 条件；
- 本阶段不等于 capability rollout active 已开放；
- 本阶段不等于 capability activation active 已开放；
- 本阶段不等于平台 fully operational；
- 本阶段不等于 execution / completion / orchestration 已开放。

---

## 5. Allowed Scope

Phase 25 在 Candidate A 主线下仅允许极窄范围：

1. 对既有 non-active 边界做 contract-level 锁定与表达收敛；
2. 对 active-ready / not-open / not-unlocked / not-prewired 的 gap 做进一步澄清；
3. 对 contract / regression / anti-misread 边界做进一步约束；
4. 对“已允许 active mainline，但仍非 active runtime”做更明确表达；
5. 对 cross-layer wording / contract / notice 一致性进行锁定；
6. 对 non-active allowed scope 做文档级与契约级收敛；
7. 对 capability active runtime / controller / orchestration / execution 的禁止边界做更强表达。

Allowed scope 的边界定义：

- 只允许治理层、契约层、表达层收敛；
- 不允许行为层、执行层、控制层扩展；
- 任何可被解释为 runtime unlock 的改动，默认越界。

---

## 6. Explicitly Forbidden Scope

Phase 25 Step 1 及其后续默认仍禁止（除非未来新 Phase 明确重新立项）：

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
- “looks like readiness gap clarification but actually adds active behavior” 的任何包装

---

## 7. Single-object Boundary Lock

当前仍必须严格 single-object，原因如下：

1. 现有边界安全性建立在 single-object 可判定、可回归、可隔离前提上；
2. multi-object 会引入跨对象状态耦合与时序问题，超出现有 freeze boundary；
3. batch / queue / chain / series / graph 任一形态都会引入 orchestration 语义；
4. 在 non-active、non-executing、non-completion 约束下，single-object 是唯一可控承接方式；
5. 一旦扩展到 multi-object，将立即冲击 no orchestration/no workflow expansion/no controller-capable rollout 边界。

结论：single-object boundary 继续作为硬锁，不得弱化。

---

## 8. Readiness-Contract Continuity / Runtime-Readiness Gap Clarification Boundary Lock

### 8.1 定义

readiness-contract continuity / runtime-readiness gap clarification, non-active 指：

- 仅对既有 readiness-contract 边界做连续性锁定；
- 仅澄清 active-ready 与 active-runtime 之间的禁止性 gap；
- 仅输出判定语义与边界语义；
- 不触发执行、写入、完成、编排、控制行为。

### 8.2 与 capability active runtime 的区别

- 本阶段（allowed）：non-active continuity + gap clarification；
- capability active runtime（forbidden）：rollout/activation/execution/controller 行为开放。

两者不可混写、不可互相替代。

### 8.3 本阶段只允许前者，不允许后者

允许：

- non-active boundary contracts 强化；
- anti-misread / anti-drift regression anchors 强化；
- active-ready/not-open/not-unlocked/not-prewired 的条款澄清；
- cross-layer notice/wording consistency 锁定。

不允许：

- capability execution path
- write path
- completion path
- orchestration semantics
- controller authority path
- runtime rollout/activation unlock

### 8.4 Clarification 不得变相 prewire

本阶段不能借 clarification 名义做 implementation prewire。  
任何“现在先埋、未来再开”的结构，只要可直接复用为 runtime unlock，即视为越界。

---

## 9. Why Capability Active Runtime Is Still Not Open

1. 当前主线裁定仍是 Candidate A（non-active continuity/gap clarification），不是 runtime mainline；
2. 当前证据链仅支持 readiness-contract continuity，不支持 runtime capability 开放；
3. 现有边界明确冻结 execution/completion/persistence/orchestration/controller；
4. 将本阶段表述为“capability 已开始开放”会造成语义误导，违反边界锁定目标；
5. Candidate B 在本阶段不成立（与已锁定主线冲突）；
6. Candidate C 在本阶段直接越界（active runtime / controller / orchestration 扩张）。

结论：capability active runtime 仍未开放，且本阶段不得作开放性表述。

---

## 10. Deferred / Out-of-Scope Directions

以下方向在 Phase 25 当前范围全部 deferred / out-of-scope：

- Candidate B 重新打开或并行推进；
- Candidate C（direct capability active runtime rollout/activation）；
- execution/completion 能力扩展；
- persistence/orchestration/controller 能力扩展；
- external write / side effect / automation runner 扩展；
- multi-object / multi-entity / multi-stage 扩展；
- 任何 implementation prewire 包装路径。

---

## 11. Step 2 Entry Criteria

Step 2 进入前提（必须同时满足）：

1. Step 1 Scope Lock 文档完成并冻结；
2. Step 2 只能沿唯一主线 Candidate A 推进；
3. Step 2 必须继续保持：single-object / bounded / design-limited / readiness-contract continuity / runtime-readiness gap clarification / non-executing / non-completion。

Step 2 可以做什么（若进入）：

- 对 Candidate A 范围内 non-active contract 条款做最小 hardening；
- 对 active-ready/not-open/not-unlocked/not-prewired 的 gap 表达做最小 anti-misread 强化；
- 对 contract/notice/regression anchors 做跨层一致性补强；
- 对“allowed mainline != runtime open”做更强可审计化收敛。

Step 2 不可以做什么（若进入）：

- 不得进入 capability active runtime；
- 不得新增 execution/write/completion/orchestration/controller path；
- 不得新增 persistence-backed audit / runner / queue / retry / async automation；
- 不得新增 multi-object / multi-entity / multi-stage 机制；
- 不得把 Step 2 描述成“开始开发完整能力”；
- 不得把 Step 2 描述成“进入 capability active runtime”。

---

## 12. Final Scope Lock Statement

Phase 25 Step 1 Scope Lock 至此正式完成锁定：

- 唯一主线：Candidate A（Readiness-Contract Continuity & Runtime-Readiness Gap Clarification, Non-active）；
- 当前 capability active runtime mainline 条件：**不具备**；
- capability rollout active / capability activation active：**未开放**；
- execution / completion / persistence / orchestration / controller rollout：**未开放**；
- single-object / bounded / design-limited / non-active / regression-safe：**持续硬约束**。

本步完成后停止，不进入 Step 2 实施。
