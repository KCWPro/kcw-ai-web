# Social Automation OAuth and Token Model (V1.5)

## 最小真实闭环（可落地）
1. Initiate: `POST /oauth/initiate` 生成 state + nonce，返回平台 auth URL。
2. Callback: `GET /oauth/callback` 校验 state（anti-CSRF），再写入 connection persistence。
3. Refresh contract: `POST /oauth/refresh`。
4. Revoke contract: `POST /oauth/revoke`。

## 状态约束
- 未配置 client id/secret/redirect：`not_connected` + `manual_only`。
- 已配置但未授权：`auth_url_ready` + `manual_only`。
- token 过期：`token_expired` + `draft_only`。
- 平台审核/能力限制：`restricted` 或 `private_only`。
- 仅在真实授权 + token 有效 + 能力允许时才可能 `public_ready`。

## 用户需在平台后台完成
- TikTok: app 审核与 content posting 权限审批。
- Instagram: Meta app + Instagram Business scope 配置。
- YouTube: Google OAuth consent + upload scope 审核。
