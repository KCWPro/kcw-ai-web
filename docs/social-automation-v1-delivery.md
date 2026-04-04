# Social Automation V1.5 Delivery Status

## Completed (real)
- Unified connection/token/capability model.
- OAuth initiate/callback/refresh/revoke minimal contracts.
- Mode-driven queue with capability gate + downgrade reason.
- Draft publish package completeness (title/caption/hashtags/pinned/subtitle/assets).
- Reply triage with suggested action + escalate flags.
- Analytics + 5-day review now expose weak metrics/recommended action/review decision + source type.
- Production-safe runtime behavior (no local file write dependency).

## Still Scaffold / Restricted
- OAuth callback uses minimal in-memory persistence marker, not external vault/database.
- End-to-end real token exchange for each provider requires user-side app setup and secrets.
- Public auto-publish remains restricted by platform policy/approval and capability gate.

## Why full public auto publish may still be blocked
- Missing platform app approvals/scopes.
- Missing or expired tokens.
- Platform audit/review constraints (notably TikTok).
