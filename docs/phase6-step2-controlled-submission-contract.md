# KCW AI Platform - Phase 6 Step 2 Controlled Submission Contract

Date: 2026-03-20
Branch: `work`
Stage: Phase 6 / Step 2 (Contract Definition)

## 1) Contract Purpose

Phase 6 Step 2 提供最小、可测试、纯函数化的 controlled submission contract：

- 只定义 readiness 判断语义；
- 只输出状态、原因、阻塞项与边界提示；
- 不执行提交，不写入系统，不触发任何外部 side effect。

该 contract 是 Phase 6 唯一主线（controlled submission after human confirmation）的“定义层”基础，不是执行层基础设施。

## 2) Status Definitions

`buildControlledSubmissionContract(...)` 输出的 `status` 包含四类：

- `not_eligible`：输入路径不是 `human_confirmed_path`，因此不进入受控提交 readiness。
- `needs_manual_confirmation`：满足进入评估的基本语义，但前置条件不足（人工确认/质量门/对齐/可用性等未满足）。
- `submission_ready`：仅表示“满足受控提交前提”。
- `blocked`：上游决策面或风险阻塞，必须先恢复前置条件。

## 3) Guard Philosophy

本 contract 遵循“保守优先、语义防误导”守卫哲学：

1. `human_confirmed_path` 是必要前提之一，但不是充分条件。
2. `submission_ready` 仅是 readiness，不是 submitted。
3. readiness 不携带执行副作用，输出显式包含 automation boundary：
   - `automation_not_implemented: true`
   - `auto_execution_enabled: false`
   - `submitted: false`
   - `submission_effect_state: no_side_effect`
4. 对所有非 ready 场景输出 `reasons / blockers / missing_requirements`，便于 UI 明确提示“manual confirmation required / no auto execution”。

## 4) Non-Goals (Step 2 明确不做)

- 不新增 DB / migration。
- 不新增 API 写入。
- 不新增真实 submit action。
- 不新增自动状态推进。
- 不引入 approval system / audit system / execution-safe write path。
- 不引入 framework-specific 依赖。

## 5) Compatibility with Phase 5/Step 1

Step 2 contract 与以下边界保持一致：

- 保持 Decision Surface 的 read-only/decision-entry 定位。
- 不改变 `suggestion_only / human_confirmed_path / not_yet_implemented_automation` 三层语义。
- 不把 `human_confirmed_path` 等同于 `submission_ready`。
- 持续显式暴露 `not_yet_implemented_automation` 的语义等价边界（通过 automation boundary 输出）。

## 6) Why This Is Still Non-Executing Infrastructure

即便输出 `submission_ready`，系统仍然：

- 未提交；
- 未自动执行；
- 未触发任何对外动作；
- 未产生业务写入。

因此，Phase 6 Step 2 仍属于 contract-only 非执行基础设施层。
