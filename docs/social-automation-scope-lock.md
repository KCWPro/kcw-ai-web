# Social Automation Scope Lock (MVP)

## Scope
This document locks the current implementation to a **minimal verifiable landing** only.

## Done in this round
- Added route page at `app/internal/social-automation/page.tsx`.
- Added minimal type definitions at `lib/socialAutomation/types.ts`.
- Added this scope-lock document.

## Explicitly not done
- No backend integration.
- No real platform OAuth/connect flows.
- No real publish scheduling/worker pipeline.
- No persistence/storage model.
- No analytics/observability implementation.

## Verification intent
The page must be directly openable and display:
- Social Automation
- Platform Connections
- Publish Queue
- Degraded Mode Notice
