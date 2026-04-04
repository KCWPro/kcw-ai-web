# KCW Monetization Layer Scope Lock (v1)

## 目标
在现有 Content Ops + Social Automation 上新增受控商业化层，保证 **lead 优先、真实性优先**。

## 本次已做
- Monetization Intelligence Layer：对每条内容输出多标签与评分（lead / affiliate / sponsor / trust risk / commercialization risk / audience fit）。
- Revenue Strategy Engine：按账号阶段输出主收入方向、禁用项、推荐内容/CTA 比例、商业化上限。
- Ratio Guard：默认保守比例并自动告警（商业过载、sponsor 连发、affiliate 侵蚀信任、CTA 过硬、广告号风险）。
- Affiliate Recommendation Layer：仅推荐 KCW 高相关、低风险家修类目；输出纯教育版与轻带货版脚本建议。
- Sponsor Safety Layer：判断 sponsor_safe、披露要求、整合方式与风险，并生成 proposal draft（仅草案）。
- Local Partner Layer：识别本地合作候选（地产/保险/材料/家电热水器/物业）并输出 outreach draft。
- Revenue Dashboard：在 Content Ops 快照加入主盈利模式、周比例、风险告警、5d/30d建议、不可商业化内容。
- 5-day Review Monetization：正式接入 monetization summary / risk / next cycle plan。
- CTA Intelligence Upgrade：自动匹配 lead / affiliate / sponsor / education CTA。

## 本次明确不做
- 不接真实支付/结算。
- 不伪装已拿到 sponsor 或 affiliate 链接。
- 不生成绕平台规则的广告动作。
- 不把系统改成“商业化优先于账号健康”。

## 锁定边界
- 仅在当前仓库架构内扩展 `lib/contentOps` 与 `app/internal/content-ops`。
- 保持原有 `/internal/content-ops` 和 `/internal/social-automation` 可运行。
