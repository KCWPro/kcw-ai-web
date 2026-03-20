# KCW AI Platform - Phase 9 Step 2 Readiness Policy Matrix

Date: 2026-03-20  
Branch: `work`  
Stage: Phase 9 / Step 2 (Readiness Policy Matrix & Contract Drafting)

## 1. Background

本文件严格承接：
- `docs/phase9-startup-audit.md`
- `docs/phase9-step1-scope-lock.md`
- Phase 8 Final Freeze 与 Phase 6/7 freeze boundaries

本步目标：
- 把 future bounded real write 之前必须具备的 readiness policy/matrix/contract draft 细化为可审查产物。

本步仍然不是 live implementation：
- 不实现真实 bounded write path
- 不实现 DB/storage mutation
- 不实现 API writeback
- 不实现 execution controls / workflow automation / external side effects

---

## 2. Selected Track (Only)

Phase 9 唯一主线（继续有效）：

- **Implementation Readiness for Bounded Write Path**

本步明确不做：
- real write implementation
- commit handlers / route writeback
- UI write/execute/submit controls
- persisted audit implementation

---

## 3. Minimal Write Object Candidate Review

### Candidate A: Lead status direct mutation object
- 对象候选：`lead_status_update`（直接更新 lead status）。
- 优点：路径最短、实现简单。
- 风险：
  - 直接触碰 system-of-record 字段，误操作影响面大；
  - 与当前 decision/readiness 语义层耦合不足，跳过中间意图层。
- 结论：不推荐作为 first bounded real write。

### Candidate B: Controlled submission mutation intent record（推荐）
- 对象候选：`controlled_submission_mutation_intent`。
- 最小字段候选：
  - `mutation_intent_id`
  - `lead_ref`
  - `selected_path_id`
  - `intent_type`（`bounded_submission_intent`）
  - `intent_version`
  - `precommit_snapshot_ref`
  - `idempotency_key`
  - `declared_by_actor_type`
- 优点：
  - 与 Phase 6/7/8 的 readiness/checkpoint/trail/contract 语义一致；
  - 先落“意图对象”而非“最终业务状态”，风险可控；
  - 有利于未来 idempotency、rollback/recovery、audit 最小模型对齐。
- 风险：需要明确与未来 commit authority 层的职责拆分。
- 结论：**推荐唯一候选**。

### Candidate C: External writeback payload object
- 对象候选：面向外部系统的 writeback payload。
- 优点：可直接对接外部流程。
- 风险：
  - 过早引入 external side effects；
  - 与当前 freeze 边界冲突风险最高；
  - 失败与恢复复杂度过高。
- 结论：不推荐，延后到独立立项阶段。

### 推荐唯一候选结论

- 推荐：**Candidate B (`controlled_submission_mutation_intent`)**。
- 原因：最符合“先 bounded intent、后 bounded commit”的 readiness 路径。
- 边界声明：该对象当前仍是 **readiness-defined**，不是 **implementation-permitted**。

---

## 4. Source-of-Truth Matrix

| Layer | Current role | Future possible role | Can hold write authority? | Explicitly forbidden now? |
|---|---|---|---|---|
| UI/page layer (`app/internal/leads/[id]/page.tsx`) | read-only orchestration & rendering | display intent/audit previews | No | Yes |
| Decision Surface / derived semantic layer | read-only semantic surfacing | show lifecycle/audit semantics | No | Yes |
| Contract layer (`lib/*Contract.ts`) | pure contract/derivation | precommit policy evaluation input | No direct commit | Yes |
| Route/service layer (future scoped) | not used for mutation | host guarded mutation-intent intake | **Future: maybe intent-level authority only** | Yes (for current phase) |
| Future commit authority layer | not implemented | isolated bounded commit authority | **Future: yes (single authority owner)** | Yes (currently absent) |
| System-of-record layer | read via existing store path | eventual source-of-truth update target | No direct authority in Phase 9 | Yes |

Source-of-truth readiness conclusion：
- readiness 阶段锁定 “future SoT 需单一权威写入层更新”；
- 当前阶段不发生 record update。

---

## 5. Write Authority Matrix

| Capability | Owner (current) | Owner (future design target) | Current state |
|---|---|---|---|
| Define mutation intent | none | guarded service boundary | readiness-defined only |
| Validate precommit readiness | contract layer (pure evaluation) | contract + guarded service check | non-executing |
| Declare commit eligibility | contract/policy layer | authority gate decision layer | design-only |
| Execute commit | none | future commit authority layer only | not implemented |
| Must never commit | page/UI, Decision Surface, derived contracts | unchanged | explicitly forbidden |

Authority boundary lock：
- `authority_defined != authority_granted_to_ui`
- UI/page 永不持有 commit authority。

---

## 6. Mutation Lifecycle Contract

### 6.1 Lifecycle states (design-time contract only)

1. `intent_defined`
2. `precommit_validated`
3. `commit_eligible`
4. `commit_attemptable`
5. `commit_succeeded`
6. `commit_failed`
7. `recovery_required`
8. `rolled_back`
9. `non_recoverable`

### 6.2 Transition intent (design semantics)

- `intent_defined -> precommit_validated`
- `precommit_validated -> commit_eligible | commit_failed`
- `commit_eligible -> commit_attemptable`
- `commit_attemptable -> commit_succeeded | commit_failed`
- `commit_failed -> recovery_required | non_recoverable`
- `recovery_required -> rolled_back | commit_succeeded | non_recoverable`

### 6.3 Boundary notes

- `lifecycle_defined != mutation_executed`
- `commit_eligible != commit_executed`
- `commit_succeeded` 是 future runtime state 名称预留，不代表当前系统已具备该执行能力。

### 6.4 Current not-implemented notes

当前未实现：
- mutation runtime engine
- commit orchestration
- rollback/recovery runtime executor
- lifecycle persistence

---

## 7. Policy Matrix

> 所有策略仅为 design-time handling policy；不是 runtime enforcement/recovery。

| Scenario | Design-time handling policy | Still not implemented |
|---|---|---|
| duplicate intent | 同 `idempotency_key + target_record_ref + intent_type + intent_version` 视为同一 intent，不进入新的 commit attempt | runtime dedupe store/enforcement |
| repeated request | 若 request fingerprint 相同则返回同一 lifecycle reference，禁止推进新状态 | request replay handler |
| precommit validation drift | 从 `precommit_validated` 回退到 `intent_defined` 并标记 drift reason | drift detector/runtime revalidation job |
| commit timeout | 状态进入 `commit_failed` + reason=`timeout_pending_resolution`，转 `recovery_required` | timeout monitor + compensating workflow |
| ambiguous commit outcome | 标记 `recovery_required` + `outcome=ambiguous`，禁止自动重试 commit | authoritative reconciliation executor |
| post-commit desync | 标记 `recovery_required`，要求 SoT reconciliation 决策 | SoT sync runtime |
| partial persistence success | 归类 `commit_failed_partial`，必须进入 recovery policy path | partial rollback engine |
| recovery required | 仅允许进入 predefined recovery strategy（manual/rollback/reconcile） | recovery execution runtime |
| rollback path | 仅对 rollback-eligible 状态允许 `rolled_back` 目标 | rollback runtime engine |
| non-recoverable | 显式终态 `non_recoverable` + operator escalation required | escalation automation |

Policy boundary lock：
- `idempotency_strategy_defined != idempotency_enforced`
- `rollback_boundary_defined != rollback_implemented`
- `recovery_policy_defined != recovery_executed`
- `partial_failure_policy_defined != runtime_failure_handled`

---

## 8. Minimal Persisted Audit Model Draft

### 8.1 Field list (minimum)

1. `mutation_intent_id`
2. `target_record_ref`
3. `write_object_type`
4. `source_of_truth_ref`
5. `authority_actor_type`
6. `lifecycle_state`
7. `idempotency_key`
8. `created_at_semantic`
9. `observed_at_semantic`
10. `recovery_status`
11. `boundary_flags`
12. `policy_version`
13. `contract_version`

### 8.2 Field purpose (summary)

- identity: `mutation_intent_id`, `target_record_ref`, `write_object_type`
- ownership/authority: `source_of_truth_ref`, `authority_actor_type`
- state traceability: `lifecycle_state`, `recovery_status`
- dedupe/replay controls: `idempotency_key`
- semantic timing: `created_at_semantic`, `observed_at_semantic`
- safety guardrail evidence: `boundary_flags`, `policy_version`, `contract_version`

### 8.3 Boundary note

- 此处仅定义 **minimal audit contract**；
- 不是 production audit platform 设计全量方案；
- 更不是 persisted audit implementation。

### 8.4 Why this is minimum

本最小集只覆盖 future bounded real write 的最小可追溯需求：
- who/what/when/which intent/which lifecycle/which boundary/policy version。

它不覆盖：
- 合规平台全量字段
- 跨系统归档策略
- 长期 retention/analytics 需求

---

## 9. Step 3 Entry Criteria

仅当以下条件全部满足，才允许进入 Phase 9 Step 3：

1. minimal write object 推荐唯一候选已冻结（含 reject rationale）。
2. source-of-truth matrix 已冻结，且 authority owner 边界无冲突。
3. write authority matrix 已冻结，且 UI/page 永不持有 commit authority 已明确。
4. mutation lifecycle contract 已冻结（state + transition + boundary notes）。
5. policy matrix 已冻结（idempotency/rollback/recovery/partial-failure/ambiguous outcome）。
6. minimal persisted audit model draft 已冻结。
7. 全文术语保持 readiness-defined，不漂移为 implementation-permitted。
8. 与 Phase 8 Final Freeze / Phase 9 Step 1 无冲突。
9. 仍然保持 no mutation / no external write / no execution control。

---

## 10. Conclusion

Step 2 完成意味着：
- readiness policy/matrix/contract draft 已达到可审查、可冻结的结构化状态；
- Step 3 可在不触发真实写入实现的前提下，继续推进 contract hardening 与 guardrail planning。

当前仍未得到的 permission：
- 未获得 live write implementation permission
- 未获得 DB/storage/API mutation permission
- 未获得 execution control/workflow automation permission
- 未获得 persisted audit implementation permission

为什么本步不突破 freeze boundary：
- 产物仅为文档化 matrix/contract draft；
- 无 runtime mutation path、无 handler、无 writeback、无 external side effects；
- 全文持续声明 `defined != executed` 与 `readiness-defined != implementation-permitted`。
