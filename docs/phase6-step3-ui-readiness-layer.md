# KCW AI Platform - Phase 6 Step 3 UI Readiness Layer

Date: 2026-03-20
Branch: `work`
Stage: Phase 6 / Step 3 (UI Read-only Interpretation)

## 1) UI Purpose

Step 3 将 Step 2 的 `controlled submission contract` 接入 internal lead detail 的 Decision Surface 附近，作为只读 readiness 信息层。

该层目标是提升 operator 对 readiness / blockers / missing requirements 的可见性，而不是提供执行入口。

## 2) Read-only Nature

本步只展示 contract 输出，不引入任何执行型交互：

- 无 submit 按钮；
- 无写入接口；
- 无自动推进；
- 无外部 side effect。

## 3) Message Hierarchy

UI 采用如下信息层级：

1. status（not_eligible / needs_manual_confirmation / submission_ready / blocked）
2. readiness explanation（reasons）
3. missing requirements
4. blockers
5. automation boundary reminders（manual confirmation required / no auto execution / no submission performed）

## 4) Readiness vs Execution Distinction

Step 3 明确强化以下语义：

- `human_confirmed_path != submitted`
- `submission_ready != submitted`
- readiness does not equal execution
- no automatic execution is enabled
- no submission has been performed

## 5) Why No Action Control Is Introduced in This Step

Phase 6 Step 3 定位是 interpretation layer，不是 execution layer。

因此本步刻意不引入 action control（包括 submit/approve/writeback），以避免越过 Phase 5 freeze boundary 和 Phase 6 Step 1/2 contract discipline。
