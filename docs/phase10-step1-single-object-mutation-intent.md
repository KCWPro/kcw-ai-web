# KCW AI Platform - Phase 10 Step 1 Single-Object Mutation Intent

Date: 2026-03-20  
Branch: `work`  
Stage: Phase 10 / Step 1

## 1) 本步目标

在 Phase 9 readiness/contract/gate/checkpoint/audit skeleton 基线之上，落地首个最小真实写入能力：

- 单对象：`controlled_submission_mutation_intent`
- 单入口：`recordControlledSubmissionMutationIntent(...)`
- 单边界：仅记录 intent，不推进 submission completed，不推进 approval completed，不触发 external execution。

## 2) 做了什么

### 2.1 新增 single-object mutation intent contract + minimal write helper

新增文件：`lib/controlledSubmissionMutationIntent.ts`

新增核心内容：
- 单对象模型 `ControlledSubmissionMutationIntentRecord`
- 单对象写入函数 `recordControlledSubmissionMutationIntent`
- in-memory single-object store（按 lead_id 单对象约束）
- minimal intent audit log（`minimal_intent_audit_only`）
- idempotent replay（同一 intent_key 返回 `accepted_idempotent_replay`）

### 2.2 强制前置约束（gate/readiness/checkpoint/boundary）

写入前依次校验：
1. lead 存在
2. actor_id 合法
3. Phase 9 readiness hardening boundary 未漂移
4. controlled submission contract = `submission_ready`
5. controlled submission gate = `allowed`
6. approval checkpoint summary = `checkpoint_ready_for_review`
7. audit trail skeleton latest hint = `read_only_alignment`
8. bounded write-path contract = `dry_run_only`

只有全部满足，才允许记录 mutation intent。

### 2.3 新增测试

新增文件：`tests/controlledSubmissionMutationIntent.test.ts`

覆盖点：
- 正向：满足 gate/readiness/checkpoint/boundary 时写入成功，状态为 `intent_recorded`
- 幂等：同 key 重放返回 `accepted_idempotent_replay`，对象不再变化
- 拒绝：lead 不存在、gate 不满足、readiness 不满足、输入越界（actor_id 空）
- 拒绝：同 lead 尝试写入第二个不同 intent key（单对象冲突）
- 边界：输出不得出现 submission completed / approval completed / workflow finished / external execution succeeded 语义

## 3) 没做什么

- 没有实现 submission completed
- 没有实现 approval completed
- 没有实现多对象写入
- 没有实现跨系统写回
- 没有实现自动化执行、队列、重试系统
- 没有给 UI/page 层赋 write authority
- 没有把 audit skeleton 扩张为完整持久化审计平台

## 4) 为什么没有越界

1. 写入对象严格单一：只允许 `controlled_submission_mutation_intent`。
2. 写入语义严格受限：`intent_recorded` != `submission_completed`。
3. checkpoint 仍是 review boundary，不是 approval completion。
4. audit 仅为 minimal intent audit log + skeleton alignment，不是 full audit persistence system。
5. 保持无 external write、无 external side effects、无 automation。

## 5) 写入边界说明

本步真实写入发生在：
- `controlled_submission_mutation_intent` in-memory store（keyed by `lead_id`）

本步明确会变化的字段：
- intent_id / intent_key / recorded_at / actor_id / source
- contract snapshot（controlled submission + gate + checkpoint + audit + bounded write status）

本步明确不会变化的语义：
- lead status 不会自动推进
- submission 不会被标记为 completed
- approval 不会被标记为 completed
- 不会触发 follow-up actions / downstream workflow

## 6) 状态语义说明

允许状态：
- `accepted_recorded`
- `accepted_idempotent_replay`
- `rejected`

intent 记录状态只允许：
- `intent_recorded`

明确禁止语义：
- submission completed
- approval completed
- workflow finished
- external execution succeeded

## 7) 测试覆盖摘要

- 正向写入：通过
- 幂等重放：通过
- 非法对象/输入：通过
- gate/readiness 拒绝：通过
- 单对象冲突拒绝：通过
- 边界语义防误读断言：通过

## 8) Step 2 前置条件

进入 Phase 10 Step 2 前必须满足：
1. Step 1 单对象边界不变（不得引入第二对象）。
2. write authority 继续保持在受控 helper 层，UI/page 仍无写权限。
3. 继续保持 intent-recorded 语义，不得升级为 submission/approval completed。
4. 若扩展实现，仅允许在单对象内部完善可靠性（例如更明确的 idempotency/audit 字段），不得扩张到多对象、多系统、自动化。
