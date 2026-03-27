# KCW Content Ops System · Phase 1-2 Audit & Scope Lock (2026-03-27)

## A. 审计结论（当前项目承接点）
- 当前 repo 已有 Next.js App Router、内部运营页面 `/internal/*`、轻量数据/服务层 `lib/*`，适合直接扩展内容运营系统。
- 现有样式与信息卡结构可复用，避免额外 UI 框架引入。
- 现有项目偏“线索处理”，缺少“内容增长/复盘/变现”模块，本次以增量方式补齐。

## 可复用模块
- `app/internal/layout.tsx`：内部后台导航框架。
- `app/internal/page.tsx`：运营 dashboard 卡片模式。
- `lib/*` 的纯函数组织方式：适合新增 contentOps engines。

## 建议实现路径（本轮已执行）
1. 先建立内容运营数据模型与 seed content。
2. 新增 contentOps 引擎（策略、选题、脚本、5天复盘、变现、互动）。
3. 上线 `/internal/content-ops` 最小后台界面。
4. 通过文档锁定边界，确保真实性优先。

---

## B. Scope Lock

### 第一版必须做
- 人工审核后发布（不做自动发布）。
- 今天发什么 + 怎么拍 + 脚本 + 发布前检查。
- 评论/私信建议与 lead intent 初筛。
- 5天 KPI 检查、未达标归因、修正计划。
- 变现路线按阶段推进，以本地 lead 为第一目标。

### 第一版明确不做
- 复杂第三方平台 API 自动发布。
- 重型数据库改造。
- 未经核实法规/报价自动承诺。
- 虚构案例自动生成。

### 后续扩展
- Google Sheets / CRM 双向同步。
- 素材上传与检索 UI。
- 真实发布数据自动拉取。

### 变现阶段边界
1. Stage 1：流量与信任。
2. Stage 2：本地 lead capture（优先）。
3. Stage 3：轻 affiliate。
4. Stage 4：品牌合作。
5. Stage 5：平台分成准备（补充）。

---

## C. 数据模型草案
已在 `lib/contentOps/types.ts` 落地：
- `Topic`
- `ScriptPack`
- `AssetRecord`
- `PostPlan`
- `PerformanceRecord`
- `CommentReply`
- `DmReply`
- `MonetizationPlan`

所有核心字段覆盖：真实性评分、AI 味风险、浮夸风险、重复度风险、lead/virality/trust 评分。

---

## F. 最小后台 UI 方案
页面：`/internal/content-ops`
- Dashboard（今日推荐3条）
- 5-Day Review Center
- Monetization Planner
- Interaction Studio（评论 + DM）
- Module Coverage（其余模块在本期以 engine + docs 交付）

组件结构：
- 推荐卡片
- 复盘卡片
- 变现阶段卡片
- 互动模板卡片

数据流：
- `data/contentOps/*` -> `lib/contentOps/* engines` -> `app/internal/content-ops/page.tsx`

---

## G. 流量变现路线图（排序原因）
- **先 lead capture**：KCW 是本地服务商，短视频首要价值是获客，不是平台补贴。
- **再 affiliate/sponsor**：需要账号先有真实可信内容资产，避免损害专业气质。
- **最后平台分成**：作为补充收入，不反向驱动内容质量下降。

---

## H. 实施计划与文件清单
### 新增 files
- `lib/contentOps/*.ts`
- `data/contentOps/*.ts`
- `app/internal/content-ops/page.tsx`
- `docs/kcw-content-ops-scope-lock.md`
- `docs/kcw-content-ops-operating-playbook.md`
- `tests/contentOpsSystemContract.test.ts`

### 修改 files
- `app/internal/layout.tsx`（新增 Content Ops 导航）

### 测试方案
- 数据数量与质量阈值 contract test（topics >=100, scripts >=20, templates >=30）。
- 5天复盘输出结构 contract test。
- 变现阶段与“lead优先”规则 contract test。
