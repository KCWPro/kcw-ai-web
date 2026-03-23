# KCW AI Platform – Phase 26 Step 1 Scope Lock

Date: 2026-03-23  
Branch: `work`  
Stage: Phase 26 / Step 1 Scope Lock

---

## 1. Step 1 Objective

本步目标是：基于已完成的 Phase 26 Pre-start Audit，把 Phase 26 的唯一主线、允许范围、禁止范围、Step 2 进入条件正式锁定为可审计边界。  
本步不是审计重做，不是实现开发，不是能力扩张，不是 full capability active 落地。

---

## 2. Confirmed Input from Pre-start Audit

已承接且不再重投票的前提：

1. `docs/phase26-pre-start-audit.md` 已完成并给出最终裁定；
2. Phase 26 允许开启，且允许进入 Step 1 Scope Lock；
3. 唯一合理主线已收敛为 Candidate B；
4. 当前首次具备 capability active runtime mainline 条件，但仅限 narrow / contract-gated；
5. execution / completion / persistence / orchestration / controller rollout 仍未开放；
6. Step 1 只负责 scope formalization / boundary lock。

---

## 3. Current Baseline and Real Capability State

基于当前仓库真实状态，当前基线仍为：

- single-object / bounded / design-limited 轨道；
- capability-active mainline allowed（mainline 层面允许）但 runtime 仍为受限窄域；
- read-only surfacing 与 bounded capability contract 仍在主链；
- 无 generalized execution/completion/orchestration/controller 开放；
- 无 multi-object / multi-stage orchestration；
- 无 production persistence expansion；
- 无 generalized controller rollout。

因此：即使 Step 1 锁定“首次允许 capability active runtime mainline”，也只能是极窄 contract-gated 版本，不得扩张为 generalized runtime capability。

---

## 4. Locked Mainline for Phase 26

Phase 26 唯一允许主线正式锁定为：

**Candidate B = First Minimal Capability-active Runtime Mainline Candidate, Narrow & Contract-Gated**

锁定声明：

- 无 Candidate A / Candidate C 并行推进；
- 无 second mainline；
- 无“先并行再收敛”的策略空间；
- 所有后续 Step（若进入）必须显式证明与 Candidate B 一致。

---

## 5. Allowed Scope

Phase 26 在 Step 1 锁定后的允许范围，仅限以下窄集合：

1. 对 first minimal capability-active runtime 的 contract-gated 边界进行正式化表达；
2. 对 active runtime allowed scope 进行极窄定义（必须可审计、可回归）；
3. 对 anti-misread / regression anchors / notice wording 做强化收敛；
4. 明确表达“允许 active runtime candidate != generalized runtime capability”；
5. 对 cross-layer wording / contract / notice 一致性进行锁定；
6. 对 execution/completion/controller/orchestration/external effects 禁止边界做加强性声明。

Allowed scope 的解释规则：

- 仅允许 boundary contract 与语义锁定；
- 不允许把“allowed scope”解释为“默认开放实现”；
- 任何不在本节列举的扩展行为均视为 out-of-scope。

---

## 6. Explicitly Forbidden Scope

Phase 26 Step 1 及其默认后续阶段，以下全部禁止（除非未来新 Phase 重新立项并重新审计/锁范围）：

1. generalized execution；
2. generalized approval completion；
3. generalized workflow completion；
4. real external side effects；
5. persistence-backed audit system；
6. queue / retry / background runner；
7. async automation；
8. multi-object mutation；
9. multi-entity coordination；
10. multi-stage orchestration；
11. generalized workflow engine；
12. controller-capable rollout；
13. operator-triggered unrestricted execution path；
14. generalized capability rollout active；
15. generalized capability activation active；
16. platform-wide capability completion；
17. 任何“看似 narrow active runtime、实则打开 broader behavior”的包装。

---

## 7. Single-object Boundary Lock

即使首次允许 capability active runtime mainline，本阶段仍必须 single-object only，原因如下：

1. 当前 freeze lineage 全程建立在 single-object / bounded 语义上；
2. multi-object 会立即引入协调、顺序、部分失败、补偿、权限传播等新语义面，超出既有冻结边界；
3. batch / queue / chain / series / graph 都是 orchestration 语义载体，不属于 narrow contract-gated minimal runtime active；
4. single-object 是当前唯一可控且可回归验证的安全承接方式；
5. 一旦进入 multi-object，即构成对 Phase 25 freeze boundary 与 Phase 26 Step 1 锁定边界的直接突破。

锁定结论：**Phase 26 仅允许 single-object，不允许任何 multi-object 变体。**

---

## 8. Narrow Contract-Gated Active Runtime Boundary Lock

### 8.1 定义

first minimal capability-active runtime, narrow & contract-gated 指：

- 仅在 contract 约束下表达“active-runtime candidate 的最小语义存在”；
- 仅做可读、可判定、可审计的 narrow runtime-active boundary 描述；
- 不进入 execution / completion / controller / orchestration 语义路径。

### 8.2 与 generalized capability active 的区别

- narrow contract-gated：边界表达层、受限语义层；
- generalized capability active：能力开放层、执行控制层、系统扩张层。  
本阶段仅允许前者，明确禁止后者。

### 8.3 Allowed narrow active runtime（仅此）

- active-runtime candidate 的最小合同化语义；
- “allowed but not executed / not completed / not orchestrated”的强化表达；
- 与现有 read-only / bounded 语义的一致性锁定。

### 8.4 超界判据（出现即越界）

以下任一出现即不属于本阶段范围：

- 落入 completion path；
- 落入 controller path；
- 落入 orchestration semantics；
- 借 active-runtime 名义引入 broader implementation prewire；
- 任何可导致外部写入、自动执行或多对象联动的实现。

---

## 9. Why This Is First Allowed but Still Narrow

1. 这是首次允许 capability active runtime mainline：因为 Phase 25 已完成骨架与 non-active gap clarification，阻断点已从“能否承接”转向“能否最小受控放开主线语义”；
2. 这是现在才放开：因为此前缺少足够的 readiness-contract 冻结与 anti-misread 锚点；
3. 仍然是极窄版本：因为 execution/completion/persistence/orchestration/controller 等系统能力仍全部未开放；
4. 不可表述为 fully operational：本阶段不具备平台级执行、完成、编排、控制器与持久化闭环；
5. Candidate A 不再最优：它无法解决“是否首次允许 active-runtime mainline”的核心问题；
6. Candidate C 仍越界：它会直接打开 generalized rollout/activation 或更广能力面。

---

## 10. Deferred / Out-of-Scope Directions

以下方向统一 deferred / out-of-scope：

- Candidate A 的继续性澄清主线（不再作为 Phase 26 主线）；
- Candidate C 的广义 capability rollout/activation 主线；
- 任何 execution/completion/orchestration/controller 扩张方向；
- 任何 persistence-backed 或 external-side-effect 导向方向；
- 任何 multi-object / workflow-engine 导向方向。

---

## 11. Step 2 Entry Criteria

Step 2 进入条件（必须全部满足）：

1. Step 1 Scope Lock 文档已冻结并被视为当前唯一边界源；
2. Step 2 仅沿 Candidate B 推进，不得分叉；
3. Step 2 仍保持 single-object / bounded / design-limited / narrow / contract-gated；
4. Step 2 仅可执行：
   - 对 narrow active-runtime contract 进行最小强化；
   - 对 anti-misread clauses / notices / regression anchors 做一致性补强；
   - 对“allowed active runtime candidate != generalized capability active”做跨层固化；
5. Step 2 仍不得执行：
   - 任何 execution/completion 开放；
   - 任何 controller/orchestration 路径开放；
   - 任何 persistence/external write/automation runner 开放；
   - 任何 multi-object 或 workflow engine 扩展；
   - 任何把 Step 2 表述成 fully operational 的叙事。

结论：Step 2 若发生，也只能是 **narrow contract hardening step**，不是完整能力开发步。

---

## 12. Final Scope Lock Statement

Phase 26 Step 1 至此正式锁定：

- 唯一主线：Candidate B（First Minimal Capability-active Runtime Mainline Candidate, Narrow & Contract-Gated）；
- 本阶段属性：首次允许 capability active runtime mainline，但仅限极窄 contract-gated 边界；
- 不等于：generalized capability rollout active 已开放；
- 不等于：generalized capability activation active 已开放；
- 不等于：execution / completion / orchestration / controller 已开放；
- 不等于：平台 fully operational。

本步完成后立即停止在 Step 1，不进入 Step 2 实施。
