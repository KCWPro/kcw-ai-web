# KCW Director Console v1

## 目标
交付仅供 KCW 内部使用的 Director Console v1，在当前仓库/分支内完成 lead 内部处理链路（Dashboard -> Inbox -> Detail -> Diagnose -> Engineering -> Estimate -> Contract/Permit/Procurement -> Admin Workflow）。

## 范围
- 已实现内部页面与模块，不改前台页面与服务申请表。
- 不做真实前后台整合、不做自动客户发送、不做自动 permit/采购执行。

## 已交付模块
- Dashboard 总览与队列指标
- Lead Inbox 多维筛选
- Lead Detail 总控页
- Media Review（含视频关键帧结构）
- Visual Diagnosis Director
- Engineering Decision Director
- Estimate Builder
- Contract Builder（中/英/双语结构字段）
- Permit Review
- Procurement Suggestions
- Admin Workflow（状态推进）

## 未交付模块
- 实时 city permit 联网抓取
- 实时供应商库存/采购下单
- 实时市场价数据接入
- 前后台自动联动

## 数据模型摘要
新增集中数据模型：LeadMaster、MediaAsset、VisualDiagnosisRecord、EngineeringDecisionRecord、MaterialRecommendationRecord、EstimateRecord、ContractRecord、PermitReviewRecord、ProcurementSuggestionRecord、InternalActionLog。

## 状态流转
统一状态机：
new -> media_pending_review -> diagnosis_in_progress -> engineering_review_pending -> estimate_pending -> contract_pending -> permit_review_pending -> follow_up_pending -> closed_won/closed_lost -> archived，并支持 site_visit_recommended / senior_review_required 旁路。

## 未来前台整合边界
已预留字段：external_lead_id/source_type/source_platform/source_submission_payload/source_media_ref/intake_timestamp/customer_visible_status/outbound_message_ref/future_callback_status。

## 风险与限制
- AI 结论仅为内部初步建议，需人工确认。
- permit/code 内容仅为内部提示，不构成法律意见。
- 目前数据源以现有 lead 记录+规则生成结构输出，未接入实时外部源。
