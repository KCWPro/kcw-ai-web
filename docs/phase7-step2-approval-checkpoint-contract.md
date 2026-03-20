# KCW AI Platform - Phase 7 Step 2 Approval Checkpoint Contract

Date: 2026-03-20
Branch: `work`
Stage: Phase 7 / Step 2 (Approval Checkpoint Contract Skeleton)

## 1. Purpose

本步目标是实现 **approval checkpoint contract skeleton**（纯契约 + 纯推导）：

- 提供 approval checkpoint 的只读语义模型；
- 提供基于现有 decision surface / controlled submission contract 的同步推导；
- 输出 checkpoint 可见性、状态、依赖摘要与非执行边界提示。

本步仍属于 non-executing skeleton：

- 不执行审批动作；
- 不触发 submission；
- 不执行写入；
- 不产生 external side effect。

## 2. Relationship to Prior Phases

### 与 Phase 6 的关系

- Step 2 仅复用并解释 Phase 6 的既有语义输入（readiness status / gate state / decision status / manual confirmation signal）。
- Step 2 不替代 manual confirmation gate，不改写 controlled submission contract。
- Step 2 保持以下 freeze-compatible boundaries：
  - readiness != execution
  - allowed != executed
  - submission_ready != submitted

### 与 Phase 7 Step 1 的关系

- 完全遵循 Step 1 scope lock：仅推进 A 主线（approval checkpoint skeleton）。
- B/C 仍 deferred / out-of-scope。
- 所有输出均以 read-only / non-executing 为前缀语义。

## 3. Contract Shape

实现文件：`lib/approvalCheckpointContract.ts`

`buildApprovalCheckpointContract(input)` 输出 `ApprovalCheckpointContract`，核心结构：

- `contract_version`: `phase7-step2-approval-checkpoint-v1`
- `mode`: `read_only_non_executing_skeleton`
- `checkpoints[]`：checkpoint 列表
  - `key`：checkpoint 标识
  - `label` / `description`
  - `visible`
  - `state`
  - `rationale`
  - `dependency_summary`
  - `non_executing_notice`
- `summary`
  - `overall_state`: `checkpoint_unavailable | checkpoint_review_required | checkpoint_ready_for_review`
  - `note`
- `compatibility_assertions`
  - `readiness_is_not_execution: true`
  - `checkpoint_is_not_approval_completion: true`
  - `manual_confirmation_is_not_approval_completion: true`
  - `gate_allowed_is_not_execution: true`
- `execution_boundary`
  - `approval_completion_state: not_completed`
  - `approval_actions_available: false`
  - `submission_triggered: false`
  - `executed: false`
  - `external_side_effects: none`
  - `persistence_performed: false`
  - `automation_not_implemented: true`

## 4. State Semantics

checkpoint state 仅允许：

- `unavailable`
- `available_for_review`
- `review_required`
- `conditionally_ready`
- `not_applicable`

语义限制：

- `conditionally_ready` 表示“语义条件接近完整，可读审查”；**不表示 approval completed**。
- 任何 state 都不代表 submitted / executed。
- 不输出 approved/granted/completed 作为执行结果语义。

## 5. Derivation Rules

推导为 pure function，同步、无副作用：

1. `selected_path_category != human_confirmed_path`：
   - manual confirmation checkpoint -> `unavailable`
   - readiness alignment checkpoint -> `not_applicable`
2. blocked/risk/gate blocked：
   - readiness alignment checkpoint -> `review_required`
3. `submission_ready + gate=allowed + decision_status=ready_for_manual_progress`：
   - readiness alignment checkpoint -> `conditionally_ready`
4. 其余可评估场景：
   - checkpoint 维持 `available_for_review`
5. boundary checkpoint：
   - 常驻可见，用于持续声明 non-executing/read-only/no-side-effect。

## 6. Non-Goals

本步明确不做：

- 真实 approval grant / approve action
- 真实 approval request dispatch
- submission execution
- persistence / DB / API writeback
- notification / task dispatch / background job
- audit persistence system
- operator-triggered execution controls
- external side effects

## 7. Test Coverage

新增：`tests/approvalCheckpointContract.test.ts`

覆盖关键场景：

- checkpoint unavailable（非 human_confirmed_path）
- checkpoint available but non-executing
- readiness exists but != approval completion
- manual confirmation exists but != approval completion
- blocked/risk -> review_required
- execution/persistence/side-effect 边界保持 false/none

并复测 Phase 6 相关契约测试：

- `tests/controlledSubmissionGate.test.ts`
- `tests/controlledSubmissionContract.test.ts`
- `tests/internalDecisionSurfaceSection.test.tsx`

## 8. Conclusion

Step 2 新增能力：

- 一个可测试、可复用、纯函数化的 approval checkpoint contract skeleton；
- 一个 freeze-compatible 的 checkpoint 语义层，可供后续 Step 3（audit trail skeleton model）承接。

Step 2 明确仍未新增：

- approval execution
- submission execution
- persistence / write path
- notification / automation / external side effects
