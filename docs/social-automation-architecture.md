# Social Automation Architecture (V1.5 Controlled Practical)

## Runtime Layers
1. `connectionModel.ts`: computes auth configuration, token health, connection state, and publish capability.
2. `controlPlane.ts`: builds snapshot from topic/script/video/reply/analytics modules.
3. `queue.ts`: mode-aware + capability-gated publish queue generation.
4. `store.ts`: in-memory persistence interface (`read`, `write`, `savePlatformConnection`, `setControlMode`).
5. API routes under `app/api/internal/social-automation/*`: overview/mode/connections/queue + oauth contracts.
6. UI workbench: renders degraded banner, connection truth state, queue downgrade reasons, reply actions, analytics source.

## OAuth Minimal Closed Loop
- Initiate: `POST /api/internal/social-automation/oauth/:platform/initiate`
- Callback scaffold: `GET /api/internal/social-automation/oauth/:platform/callback`
- Refresh contract: `POST /api/internal/social-automation/oauth/:platform/refresh`
- Revoke contract: `POST /api/internal/social-automation/oauth/:platform/revoke`
- State/nonce anti-CSRF stored in transient in-memory map (`oauth.ts`).

## Degraded-by-Default Safety
- If env/client secret is missing: state=`degraded` + capability=`manual_only`.
- If token missing: state=`auth_url_ready` + auth required.
- If token expired: state=`token_expired` + auth required.
- If platform restriction (e.g., TikTok audit): state=`restricted` + capability limited.

## Production Constraint
- No local runtime file writes.
- Works in production even with zero token/env configuration.
