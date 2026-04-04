# Social Automation V1.5 Architecture

## Core
- `lib/socialAutomation/connectionModel.ts`: 统一连接状态与发布能力推导。
- `lib/socialAutomation/oauthPersistence.ts`: OAuth state/nonce/anti-CSRF in-memory contract。
- `lib/socialAutomation/controlPlane.ts`: 快照编排（连接、队列、回复、分析、degraded）。
- `lib/socialAutomation/queue.ts`: 模式 + 能力 gate 驱动的队列决策与降级。
- `lib/socialAutomation/videoPipeline.ts`: 稳定输出 draft publish package（title/caption/hashtags/pinned/subtitle/assets）。

## API Contracts
- `POST /api/internal/social-automation/oauth/initiate`
- `GET /api/internal/social-automation/oauth/callback`
- `POST /api/internal/social-automation/oauth/refresh`
- `POST /api/internal/social-automation/oauth/revoke`
- `GET /api/internal/social-automation/overview`
- `PATCH /api/internal/social-automation/mode`
- `PATCH /api/internal/social-automation/queue`

## Production-safe
- 当前 social automation store 为内存 fallback；不触发 `/var/task` 写入。
- 即使没有 OAuth env/token，页面也降级展示 `not connected/auth required`，不报 500。
