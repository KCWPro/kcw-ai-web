# KCW AI Platform - Phase 11 Step 5 Cross-layer Contract Regression Matrix

Date: 2026-03-20  
Branch: `work`  
Stage: Phase 11 / Step 5

## 1) 本步目标（收口与回归加固）

本步仅做一件事：
- 将 Step 2–4 的 lifecycle observability + read-only surfacing + terminology alignment 收口为最小跨层契约矩阵，并补最小回归防线。

## 2) 跨层契约涉及层

1. write result 层（`recordControlledSubmissionMutationIntent` 返回）
2. audit entry 层（`listControlledSubmissionMutationIntentAuditLog`）
3. lifecycle read model 层（`buildControlledSubmissionMutationIntentLifecycleReadModel`）
4. UI read-only surfacing 层（Decision Surface lifecycle section）
5. regression test 层（语义防漂移断言）

## 3) 固定跨层术语契约矩阵

| Source write_state | lifecycle current_stage | operator_outcome | transition_note source | semantic_boundary source | read-only notice / surfacing language |
|---|---|---|---|---|---|
| `accepted_recorded` | `accepted_for_intent_recording` | `intent_recorded_non_completion` | shared constant | shared constant | read-only only, no approve/execute/complete |
| `accepted_idempotent_replay` | `replayed_idempotently` | `idempotent_replay_non_completion` | shared constant | shared constant | read-only only, no approve/execute/complete |
| `rejected` | `blocked_by_boundary` | `rejected_non_completion` | shared constant | shared constant | read-only only, no approve/execute/complete |

Fallback 契约：
- 无 lead lifecycle audit 条目时：
  - `visibility_state = not_available`
  - `current_stage = not_available`
  - `operator_outcome = not_available`
  - `transition_note = No lifecycle audit entry is available for this lead yet.`

## 4) Forbidden language（关键层禁止词）

以下词在 lifecycle surfacing 关键层不得出现：
- `completed successfully`
- `executed successfully`
- `approval finalized`
- `workflow completed`

## 5) Anti-drift anchors（固定回归锚点）

1. accepted/replayed/rejected 三路径在 write result 与 audit/read model 映射一致。
2. transition note 与 semantic boundary 必须来自共享常量源。
3. not_available fallback 术语稳定，且不升级为 completion/execution 语义。
4. UI section 必须保持 read-only 呈现，不出现 approve/submit/execute/complete/finalize 入口。

## 6) 为什么仍属于 Route A

- 仅做 single-object lifecycle contract packaging + regression hardening。
- 不新增对象、不新增状态机、不新增控制面。
- 不改变写入判定逻辑，不引入 completion/execution。

## 7) 本步最小交付物

1. Step 5 cross-layer contract matrix 文档。
2. 最小测试补强：跨层一致性 + forbidden language + fallback 语义稳定。

## 8) 验收标准

- 矩阵可直接映射到 write/audit/read-model/UI/testing 层。
- anti-drift anchors 可被测试稳定覆盖。
- Step 2/3/4 边界不变。
- 不发生 semantic expansion。

## 9) 禁止误读条款

- regression matrix != new engine
- cross-layer contract != workflow controller
- contract hardening != semantic expansion
- matrix documentation != platform-wide audit system

