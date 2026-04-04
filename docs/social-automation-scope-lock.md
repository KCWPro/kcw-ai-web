# Social Automation V1.5 Scope Lock

## 已完成（真实可运行）
- 统一 Social Automation 控制面：连接状态、模式切换、队列、回复草稿、分析快照全部由 `lib/socialAutomation/*` 驱动。
- `/internal/social-automation` 可展示真实连接分层状态：`not_connected` / `auth_url_ready` / `connected` / `token_expired` / `restricted` / `degraded`。
- 发布能力统一模型：`manual_only` / `draft_only` / `private_only` / `restricted` / `public_ready`。
- 队列状态流转采用受控状态机：`queued`/`draft_ready`/`waiting_manual_review`/`publish_attempted`/`published`/`failed`/`downgraded`。
- 生产安全：不使用本地 runtime 文件写入作为 social automation 存储。

## 明确受限 / 未完成
- 三平台真实 token 交换、refresh、revoke 目前是可接入 contract（scaffold），不是已上线真实平台打通。
- TikTok 公网自动公开发布默认受审核限制建模，不会伪装为 `public_ready`。
- 无真实平台拉数时，分析源必须标记为 `simulated/internal seed`。

## 人工必须完成
- 在 TikTok/Meta/Google 开发者后台配置 app、redirect URI、scope、审核。
- 完成账号 owner 授权并验证 token 生命周期。
