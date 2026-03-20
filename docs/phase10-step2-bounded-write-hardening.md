# KCW AI Platform - Phase 10 Step 2 Bounded Write Hardening

Date: 2026-03-20  
Branch: `work`  
Stage: Phase 10 / Step 2

## 1) 本步目标

在 Step 1 的 single-object minimal real write 基础上，仅做 hardening：
- 收紧幂等判定
- 收紧冲突判定
- 收紧 minimal audit 字段策略
- 收紧返回结果 contract
- 用测试钉死 boundary/invariant

## 2) 与 Step 1 的承接关系

Step 2 没有新增对象、没有新增通道、没有新增执行系统。
继续沿用 Step 1 的唯一对象：`controlled_submission_mutation_intent`。

## 3) 本步硬化了什么

### 3.1 Idempotency contract 硬化

- 输入新增显式 `intent_key`。
- `intent_key` 必须满足固定格式：`intent::<lead_id>::path:<selected_path_id>::v1`。
- 只有 **同 lead + 同 key + 同核心输入 fingerprint** 才能判定为 `accepted_idempotent_replay`。
- 同 key 但核心输入不一致 => `idempotent_replay_core_input_mismatch`（reject）。
- replay 必须 `object_changed=false`。

### 3.2 Conflict contract 硬化

- 单对象约束继续保持：同一 `lead_id` 仅允许一个 recorded intent。
- 已有对象但新 key 不同 => `single_object_conflict_existing_intent_key_mismatch`（reject）。
- conflict reject 不得改写既有对象。

### 3.3 Minimal audit field policy 硬化

- audit entry 统一结构：
  - `attempt_id`
  - `intent_key`
  - `lead_id`
  - `write_state`
  - `rejection_reason`
  - `object_changed`
  - `occurred_at`
  - `boundary_note=minimal_intent_audit_only`
- 移除/不记录 actor/source，避免向 full audit persistence 风格漂移。
- accepted / replay / rejected 三类都保持同一最小结构。

### 3.4 Result contract 硬化

返回结果边界断言固定：
- `submission_completed=false`
- `approval_completed=false`
- `workflow_finished=false`
- `no_external_execution_occurred=true`
- `full_audit_persistence_system=false`

### 3.5 输入非法语义细分

新增稳定 reject reason：
- `invalid_source`
- `selected_path_id_missing`
- `invalid_intent_key_format`
- `intent_key_mismatch_with_input`

## 4) 本步没做什么

- 没有多对象写入
- 没有批量写入
- 没有跨 lead 联动
- 没有 UI/page 写权限扩张
- 没有自动提交 / 自动审批 / 工作流自动推进
- 没有外部 API 写入
- 没有 full audit persistence system
- 没有异步队列、任务系统、重试系统

## 5) 为什么仍未越界

Step 2 只在同一条 Step 1 路径上“收紧语义与约束”，没有扩大功能面。
对象、authority、边界、non-goals 均保持不变。

## 6) replay / conflict / audit 语义说明

- replay 现在是“严格 replay”，不是“宽松重复请求接受”。
- conflict 现在是“稳定可测试 reject reason”。
- audit 现在是“最小字段统一结构”，且持续 `minimal_intent_audit_only`。

## 7) 测试覆盖摘要

新增/强化覆盖：
- 严格 replay
- 伪 replay（同 key 核心输入不一致）拒绝
- 单对象冲突拒绝且原对象不变
- 审计最小字段边界
- 固定 boundary assertion 语义
- 非法输入细分 reject（actor/source/selected_path_id/intent_key）

## 8) 进入 Step 3 的前置条件

进入 Step 3 前必须继续保持：
1. 单对象边界不变。
2. 写入语义仍是 `intent_recorded`，不是 submission/approval completed。
3. 不引入 automation/external side effects/full audit persistence。
4. 任何扩展仅允许继续 hardening，不允许扩张系统边界。
