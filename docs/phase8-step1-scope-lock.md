# KCW AI Platform - Phase 8 Step 1 Scope Lock

Date: 2026-03-20
Branch: `work`
Stage: Phase 8 / Step 1 (Scope Lock)

## 0. Baseline Inheritance

本文件严格承接：
- `docs/phase7-final-freeze.md`
- `docs/phase6-final-freeze.md`
- `docs/phase8-startup-audit.md`

并继承已锁定结论：
- Phase 8 唯一主线为 `bounded persistence / controlled write-path contract design`；
- 本主线 **仅允许 design/contract 层推进**；
- 不得进入 real execution / real persistence / automation / external side effects。

---

## 1. 主线锁定

### 1.1 Selected Track (Only)

Phase 8 Step 1 唯一允许主线：

- **bounded persistence / controlled write-path contract design**

该主线的目标是：
- 先锁“写路径语义契约与边界”；
- 先锁“资格判定、失败分类、幂等/回滚边界定义”；
- 先锁“design output 与 real execution 的隔离”；
- 不做任何实际写入。

### 1.2 Explicitly Deferred / Not Advanced in Phase 8 Step 1

本阶段不推进：
- real write implementation
- approval execution
- workflow automation
- external logging / notification / webhook
- operator-triggered execution control
- persisted audit system
- system-of-record

---

## 2. 术语锁定（Terminology Lock）

### 2.1 write-path intent
- 定义：对“未来可能发生受控写入”的语义意图描述。
- 不应被误读：不代表写入已执行。
- 与 Phase 6/7 兼容：延续 `readiness != execution`、`allowed != executed`。

### 2.2 bounded persistence
- 定义：对可写边界、条件、失败语义、回退语义的受限设计范围。
- 不应被误读：不代表已经启用 DB/storage/API 写入。
- 与 Phase 6/7 兼容：与 `no persistence` 冻结边界共存；当前仅定义不落地。

### 2.3 persistence eligibility
- 定义：在 contract 语义中满足“可考虑写入设计”前提的资格状态。
- 不应被误读：`eligible` 不等于 `persisted`。
- 与 Phase 6/7 兼容：类比 `submission_ready != submitted`。

### 2.4 contract-only output
- 定义：仅用于解释/推导/对齐的契约层输出对象。
- 不应被误读：不是系统写入结果，不是执行回执。
- 与 Phase 6/7 兼容：保持 pure contract / pure derivation 模式。

### 2.5 dry-run semantic result
- 定义：假设场景下的只读语义结果（模拟判定，不执行 mutation）。
- 不应被误读：不是 committed mutation。
- 与 Phase 6/7 兼容：延续 non-executing/read-only surfacing。

### 2.6 write-precondition satisfied
- 定义：契约前置条件在语义层被满足。
- 不应被误读：不代表执行层已写入。
- 与 Phase 6/7 兼容：等价于“readiness 类语义”，不是 execution。

### 2.7 write-not-executed
- 定义：明确声明本次仅完成判定，无写入动作。
- 不应被误读：不是失败写入，而是“未执行写入”设计态。
- 与 Phase 6/7 兼容：对齐 `automation_not_implemented` 与 `submitted=false`。

### 2.8 idempotency boundary
- 定义：定义重复请求语义应如何被视为同一意图的边界规则。
- 不应被误读：不代表已在运行时强制去重。
- 与 Phase 6/7 兼容：当前仅 boundary_defined，不触发执行机制。

### 2.9 rollback boundary
- 定义：定义“如果未来执行失败，哪些状态可回退/不可回退”的边界。
- 不应被误读：不代表 rollback 引擎已实现。
- 与 Phase 6/7 兼容：当前仅 boundary_defined，不引入 side effects。

### 2.10 no persistence performed
- 定义：本轮/本输出未执行任何持久化写入。
- 不应被误读：不是“持久化成功/失败”，而是“未执行”。
- 与 Phase 6/7 兼容：完全继承 `no persistence`。

### 2.11 no external write performed
- 定义：未向外部系统（API/webhook/消息总线）产生写入。
- 不应被误读：不是外部写入成功回执。
- 与 Phase 6/7 兼容：完全继承 `no external side effects`。

### 2.12 not-a-system-of-record
- 定义：当前输出不构成正式权威记录系统。
- 不应被误读：不能用于合规落账或生产审计归档。
- 与 Phase 6/7 兼容：与 Phase 7 `audit trail != persisted production audit system` 保持一致。

---

## 3. Freeze Boundary 继承与新增

### 3.1 Inherited Boundaries (Must Keep)

- readiness != execution
- allowed != executed
- checkpoint != approval completion
- audit trail != persisted production audit system
- manual confirmation != submission
- no persistence
- no external side effects
- automation_not_implemented remains explicit

### 3.2 Phase 8 Step 1 Additional Boundaries

- persistence_eligible != persisted
- write_intent != write_executed
- dry_run != committed mutation
- contract_output != system write result
- rollback_boundary_defined != rollback_implemented
- idempotency_boundary_defined != idempotency_enforced
- write_precondition_satisfied != write_performed
- failure_taxonomy_defined != runtime_failure_handled

---

## 4. In-Scope (Phase 8 Step 1 -> Step 2 Allowable Direction)

本阶段允许后续推进（仍限 design/contract 层）：
- pure contract
- pure derivation
- precondition matrix
- failure taxonomy
- idempotency boundary definition
- rollback boundary definition
- read-only surfacing（仅在严格必要且不引入控制面的前提下）
- contract-level tests
- boundary regression tests
- 文档收口与 freeze

---

## 5. Out-of-Scope (Explicit Exclusion)

- database write
- storage write
- API writeback
- mutation handlers
- status progression
- dispatch / webhook / notification
- background job
- actual submission execution
- actual approval execution
- persisted audit logging
- external integrations

---

## 6. Forbidden Actions

Phase 8 Step 1 明确禁止：

1. 不得直接新增真实 write path。
2. 不得直接新增实际 payload dispatch。
3. 不得新增执行按钮或 workflow controls。
4. 不得把 contract 输出命名成 `executed` / `persisted` / `committed`（作为执行结果语义）。
5. 不得让 dry-run 语义暗示实际写入已发生。
6. 不得把 eligibility/precondition 语义当作 execution completion 对外呈现。
7. 不得引入任何 external side effect（含日志落地、外部通知、自动触发）。

---

## 7. Step 2 Entry Criteria

仅当以下条件全部满足，才允许进入 Phase 8 Step 2：

1. Step 1 主线锁定完成且无并行主线。
2. 术语锁定完成，且每个术语都有“非误读约束 + 与 Phase 6/7 兼容说明”。
3. inherited boundary 与新增 boundary 全部明确、无冲突。
4. in-scope / out-of-scope / forbidden actions 已可用于 code review 审查。
5. Step 2 仅允许 pure contract / pure derivation 设计项：
   - bounded persistence contract skeleton
   - write-path eligibility contract
   - failure taxonomy contract
6. Step 2 仍明确禁止真实写入实现。

---

## Step 1 Completion Statement

Phase 8 Step 1 完成即表示：
- Phase 8 唯一主线与边界已正式锁定；
- 术语误读风险已前置收敛；
- Step 2 可在不突破 Phase 6/7 freeze boundary 的前提下进入 contract skeleton 设计；
- 当前系统仍是 non-executing / non-persistent / no-side-effect 形态。
