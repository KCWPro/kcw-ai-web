# KCW AI Platform - Phase 12 Step 4 Wording Consistency Hardening (Candidate A Only)

Date: 2026-03-20  
Branch: `work`  
Stage: Phase 12 / Step 4

## 1) Step 4 最小实现提案（单闭环）

本步只选一个最小闭环：

- **将 lifecycle read-only boundary notice 收敛为 shared canonical wording source，并在 read-model/UI 统一消费，同时补强回归断言。**

选择原因：
1. 纯语义层 hardening（不涉及 capability 扩张）。
2. 直接降低 domain/read-model/UI 三层文案漂移风险。
3. 可在 single-object 范围内完成最小、可审计、可回归闭环。

---

## 2) 本步实际落地

1. 在 `controlledSubmissionMutationIntent` 新增共享常量：
   - `CONTROLLED_SUBMISSION_MUTATION_INTENT_LIFECYCLE_BOUNDARY_NOTICE_LINES`
2. 在 lifecycle read model 增加 `boundary_notice_lines`，并对 visible / not_available 两分支统一透传。
3. 在 Decision Surface lifecycle 区块改为渲染 `readModel.boundary_notice_lines`，不再使用分散硬编码文案。
4. 在 cross-layer 测试中新增 `boundary_notice_lines` 一致性断言，锁定 canonical wording 不漂移。

---

## 3) 本步明确没做什么

- 没有新增 approve / execute / finalize / complete 入口。
- 没有新增 completion/execution 运行时状态。
- 没有新增真实执行逻辑。
- 没有新增 external side effects。
- 没有新增 persistence expansion / durable audit platform。
- 没有新增 multi-object orchestration / generalized workflow engine。
- 没有新增 workflow completed 类状态。
- 没有扩大 UI write authority。

---

## 4) 为什么没有越界

1. 变更仅限 shared wording source + read-only surfacing + regression anchors。
2. 无任何写入权限、执行入口、完成态语义扩张。
3. single-object、non-execution、non-completion、read-only 边界持续成立。

继续保持：
- lifecycle visibility != completion
- read-only surfacing != execution trigger
- terminology alignment != semantic expansion
- regression hardening != generalized workflow engine
- handoff readiness != workflow executed
- intent recorded != submission completed
- replayed idempotently != workflow completed
- blocked by boundary != approval finalized

---

## 5) Step 4 结论

- 是否完成：**yes**
- 当前阶段：**Phase 12 - Step 4**
- 唯一主线：**Candidate A / single-object, non-execution, non-completion semantic hardening**
- 是否允许进入 Step 5：**yes（有条件）**
- Step 5 只允许范围：
  - 继续 Candidate A 内 bounded semantic hardening（wording consistency、anti-drift regression strengthening、read-only boundary wording packaging）；
  - 禁止 completion/execution/multi-object/workflow expansion。
