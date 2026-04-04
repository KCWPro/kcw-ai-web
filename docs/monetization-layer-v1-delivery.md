# Monetization Layer v1 Delivery

## 交付概览
v1 在不重构现有系统的前提下，落地了可执行的“受控商业化层”：
- 盈利判断（内容级标签+打分）
- 比例防失控（ratio guard）
- affiliate/sponsor/local partner 适配建议
- 5-day 盈利复盘
- UI 可见入口（Content Ops 工作台）

## 可真实使用的能力
- 基于真实内容数据做分类与阶段判断
- 输出可执行 CTA 与再平衡建议
- 对高风险商业化行为发出告警
- 在运营面板查看周结构与优先动作

## 仍是推荐层的能力
- affiliate 仅建议类目和话术，不含链接管理与结算
- sponsor 仅输出安全适配和 proposal draft，不代表达成合作
- local collab 仅输出候选方向与 outreach 草稿

## 验收建议
```bash
find app -path "*monetization*" 2>/dev/null
find lib -path "*monetization*" 2>/dev/null
find docs -iname "monetization-layer-*.md"
npm run build
```
