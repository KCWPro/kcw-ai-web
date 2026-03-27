# KCW Content Ops Operating Playbook (MVP)

## 1) Content Strategy Engine
- Positioning: 真实本地服务团队、专业但不端着。
- 平台优先：TikTok / IG Reels / YT Shorts。
- 双语策略：单条视频优先单语，必要时音频/字幕错位互补。

## 2) Topic Generator
- 种子题库：`data/contentOps/seedTopics.ts`（104条，按8个支柱）
- 每日推荐：`generateDailyTopics` + `pickTopThreeForToday`
- 分类覆盖：emergency / mistakes / drain / water heater / gas safety / maintenance / before-after / quote / renovation / myths / local reminder / trust stories。

## 3) Script Generator
- 脚本样例：`data/contentOps/scriptSamples.ts`（20条完整样例）
- 支持字段：hooks、主脚本、short/standard/long、字幕、CTA、caption、hashtag、置顶评论、回复seed。
- 自动风控：`rewrite_required` 基于 AI 味风险与浮夸风险。

## 4) Video Format Selector
- 自动映射 real_case -> before/after。
- quote_education -> quote_education format。
- maintenance -> top_3_tips。

## 5) Publishing Checklist
- 发布前检查 8 项：hook、相关性、营销强度、AI 味、浮夸、真实感、CTA 强度、字幕密度。

## 6) Interaction Studio
- 评论模板覆盖：价格、DIY、同款症状、服务范围。
- 私信模板覆盖：询价、紧急、安全边界、服务区域。
- lead 识别：intent + urgency + next action。

## 7) Performance Tracker
- 输出 high/low performer pattern。
- 输出 repeat / stop / test 建议。

## 8) 5-Day Review Center
- 模式：保守/标准/冲刺。
- 未达标输出：差距、最弱项、归因类别、修正策略、下一轮实验计划、衰减规则。

## 9) Authenticity Control Rules
- 禁止：震惊体、绝对承诺、恐吓营销、虚构案例。
- 所有内容必须带：realism_score / ai_smell_risk / exaggeration_risk / trustworthiness_score。
- 高风险自动标记重写。

## 10) Monetization Planner
- 排序锁定：本地 lead > sponsor/affiliate > 平台分成。
- Stage 1~5 推进逻辑在 `lib/contentOps/strategyEngine.ts` 与 `lib/contentOps/monetizationPlanner.ts`。

## 日常运营动作（人工审核优先）
1. 打开 `/internal/content-ops` 看今日推荐3条。
2. 从推荐中选2条执行，确认素材可用。
3. 用脚本包生成 caption + CTA。
4. 发布前跑 checklist。
5. 发后记录 performance，5天后跑 review。
