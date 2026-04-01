# Social Automation V1 Architecture

## Core Namespaces
- `lib/socialAutomation/types.ts`: contracts for connections, queue, analytics, replies, degraded states.
- `lib/socialAutomation/controlPlane.ts`: orchestrates daily snapshot generation.
- `lib/socialAutomation/topicAutomation.ts`: generates daily topic plan from existing Content Ops topic seeds.
- `lib/socialAutomation/scriptAutomation.ts`: builds EN/ZH script packs from existing script generator.
- `lib/socialAutomation/videoPipeline.ts`: outputs platform-ready draft post package (9:16, subtitle manifest, payload).
- `lib/socialAutomation/queue.ts`: queue creation + status transition policy.
- `lib/socialAutomation/analytics.ts`: normalization + auto 5-day review recommendation.
- `lib/socialAutomation/replyHub.ts`: auto-draft comments/DM replies + lead/risk routing.
- `lib/socialAutomation/providers/*.ts`: provider-safe OAuth/publish scaffold (TikTok/Instagram/YouTube).

## Server Control Plane API
- `GET /api/internal/social-automation/overview`
- `PATCH /api/internal/social-automation/mode`
- `PATCH /api/internal/social-automation/connections`
- `PATCH /api/internal/social-automation/queue`

## UI
- `app/internal/social-automation/page.tsx`
- `app/internal/social-automation/SocialAutomationWorkbench.tsx`

## Degraded Mode Coverage
- platform not connected
- token expired
- audit restricted
- publish downgraded to draft/private
- analytics unavailable
