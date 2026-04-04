# Social Automation V1.5 Operating Guide

## 模式定义
1. Manual：仅产出计划与草稿，不进入自动发布。
2. Auto Draft：自动入队，但停在草稿/待人工确认。
3. Controlled Auto Publish：先走 capability gate，不满足 `public_ready` 必降级并标记 `downgraded`。

## 每日操作
1. 打开 `/internal/social-automation`。
2. 看 Platform Connections：授权状态、token 过期、capability 等级。
3. 检查 Queue 是否出现 `downgraded`，并读取 downgrade reason。
4. Review / Reply Queue：高风险或高意向必须人工接手（escalate=yes）。
5. Analytics Snapshot：若 source 为 `simulated/internal seed`，仅用于内部节奏评审，不作为平台真实拉数结论。

## 安全红线
- 不允许账号密码自动化。
- 不允许把 restricted 伪装成 public 自动发布。
