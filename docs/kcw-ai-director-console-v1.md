# KCW AI Director Console v1

## 项目目标
在当前仓库中落地一套独立的 Director Console（不依附旧 `/internal`），提供案件创建、AI 结构化分析、工程决策、报价/合同/permit/procurement 联动的内部可用 v1。

## 与旧 /internal 的边界
- 旧 `/internal`、`/internal/leads`、`/internal/leads/[id]` 未删除，原功能继续。
- 新系统采用独立路由与独立导航：`/director/*`。
- Director 允许“从 lead 导入”，但导入后写入 Director 独立 case 记录层。

## 路由清单
- `/director`：Director Dashboard
- `/director/cases`：Director Cases Inbox
- `/director/cases/new`：Manual Case Creation
- `/director/cases/[id]`：Director Case Workspace
- `/director/contracts`：Director Contract Center
- `/director/permits`：Director Permit Center
- `/director/procurement`：Director Procurement Center

## 数据模型摘要
实现于 `lib/director/types.ts`：
- `DirectorCaseRecord`
- `DirectorMediaRecord`
- `DirectorVisualDiagnosisRecord`
- `DirectorEngineeringDecisionRecord`
- `DirectorMaterialsLaborRecord`
- `DirectorEstimateRecord`
- `DirectorContractRecord`
- `DirectorPermitReviewRecord`
- `DirectorProcurementRecord`
- `DirectorActionLog`
- `DirectorCaseBundle`

## 状态机
实现于 `lib/director/statusMachine.ts`：
- `draft`
- `intake_ready`
- `ai_analysis_ready`
- `engineering_review_ready`
- `estimate_ready`
- `contract_ready`
- `permit_review_pending`
- `procurement_review_pending`
- `site_visit_needed`
- `completed`
- `archived`

并提供：
- `canTransitionDirectorStatus`
- `getDirectorAllowedTransitions`
- `isDirectorStatus`

## 模块说明
`/director/cases/[id]` 工作区由独立模块组成：
1. Case Header
2. Intake Summary
3. Visual Diagnosis
4. Engineering Decision
5. Materials & Labor Plan
6. Estimate Builder
7. Contract Builder
8. Permit Review
9. Procurement Suggestions
10. Admin Workflow

## 已交付内容
- 独立 Director 路由与导航。
- 手工建案表单（含导入 lead 能力）。
- 结构化 AI 输出协议与渲染。
- 状态机与工作流状态操作。
- Contract/Permit/Procurement 三个中心页。
- API 路由：创建案件、查询案件、跑 AI、更新状态、从 lead 导入。

## 未交付内容
- 未接入真实文件上传持久化（v1 用结构化字段占位）。
- 未接入实时 city permit API。
- 未接入实时 vendor stock/price API。

## 现实限制
- 当前环境以进程内 store（内存）实现 Director 记录层，重启会丢失。
- Permit 与 Procurement 使用离线结构化参考，已明确 `conditional/placeholder` 标记。
