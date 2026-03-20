# KCW AI Platform - Phase 6 Step 1 Scope Lock

Date: 2026-03-20
Branch: `work`
Stage: Phase 6 / Step 1 (Scope Lock)

## 1) Phase 6 目标与唯一主线

Phase 6 的唯一主线为：**controlled submission after human confirmation**。

本阶段目标是：在不突破 Phase 5 Final Freeze 边界的前提下，先完成语义锁定、边界锁定、禁止项锁定，建立后续最小可控提交能力的定义基础；**本步不做任何功能实现**。

## 2) 与 Phase 5 的承接关系

Phase 6 Step 1 严格承接 Phase 5 的 freeze 结论：

- 当前系统仍是 suggestion/read-only decision surface，不是 automation engine。
- `human_confirmed_path` 在 Phase 5 中仍是 clarity layer，不是执行提交。
- 任何 execution / approval / writeback / automation 能力必须作为 Phase 6+ 独立范围评审推进。

因此，Step 1 仅做“范围与语义合同”，不触发 execution 能力引入。

## 3) 术语定义（Phase 6 Step 1 Canonical Terms）

### 3.1 suggestion_only

仅表示建议输出与人工判断参考，不表示已确认、已提交或已执行。

### 3.2 human_confirmed_path

表示“人工确认后的推荐路径清晰度”，用于说明 operator 已完成确认判断；**不等于自动执行，不等于外部动作已发生**。

### 3.3 controlled submission

表示“在明确人工确认前提下，进入受控提交意图与可提交状态判定”的能力语义。

在 Phase 6 Step 1 中，该术语只用于定义边界与后续合同，不代表已存在真实提交能力。

### 3.4 not_yet_implemented_automation

表示自动化相关能力尚未实现，必须持续可见、可追踪，防止被误读为已上线执行能力。

## 4) 强制语义声明（Mandatory Statements）

1. **controlled submission 不是 execution automation。**
2. **controlled submission 不代表任何外部 side effect 已发生。**
3. **human_confirmed_path 在本阶段仍保持 clarity-layer 语义，不可写成 auto-execute。**

## 5) In-Scope（Step 1 允许范围）

- 新增 Phase 6 Step 1 scope lock 文档。
- 明确术语词典、边界声明、禁止项、兼容要求。
- 明确 Step 2 进入条件（门槛与前置审查项）。
- 与 Phase 5 freeze / boundary / midpoint 文档语义对齐，避免术语冲突。

## 6) Out-of-Scope（Step 1 不包含）

- 任何功能代码实现。
- 任何 UI 组件改造、按钮新增、交互流程新增。
- 任何提交执行逻辑、写入逻辑、状态推进逻辑。
- 任何 approval checkpoints / audit trail / execution-safe write path 并行展开。

## 7) 禁止项（Still Forbidden in Step 1）

- 自动联系客户（短信/邮件/电话等）。
- 自动推进状态。
- 自动创建任务/派单。
- 自动发送报价或写入正式业务数据。
- 自动执行多步 workflow。
- 权限系统完整落地、审计系统完整落地、数据库迁移、外部 workflow engine 引入。

## 8) UI / 文案语义限制

- 不得把 `ready_for_manual_progress`、`human_confirmed_path`、`controlled submission` 写成“系统将自动执行”。
- 必须持续保留 no-auto-contact / no-auto-status / no-auto-task / no-auto-writeback 的边界提示语义。
- 任何新增文案必须强调“manual confirmation required / non-automation / no side effect yet”。
- 在 Step 1 不新增 UI 文案变更；本条用于后续 Step 约束。

## 9) 与既有 Decision Surface / Freeze Boundary 的兼容要求

- 不推翻 Phase 5 的三层语义分组：
  - suggestion_only_items
  - human_confirmed_paths
  - automation_boundary_notices
- 不改写既有 Decision Surface 的“read-only decision entry”定位。
- 不改写 Phase 2 analysis contract。
- 不引入与 Phase 5 freeze 文档冲突的新术语或新承诺。

## 10) Step 2 进入条件（Entry Criteria）

进入 Phase 6 Step 2 前必须满足：

1. Step 1 文档经产品/运营/技术三方确认语义一致。
2. 明确 Step 2 仍为“contract-first（定义先行）”，非执行先行。
3. 确认 Step 2 输出只涉及受控提交 contract / 状态判定模型，不涉及真实提交与外部副作用。
4. 明确测试策略以语义与边界断言为核心，避免越权实现。

## 11) Step 1 Completion Statement

Phase 6 Step 1 完成即表示：

- 范围已锁定；
- 语义已锁定；
- 禁止项已锁定；
- 兼容要求已锁定；
- 可在不破坏 Phase 5 Freeze Boundary 的前提下进入 Step 2。
