# KCW AI Platform - Phase 12 Step 3 Anti-drift Strengthening (Candidate A Only)

Date: 2026-03-20  
Branch: `work`  
Stage: Phase 12 / Step 3

## 1) Step 3 最小实现提案（单闭环）

本步只选一个最小闭环：

- **将高风险“伪成功语义”做成 shared canonical source，并让 domain/read-model/UI 回归测试统一引用该 source。**

为什么选它：
1. 属于 Candidate A 的 anti-drift regression strengthening。
2. 不新增能力，仅增强“难被误读、难被改坏”的保护层。
3. 可形成单对象、跨层一致、可回归的最小闭环。

---

## 2) 本步实际落地

1. 在 `controlledSubmissionMutationIntent` 增加共享常量：
   - `CONTROLLED_SUBMISSION_MUTATION_INTENT_FORBIDDEN_SUCCESS_PHRASES`
2. 增加共享函数：
   - `buildControlledSubmissionMutationIntentForbiddenSuccessPattern()`
3. 将以下测试改为引用共享 pattern，而不是散落正则：
   - `tests/controlledSubmissionMutationIntent.test.ts`
   - `tests/controlledSubmissionMutationIntentLifecycleSurfacing.test.ts`
   - `tests/lifecycleCrossLayerContractMatrix.test.ts`
   - `tests/internalDecisionSurfaceSection.test.tsx`

结果：forbidden-language anti-drift 由“分散字符串”升级为“共享语义源 + 跨层统一校验”。

---

## 3) 本步明确没做什么

- 没有新增 approve/execute/finalize/complete 入口。
- 没有新增 completion/execution 运行时状态。
- 没有新增真实执行逻辑或 external side effects。
- 没有新增 persistence expansion / durable audit platform。
- 没有新增 multi-object orchestration / generalized workflow engine。
- 没有扩大 UI write authority。

---

## 4) 为什么没有越界

1. 本步只做术语与回归护栏聚合（shared terminology + anti-drift tests），没有引入 capability surface。
2. 变更范围限定在 single-object `controlled_submission_mutation_intent` 语义层与测试层。
3. 所有输出继续保持 non-execution / non-completion / read-only。

边界继续成立：
- lifecycle visibility != completion
- read-only surfacing != execution trigger
- terminology alignment != semantic expansion
- regression hardening != generalized workflow engine
- handoff readiness != workflow executed
- intent recorded != submission completed
- replayed idempotently != workflow completed
- blocked by boundary != approval finalized

---

## 5) Step 3 结论

- 是否完成：**yes**
- 当前阶段：**Phase 12 - Step 3**
- 唯一主线：**Candidate A / single-object, non-execution, non-completion semantic hardening**
- 是否允许进入 Step 4：**yes（有条件）**
- Step 4 只允许范围：
  - 继续 Candidate A 内 bounded semantic hardening（shared wording consistency、anti-drift regression anchors、read-only boundary wording hardening）；
  - 禁止 completion/execution/multi-object/workflow expansion。
