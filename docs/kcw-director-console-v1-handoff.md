# KCW Director Console v1 Handoff

## 本次修改文件清单
- app/internal/page.tsx
- app/internal/leads/page.tsx
- app/internal/leads/[id]/page.tsx
- app/api/internal/leads/[id]/route.ts
- components/internal/* (director modules)
- lib/directorConsole/*
- lib/visualDiagnosis/index.ts
- lib/engineeringDecision/index.ts
- lib/estimateBuilder/index.ts
- lib/permitReview/index.ts
- tests/directorConsoleStatus.test.ts
- tests/directorConsoleStructuredOutput.test.ts

## 本次新增页面
- internal dashboard（改造）
- internal lead inbox（改造）
- internal lead detail control center（改造）

## 本次新增数据结构
- 统一状态机与状态标签
- LeadMaster 与 10 类结构化 record
- future integration boundary reserved 字段

## 本次验证结果
- TypeScript noEmit 通过
- Director Console 新增测试通过
- Next build 通过

## 当前已知限制
- permit/vendor/market 为占位式结构，不是实时联网。
- admin workflow 状态日志持久化目前依赖既有 lead status 字段。

## 下一阶段建议
优先接入 permit knowledge base 与采购价格源的只读查询层。
