# KCW AI Platform - Phase 7 Step 4 Read-Only Surfacing

Date: 2026-03-20
Branch: `work`
Stage: Phase 7 / Step 4 (Read-only UI Surfacing)

## 1. Purpose

本步目标：将 Step 2 approval checkpoint contract 与 Step 3 audit trail skeleton 以最小方式接入现有 internal lead detail decision surface 附近，提供只读展示。

本步仍严格属于：

- read-only
- non-executing
- non-persistent
- no side effect

本步不是 execution UI，不是 approval panel，不是 submission console。

## 2. Relationship to Prior Steps

- 与 Phase 6 controlled submission contract / gate：
  - 仅消费其语义输出进行展示，不改写其行为，不新增执行入口。
- 与 Step 2 approval checkpoint contract：
  - 展示 checkpoint summary/list/state/rationale/boundary notes。
- 与 Step 3 audit trail skeleton：
  - 展示 derived trail summary/events/derived markers/boundary notes。

## 3. Surfacing Design

接入位置：

- `app/internal/leads/[id]/DecisionSurfaceSection.tsx` 中，紧接现有 controlled submission readiness read-only 区块之后。

展示内容：

1. Approval Checkpoints (Read-only Skeleton)
- overall summary state
- checkpoint label/state/description/rationale
- non-executing notice

2. Audit Trail Skeleton (Derived / Read-only)
- latest state hint
- trail summary note
- trail id / event count / boundary flags
- events list（title/category/description/derived marker/boundary note）

不新增执行控件原因：

- 保持 freeze-compatible 语义，不允许把 surfacing 转化为 workflow control。
- 避免 operator 将 checkpoint/audit 误解为可执行审批或提交入口。

## 4. Boundary Copy

文案策略：

- 明确写出：
  - "Read-only checkpoint semantics"
  - "No approve / submit / execute action"
  - "Checkpoint is not approval completion"
  - "Derived semantic events only"
  - "not a persisted production audit system"
  - "No external logging, no workflow control, and no side effect"

避免措辞：

- 不出现 approve/grant/submit/dispatch action CTA 文案。
- 不出现 persisted at / logged externally / official audit record / compliance completed 等误导性表述。

## 5. Test Coverage

更新：`tests/internalDecisionSurfaceSection.test.tsx`

新增断言：

- UI 展示 approval checkpoint section 与 audit trail section
- UI 展示 read-only / non-executing / non-persistent 边界文案
- UI 不存在 approve / submit 执行按钮入口
- UI 不出现 logged externally / official audit record 等越界表述
- 与现有 controlled submission 语义断言共存

## 6. Non-Goals

本步不做：

- 真实审批
- 真实提交
- 持久化
- 通知
- 自动化
- 工作流控制

## 7. Conclusion

Step 4 新增：

- approval checkpoint contract 与 audit trail skeleton 的最小 read-only surfacing。

Step 4 仍未新增：

- execution/persistence/automation 能力
- approval/submission action handlers
- external logging or side effects
