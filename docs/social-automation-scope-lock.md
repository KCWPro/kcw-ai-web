# KCW Social Automation Scope Lock (V1.5)

## In Scope (real, implemented)
- Unified connection/token model for TikTok, Instagram Reels, YouTube Shorts with explicit states: `not_connected`, `auth_url_ready`, `connected`, `token_expired`, `restricted`, `degraded`.
- Publish capability grading: `manual_only`, `draft_only`, `private_only`, `restricted`, `public_ready`.
- Three operation modes with queue impact (not UI-only): Manual, Auto Draft, Controlled Auto Publish.
- Queue states: `queued`, `draft_ready`, `waiting_manual_review`, `publish_attempted`, `published`, `failed`, `downgraded`.
- Draft video package output includes title/caption/hashtags/pinned comment/subtitle/asset manifest.
- Reply triage queue includes urgency, lead level, escalation, and suggested action.
- Analytics snapshot + 5-day review uses explicit source labeling (`simulated/internal seed` when not imported).

## Restricted / Scaffold
- OAuth callback is contract-scaffold level (minimal persistence marker in internal store).
- No fake full-public automation claims; non-`public_ready` platforms are auto-downgraded.
- Platform-side publishing approvals/reviews remain external dependencies.

## Out of Scope
- Credential scraping, password automation, anti-platform policy behavior.
- Claims of fully automated public publishing across all three platforms.

## Production Safety Lock
- Social Automation runtime uses in-memory state only.
- No production filesystem writes for socialAutomation paths.
- Missing env/tokens must degrade to safe UI/API states instead of throwing.
