# KCW AI Platform - Phase 7 Step 3 Audit Trail Skeleton

Date: 2026-03-20
Branch: `work`
Stage: Phase 7 / Step 3 (Audit Trail Skeleton Model)

## 1. Purpose

本步目标是实现 **audit trail skeleton model**：

- 定义只读、派生式 audit trail contract；
- 定义 derived semantic audit event shape；
- 提供从 readiness/gate/checkpoint 语义到 trail/events 的 pure derivation。

本步仍属于 derived / read-only / non-persistent skeleton：

- 不是 persisted audit system；
- 不是 compliance logging platform；
- 不是 approval history database；
- 不执行 workflow；
- 无 external side effect。

## 2. Relationship to Prior Steps

### 与 Phase 6 的关系

- 复用 Phase 6 controlled submission contract 与 gate 的既有语义输入：
  - `decision_status`
  - `controlled_submission_status`
  - `controlled_submission_gate_state`
  - `manual_confirmation_received`
- 不改写 Phase 6 freeze boundary：
  - readiness != execution
  - allowed != executed
  - submission_ready != submitted

### 与 Phase 7 Step 1 的关系

- 严格遵守 Step 1 scope lock：仅推进 A 主线。
- 不引入 B/C 方向能力。

### 与 Phase 7 Step 2 的关系

- 直接消费 Step 2 `approval checkpoint contract` 作为输入。
- 将 checkpoint 结果映射为 derived semantic events。
- 不把 checkpoint contract 升级为 approval execution 流程。

## 3. Trail Model

实现文件：`lib/auditTrailSkeleton.ts`

`buildAuditTrailSkeleton(input)` 输出 `AuditTrailSkeleton`，包含：

- `trail_version`: `phase7-step3-audit-trail-skeleton-v1`
- `trail_id` / `trail_label`
- `events[]`
- `event_count`
- `latest_state_hint`
  - `review_focus`
  - `read_only_alignment`
  - `eligibility_outside_scope`
- `summary`
  - `note`
  - `checkpoint_summary`
  - `readiness_gate_summary`
- `boundary_flags`
  - `derived_only=true`
  - `read_only=true`
  - `non_executing=true`
  - `non_persistent=true`
  - `persistence_performed=false`
  - `external_write_performed=false`
  - `system_of_record=false`
  - `compliance_audit_platform=false`
  - `submitted=false`
  - `executed=false`

## 4. Event Model

`AuditTrailSkeletonEvent` 字段：

- `event_key`
- `category`
- `title`
- `description`
- `derived_from`
- `derived_marker`（`derived_seq_n`，仅派生序号，不是持久化 timestamp）
- `state`（`observed | review_oriented | boundary_only`）
- `visible`
- `boundary_note`

event category：

- `path_selected`
- `readiness_evaluated`
- `gate_evaluated`
- `manual_confirmation_state_observed`
- `checkpoint_contract_built`
- `boundary_asserted`

语义边界：

- 所有 event 均为 derived semantic events；
- 不代表 external persisted record；
- 不代表 compliance-ready audit artifact；
- 不代表 execution history。

## 5. Derivation Rules

pure derivation（同步、无副作用）规则：

1. 基于 `selected_path_category` 生成 `path_selected` 事件。
2. 基于 `decision_status + controlled_submission_status` 生成 `readiness_evaluated` 事件。
3. 基于 `controlled_submission_gate_state` 生成 `gate_evaluated` 事件。
4. 基于 `manual_confirmation_received` 生成 `manual_confirmation_state_observed` 事件。
5. 基于 `approval_checkpoint_contract.summary/mode` 生成 `checkpoint_contract_built` 事件。
6. 固定生成 `boundary_asserted` 事件，持续强调 non-persistent/non-executing 边界。
7. 通过 path eligibility + review-oriented event presence 推导 `latest_state_hint`。

非持久化声明：

- 本模型不写 DB；
- 不写文件；
- 不发远程日志；
- 不声明 system-of-record。

## 6. Non-Goals

本步不做：

- 真实审计系统
- 落库
- 日志管道 / event bus
- 通知 / dispatch / webhook
- approval execution / submission execution
- 自动化状态迁移
- 外部副作用

## 7. Test Coverage

新增：`tests/auditTrailSkeleton.test.ts`

覆盖点：

- trail 生成成功且明确 non-persistent
- events 为 derived semantic events（含 `derived_seq_n` marker）
- readiness/gate/manual confirmation/checkpoint 变化仅影响派生语义
- blocked/risk 场景出现 review-oriented / boundary-oriented event
- 输出不包含 executed/submitted/persisted/completed_workflow 越界语义
- 与 readiness/gate/checkpoint 语义保持兼容

## 8. Conclusion

Step 3 新增：

- 一个纯函数、只读、非持久化的 audit trail skeleton model；
- 一个可供 Step 4 read-only surfacing 消费的数据契约（events + summary + boundary flags）。

Step 3 仍未新增：

- 持久化审计系统
- 合规审计平台
- execution/approval/submission automation
- external write / notification / side effects
