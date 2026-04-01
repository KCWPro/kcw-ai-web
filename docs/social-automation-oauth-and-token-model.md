# Social Automation OAuth and Token Model

## OAuth Policy (Official Only)
- TikTok connector uses OAuth + Content Posting scope scaffold (`user.info.basic`, `video.publish`).
- Instagram connector uses OAuth + Instagram content publishing scopes.
- YouTube connector uses OAuth 2.0 upload scope.

## Token Handling
- Tokens are modeled only in backend state (`PlatformConnection`), never in client state storage.
- Connection model includes:
  - scope status
  - token expiry
  - refresh capability
  - connected user/account id
  - last sync timestamp
  - revoke/disconnect-ready state transitions

## Refresh / Revoke
- V1 provides contract and state model; refresh/revoke endpoint integrations are scaffold-level.
- Expired token state automatically feeds degraded mode and analytics unavailability banners.

## Security Notes
- No account/password automation path exists in V1.
- Secrets expected via environment variables.
