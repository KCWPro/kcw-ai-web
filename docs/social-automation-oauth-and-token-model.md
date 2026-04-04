# OAuth & Token Model (V1.5)

## Model Guarantees
- Connection status is derived from one unified model, not UI hardcode.
- Auth/token truth directly drives publish capability and queue downgrade.

## Platform Contract
- TikTok: may stay `restricted` until platform-side review allows broader publish scope.
- Instagram Reels: if only contract scaffold/no real token, remains `manual_only` or `auth_url_ready`.
- YouTube Shorts: expired token must show `token_expired` and require re-auth/refresh.

## Minimal OAuth Flow
1. Initiate route generates `state` + `nonce` and returns official OAuth URL.
2. Callback validates state and stores minimal connection marker.
3. Refresh/revoke routes provide explicit token lifecycle contracts.

## Required User-Owned Setup
You must configure platform developer apps yourself:
- TikTok developer app key/secret + redirect URI.
- Meta app (Instagram permissions) + business asset linking.
- Google Cloud OAuth client + YouTube Data API scope consent.

If these are missing, UI/API intentionally show `oauth_not_configured` / `auth_required`.
