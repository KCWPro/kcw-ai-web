# Phase 31 · Controlled / Auditable / Sustainable Ops Hardening

Date: 2026-03-27

## Scope

在不推翻既有 lightweight contentOps 架构的前提下，推进：

- 人工审核优先（Script Studio / Post Plan）
- Asset Library 真上传（轻量）
- 今日执行闭环（状态 + 执行动作）
- 数据接入顺手化（CSV 文件 + Sheet 只读结构预留 + 报错增强）
- 变现执行层（内容级执行建议 + CTA 推荐）

## Delivered

1. **人工审核工作流**
   - ScriptPack / PostPlan 增加 `review_status`、`reviewer_notes`、`version_history`。
   - Script Studio UI 展示审核状态、reviewer notes、版本数，并明确 `requiresManualReview`。
   - Post Plan seed 数据加入审核流转示例（draft/reviewed）。

2. **Asset Library 真上传（轻量）**
   - 新增 API：`/api/internal/content-ops/assets`（GET/POST/PATCH）。
   - 新增上传态内存 store：支持上传、标签编辑、`safe_for_public` 更新、topic/script/post-plan 绑定。
   - UI 增加上传入口、基础 preview url 展示、标签输入。

3. **运营执行闭环**
   - 新增 `DailyExecution` 与执行状态：planned/filmed/edited/posted/reviewed。
   - 增加评论已回复、私信已处理、高意向 lead 转人工标记。
   - Dashboard top alert 与 Workbench 展示今日执行进度。

4. **数据接入顺手化**
   - Workbench 支持 CSV 文件直接读取（file input）。
   - `performanceImport` 增加更明确的校验错误（无有效行等）。
   - 预留 Google Sheet 只读接入结构：`sheetAdapter`（provider/ready/next_step）。

5. **变现执行层**
   - 新增内容级执行标签：
     - `lead_capture`
     - `affiliate`
     - `sponsor_safe`
     - `education_only`
   - 根据当前阶段输出 CTA 推荐，且维持 lead priority 最高。

## Notes

- 继续保持轻量实现：无重型媒体系统、无复杂数据库迁移。
- 人工审核仍为硬门槛，不做自动跳审。
