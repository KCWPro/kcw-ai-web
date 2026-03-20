# KCW AI Platform - Phase 7 Step 1 Scope Lock

Date: 2026-03-20
Branch: `work`
Stage: Phase 7 / Step 1 (Scope Lock)

## 1. Context

- 本文档严格承接：
  - `docs/phase6-final-freeze.md`
  - `docs/phase7-startup-audit.md`
- Phase 6 已冻结为 non-executing infrastructure，并明确 execution / persistence / approval workflow / audit trail system 均未上线。
- Phase 7 Startup Audit 已完成单主线选择，本步仅做正式范围锁定（scope lock），不是功能实现。

## 2. Selected Track

Phase 7 Step 1 唯一允许主线：

- **A: approval checkpoints / audit trail skeleton**

明确 deferred / out-of-scope：

- **B: execution-safe write path design**
- **C: controlled submission 的下一步受限落地（执行侧）**

Step 1 不重新讨论 A/B/C 取舍，不并行推进多主线。

## 3. Objective

本阶段 A 主线目标（仅定义，不执行）：

1. 锁定 approval checkpoint skeleton 的语义与契约：
   - 仅定义 checkpoint 的状态表达与判断输入/输出。
   - 不触发真实审批动作，不触发流程推进。
2. 锁定 audit trail skeleton 的语义与契约：
   - 仅定义 audit event 结构与只读可视化来源。
   - 不落生产持久化审计系统，不引入合规系统承诺。
3. 明确其仍属于 non-executing infrastructure：
   - 无提交执行、无外部副作用、无写入路径。
4. 明确与 Phase 6 contract 关系：
   - checkpoint / audit skeleton 只能建立在 Phase 6 readiness/gate/confirmation 之上做“解释层增强”；
   - 不得改变 Phase 6 frozen semantics：`human_confirmed_path != manual_confirmation_received`、`submission_ready != submitted`、`allowed != executed`。

## 4. Contract Boundaries

Phase 7 Step 1 强制 freeze-compatible contract：

1. `human confirmation != approval completion`
2. `readiness != execution`
3. `allowed != executed`
4. `checkpoint presence != approval granted`
5. `audit trail record != persisted production audit system`
6. `audit surfacing != compliance system`
7. `skeleton != live workflow engine`

补充强制语义：

- `approval_requested` 不是 `approval_granted`。
- `approval_available` 不是 `approval_granted`。
- `submission eligibility` 不是 `submission executed`。
- 任何 checkpoint/audit 输出都不代表真实外部 side effect 已发生。

## 5. In-Scope

Phase 7 Step 1 仅允许以下最小范围：

- A 主线术语锁定（checkpoint / audit / non-executing / read-only）。
- A 主线 contract boundary 声明与兼容性声明（对齐 Phase 5/6 freeze）。
- approval checkpoint skeleton 的模型层边界定义（文档层）。
- audit trail skeleton 的模型层边界定义（文档层）。
- implementation guardrails（后续实现禁止项）声明。
- Step 2 entry criteria 正式化。
- 文档收口与可回溯说明。

## 6. Out-of-Scope

本阶段明确不做（禁止进入）：

- submission execution
- persistence / database
- external API writeback
- approval workflow automation
- background jobs / schedulers
- notifications（短信/邮件/IM/电话）
- operator-triggered execution actions
- irreversible actions
- rollback engine
- permission/compliance system rollout
- B / C 方向全部实现内容

## 7. Terminology Lock

为避免被误读为 live system，本阶段术语固定如下：

- **checkpoint**：只读审批关卡定义项，不代表审批已发生。
- **approval_requested**：存在审批请求语义，不代表审批系统已执行请求。
- **approval_available**：具备进入审批判断的条件，不代表已批准。
- **approval_granted**：仅作为未来状态名保留；Step 1 不实现真实授予流程。
- **audit_trail**：可追溯事件语义集合，不等于持久化审计平台。
- **audit_event**：语义事件单元，可用于解释，不承诺写入生产审计库。
- **readiness**：就绪判断，不等于执行。
- **submission_eligibility**：提交资格判断，不等于提交已发生。
- **non-executing**：无执行、无写入、无外部副作用。
- **skeleton**：结构占位与契约定义，不是可运行 workflow engine。
- **read-only surfacing**：仅展示解释信息，不提供执行控件。

术语约束：若某个词天然带有“执行已发生”暗示，必须在文档与 UI 文案中附加 `non-executing` / `read-only` 限定。

## 8. Risks

1. 审批术语被误解为真实上线审批系统。
2. audit trail 被误解为真实持久化审计系统。
3. 与 Phase 5/6 术语不对齐，导致 contract 冲突。
4. UI 文案暗示 operator 可以执行真实动作。
5. 测试覆盖不足导致语义回归（readiness -> execution 漂移）。

风险控制原则：

- 先文档锁定，再 contract-level 实现。
- 先 pure/read-only，后续再独立评审执行能力。
- 每一步保留“no side effect”显式声明。

## 9. Step 2 Entry Criteria

仅在以下条件全部满足后，才允许进入 Step 2：

1. A 主线范围已锁定且无并行 B/C 内容。
2. 术语锁定完成并可用于后续实现/测试命名。
3. freeze-compatible contract 已逐条声明且无冲突。
4. in-scope / out-of-scope 已明确并可执行审查。
5. implementation guardrails 已明确（禁止 execution/persistence/automation）。
6. 文档中不存在与 Phase 6 freeze 冲突或可误读为 live execution 的表述。

## 10. Conclusion

- Phase 7 仅沿 A 主线推进：approval checkpoints / audit trail skeleton。
- Step 2 只允许进入 **approval checkpoint contract skeleton** 的最小实现准备。
- execution / persistence / automation 仍明确禁止进入。
- B / C 继续 deferred，不得并行展开。

## Step 1 Completion Statement

Phase 7 Step 1 完成即表示：

- A 主线已锁定；
- 术语与边界已锁定；
- 禁止项与 out-of-scope 已锁定；
- Step 2 进入条件已锁定；
- 可在不破坏 Phase 5/6 Freeze Boundary 的前提下进入 Step 2。
