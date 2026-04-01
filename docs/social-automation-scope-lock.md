# Social Automation V1 Scope Lock

## Included in V1
- Unified social automation control plane under `lib/socialAutomation/*`.
- Internal control UI at `/internal/social-automation`.
- Internal API endpoints for overview, mode switching, connection state updates, and queue transitions.
- Topic→script→video-package→publish-queue transformation pipeline.
- Draft-first reply hub and 5-day analytics normalization/review automation.

## Explicitly Out of Scope for V1
- Production-grade external persistent database migrations.
- Full media transcoding/render farm.
- Unreviewed mass auto-send for comments/DMs.

## Safety + Reality Constraints
- OAuth token storage is server-side only (no frontend token persistence).
- Default flow is manual review or auto draft.
- Platform restrictions are represented as degraded states and visibility downgrade rules.
