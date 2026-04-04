# Monetization Layer Operating Guide

## 1) 核心原则
1. Lead conversion 是主收入。
2. 商业化必须受控，不得损害账号真实感。
3. 教育内容占比保持基线，避免“每条都在卖”。

## 2) 运行方式
- 系统从 `PerformanceRecord` 自动推断 monetization stage。
- 对每条内容产出：
  - `labels` + `primary_label`
  - 分值：`lead_score` `affiliate_score` `sponsor_score` `trust_risk_score` `commercialization_risk_score` `audience_fit_score`
  - CTA 建议、affiliate/sponsor/local collab 适配建议
- Ratio Guard 对本周结构做告警和再平衡建议。

## 3) 阶段策略
- Stage 1: Trust building
- Stage 2: Lead-first growth
- Stage 3: Lead + light affiliate
- Stage 4: Lead + affiliate + sponsor
- Stage 5: Mature mixed monetization

每个阶段定义：
- 推荐内容比例
- 推荐 CTA 比例
- 商业化上限
- 禁止事项

## 4) 推荐层说明（非交易层）
以下均为推荐层，不是实际交易执行：
- affiliate 产品建议与 CTA
- sponsor proposal draft
- local partner outreach draft

## 5) 与现有模块衔接
- Content Ops 页面直接展示 monetization stage、比例、风险、5-day monetization review。
- 5-day review 输出新增 monetization summary / risk / next cycle monetization plan。
