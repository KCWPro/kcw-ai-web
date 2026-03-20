# KCW AI Platform – Phase 17 Step 1 Scope Lock

Date: 2026-03-20  
Stage: Phase 17 / Step 1 Scope Lock

---

## 1. Step 1 Objective

本步目标是 **scope formalization / boundary lock**，不是审计重做，不是实现开发。  
本步只做以下动作：

1. 承接 `docs/phase17-pre-start-audit.md` 的既有裁定；
2. 将 Candidate A 正式锁定为 Phase 17 唯一允许主线；
3. 将允许范围、禁止范围、Step 2 进入条件写成不可误读的硬约束。

本步不新增 runtime 语义、不新增执行能力、不新增平台骨架能力。

---

## 2. Confirmed Input from Pre-start Audit

已确认输入如下（来自 Phase 17 Pre-start Audit）：

1. Phase 17 Pre-start Audit 已完成；
2. 审计已裁定：**仅允许 Candidate A**；
3. 当前未出现可落地的“骨架承接型主线”条件；
4. Step 1 不负责重新审计；
5. Step 1 只负责 scope formalization / boundary lock；
6. 未经 Step 1 锁范围，不得进入 Step 2。

---

## 3. Current Baseline and Real Capability State

基于当前真实仓库状态，能力边界仍为：

1. 仍是 single-object intent / surfacing 轨道；
2. 仍受 bounded / design-limited / non-executing / non-completion / non-persistent / read-only 语义约束；
3. UI 与 read-model 仍是 surfacing，不是 controller；
4. 没有真实 approval completion；
5. 没有真实 submission completion；
6. 没有真实 external write / side effects；
7. 没有 multi-object / multi-entity / multi-stage orchestration；
8. 没有 production persistence expansion；
9. 没有骨架承接型 runtime 结构落地。

结论：当前仍处于 freeze boundary revalidation continuity 轨道，不是平台能力开放轨道。

---

## 4. Locked Mainline for Phase 17

Phase 17 唯一允许主线（硬锁）：

**Candidate A = Freeze Boundary Revalidation / Continuity Hardening / Scope-Prep Only**

锁定条款：

1. Candidate A 是唯一允许路线；
2. Candidate B / Candidate C 不得在 Phase 17 内开启；
3. 不允许第二主线，不允许并行主线；
4. 不允许把 Step 1 改写为实现步。

---

## 5. Allowed Scope

Phase 17 在 Candidate A 下允许范围仅限以下窄集合：

1. 对既有 freeze boundary 做再验证与再确认（revalidation only）；
2. 对 audit / contract / regression anchors 的一致性做进一步锁定；
3. 对误读风险（anti-misread）做收口；
4. 对跨层边界声明/条款/提示做一致化；
5. 对 freeze-prep 所需文档级锁前准备做最小补强；
6. 对 anti-drift / anti-misread 边界做更清晰硬化表达。

允许范围解释：

- 以上动作仅限文档、契约语义、回归锚点层；
- 不得进入 runtime semantics、write path、completion semantics、orchestration semantics；
- 不得以“scope-prep”名义引入任何能力扩张。

---

## 6. Explicitly Forbidden Scope

以下内容在 Phase 17 Step 1 及其后续默认仍然禁止（除非未来新 Phase 明确重新立项）：

1. real submission execution
2. real approval completion
3. real workflow completion
4. real external side effects
5. real persistence-backed audit system
6. queue / retry / background runner
7. async automation
8. multi-object mutation
9. multi-entity coordination
10. multi-stage orchestration
11. generalized workflow engine
12. controller-capable UI
13. operator-triggered execution path
14. platform skeleton runtime rollout
15. 任何“看似 revalidation / scope-prep、实则 capability expansion”的包装改动
16. implementation prewire（即使未启用也禁止）

本节为硬禁止，不可解释为“条件开放”。

---

## 7. Single-object Boundary Lock

### 7.1 为什么仍然只能 single-object

1. 现有冻结边界和回归锚点全部建立在 single-object 可审计可验证前提上；
2. single-object 是当前阶段唯一可控风险承接单位。

### 7.2 为什么不能扩成 multi-object

1. multi-object 会引入对象间顺序依赖、部分失败恢复、重放一致性问题；
2. 这些问题天然触达 orchestration/runtime 语义，超出本阶段边界。

### 7.3 为什么不能扩成 batch / queue / chain / series / graph

1. batch/queue/chain/series/graph 均隐含调度、执行、重试或编排机制；
2. 一旦引入即不再是边界再验证，而是 workflow expansion。

### 7.4 锁定结论

- single-object 是当前唯一安全承接方式；
- 一旦扩为 multi-object（或其变体），即视为立刻突破既有 freeze boundary。

---

## 8. Bounded / Design-limited / Audit-Contract-Regression Boundary Lock

### 8.1 本阶段术语硬定义

1. **bounded**：仅在既有边界内收敛，不开新语义域；
2. **design-limited**：仅允许语义/条款/文档/锚点层，不进入 runtime 执行层；
3. **audit-only**：只做可追溯边界复核与结论固化；
4. **contract-only**：只做 contract clause/notice/equation 一致性锁定；
5. **regression-only**：只做防漂移锚点稳固，不引入新能力目标。

### 8.2 什么属于当前范围

以下属于 revalidation / continuity hardening / scope-prep：

1. 既有边界条款复核、对齐、收敛；
2. 既有禁止项与 non-goals 明确化；
3. Step 2 进入条件与禁止项文档化；
4. 跨层 wording/notice/equation 的一致化。

### 8.3 什么不属于当前范围

以下任一出现即越界：

1. runtime semantics 增量；
2. write path / external side effect path 新增；
3. completion semantics 新增；
4. orchestration semantics 新增；
5. controller action 入口新增。

### 8.4 为什么禁止 implementation prewire

本阶段不得借“revalidation / preparation”名义预埋未来执行框架。  
任何 prewire（即使不启用）都属于能力扩张前置，不允许进入 Phase 17 主线。

---

## 9. Why Skeleton-Carrying Mainline Is Still Not Open

当前必须明确：**骨架承接型主线尚未开放**。

原因：

1. 当前未获得把 execution/completion/persistence/orchestration/controller 放开的结构性审计裁定；
2. 当前缺口不是“再补一点边界文案”，而是进入下一能力层所需的前置治理条件尚未成立；
3. Candidate B / Candidate C 仍会同时触发多条边界越界风险；
4. 因此 Phase 17 不能被表述为“开始平台骨架落地”的阶段。

硬结论：Phase 17 当前只能继续做边界再验证、连续性硬化、与范围锁前准备。

---

## 10. Deferred / Out-of-Scope Directions

Phase 17 明确 deferred / out-of-scope 方向：

1. Candidate B（execution / completion 扩张向）
2. Candidate C（persistence / orchestration / controller / multi-object / skeleton-runtime 扩张向）

处理规则：

- 不得在 Phase 17 内启动；
- 不得并行试点；
- 不得以“先留接口 / 先搭框架”方式隐性进入。

---

## 11. Step 2 Entry Criteria

### 11.1 Step 2 进入前提

Step 2 只能在以下条件全部满足后进入：

1. Step 1 Scope Lock 文档已完成并冻结；
2. 唯一主线仍为 Candidate A；
3. 未发生任何超出 Step 1 范围的实现动作；
4. 允许/禁止范围与边界词义无歧义、可审计、可追责。

### 11.2 Step 2 可以做什么（仅 Candidate A 内）

若进入 Step 2，仅允许：

1. freeze boundary continuity 的最小再验证硬化；
2. audit / contract / regression anchors 的最小一致化补强；
3. anti-misread / anti-drift 条款的最小收口；
4. 跨层 wording/notice/equation 的最小对齐。

### 11.3 Step 2 不可以做什么

Step 2 仍必须禁止：

1. execution / completion / persistence / orchestration / controller / multi-object 任何能力扩张；
2. real write / external side effects / automation runner；
3. queue/retry/background/async 执行机制；
4. generalized workflow engine 或 platform skeleton runtime rollout；
5. implementation prewire。

Step 2 不得被描述为“开始开发完整能力”或“进入平台骨架实现”。

---

## 12. Final Scope Lock Statement

本文件发布后，Phase 17 Step 1 范围正式锁定如下：

1. 仅允许 Candidate A；
2. 仅允许 single-object / bounded / design-limited / audit-only / contract-only / regression-only；
3. 持续保持 non-executing / non-completion / non-persistent / no external side effects / no workflow expansion；
4. 骨架承接型主线尚未开放；
5. Candidate B / C 继续 deferred / out-of-scope；
6. 本步到此停止，不进入 Step 2 实施。

