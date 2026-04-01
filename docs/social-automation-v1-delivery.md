# Social Automation V1 Delivery Statement

## What is implemented and runnable now
- End-to-end internal pipeline from topic planning to publish queue payload generation.
- Draft-capable provider adapters for TikTok/Instagram/YouTube using official OAuth contract surfaces.
- Internal dashboard with connections, queue, plan, reply queue, analytics snapshot, and degraded state banner.
- Contract-tested queue transitions, token model, degraded mode, analytics normalization, and 5-day ingestion.

## What is scaffold / draft-only / restricted
- Real external OAuth callback exchange and provider publish polling are scaffold contracts in V1.
- TikTok unrestricted public posting depends on platform audit approval and is modeled as restricted fallback by default.
- Production persistence is intentionally not local-file-based; V1 runtime store is in-memory for safe fallback.

## Human authorization requirements
- Account owner must authorize each platform via OAuth.
- Controlled auto publish should only be enabled after policy review and connector verification.

## Repository verification checklist
- Confirm route files exist with:
  - `find app -path "*social-automation*" 2>/dev/null`
  - `find app/api -path "*social-automation*" 2>/dev/null`
  - `find lib -path "*socialAutomation*" 2>/dev/null`
  - `find docs -iname "social-automation-*.md"`
- Open the internal page locally with:
  - `npm run dev` then visit `http://localhost:3000/internal/social-automation`
