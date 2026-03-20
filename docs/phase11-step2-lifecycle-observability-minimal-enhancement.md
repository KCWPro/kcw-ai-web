# KCW AI Platform - Phase 11 Step 2 Lifecycle Observability Minimal Enhancement

Date: 2026-03-20  
Branch: `work`  
Stage: Phase 11 / Step 2

## 1) 承接与边界

- 严格承接 Phase 10 Final Freeze + Phase 11 Step 1 Scope Lock。
- 唯一主线保持 Route A：single-object `controlled_submission_mutation_intent` 生命周期可观测性增强。
- Route B / Route C 继续 deferred / out-of-scope。

本步明确不做：
- submission completed / approval completed / workflow completed
- actual external execution / external write
- full persistence / full audit storage
- multi-object orchestration / generalized workflow engine
- irreversible production write path

## 2) 本步问题定义

Phase 10 已具备 `accepted_recorded` / `accepted_idempotent_replay` / `rejected` 三态与 reject taxonomy，
但 operator-facing 生命周期可观测表达仍偏“结果态代码值”，缺少统一的“阶段 + 语义边界”可读模型。

因此 Step 2 仅补最小 observability 增强：
- 将既有 write result 映射为稳定 lifecycle stage；
- 补 operator outcome 与 transition note；
- 在结果与最小 audit 条目中同步暴露 non-completion semantic boundary；
- 保持现有写入边界、对象边界与 non-executing 语义不变。

## 3) 新增的生命周期可观测性定义（最小闭环）

### 3.1 lifecycle stage（新增）
- `accepted_for_intent_recording`
- `replayed_idempotently`
- `blocked_by_boundary`

### 3.2 operator outcome（新增）
- `intent_recorded_non_completion`
- `idempotent_replay_non_completion`
- `rejected_non_completion`

### 3.3 transition note（新增）
- 对每个 stage 提供简短过渡说明，帮助 operator 解读“为何进入该可观测阶段”。

### 3.4 semantic boundary（新增）
显式固定以下断言，防止语义偷跑：
- lifecycle visibility != completion
- lifecycle stage != external execution
- observable transition != approval finalized
- status expression != workflow fully completed
- internal mutation state != durable audit history

## 4) 为什么仍属于 Route A（不是 Route B/C）

- 仅增强 single-object intent 结果可读性，不引入 completion/execution 功能。
- 不新增对象，不新增跨 workflow 编排，不引入 generalized engine。
- 不引入 persistence 升级，不引入 external side effect。
- 仅在当前 helper 与最小 audit 可见层补充可断言表达。

## 5) 代码改动摘要

1. 在 `controlledSubmissionMutationIntent` 写入结果中新增 `lifecycle_visibility`：
   - `model_version`
   - `current_stage`
   - `operator_outcome`
   - `transition_note`
   - `semantic_boundary`
2. 在最小 audit entry 中新增：
   - `lifecycle_stage`
   - `operator_outcome`
3. 增加统一映射函数，将既有 `write_state` 映射为 lifecycle visibility。
4. 不改变既有 write acceptance/rejection 核心判定路径，不改变 boundary_assertion 固定值。

## 6) 本步没做什么

- 没有新增 completed/finalized/executed/submitted 成功态。
- 没有把 accepted/replayed 解释为流程完成。
- 没有增加 approval action 或 execution action。
- 没有实现 durable audit history。
- 没有增加数据库/外部系统写入。

## 7) 验收标准（Step 2）

1. `accepted_recorded`/`accepted_idempotent_replay`/`rejected` 均有可断言 lifecycle stage。
2. lifecycle 表达中必须持续出现 non-completion 断言。
3. replay/conflict/rejection 不得出现 completion/execution 误读词义。
4. 原有 Phase 10 边界断言继续成立。

## 8) 明确禁止误读条款

- `accepted_for_intent_recording` 不是 submission completed。
- `replayed_idempotently` 不是 workflow completed。
- `blocked_by_boundary` 不是 approval finalized。
- `operator_outcome` 是语义可读层，不是执行状态机终态。
- `minimal_intent_audit_only` + lifecycle 字段仍不是 durable audit platform。

## 9) 最小验证结果

- 通过 TypeScript 类型检查。
- 通过 `controlledSubmissionMutationIntent` 重点语义测试：
  - lifecycle stage/outcome 映射正确；
  - non-completion boundary 断言稳定；
  - audit lifecycle 字段覆盖 accepted/replay/rejected。

