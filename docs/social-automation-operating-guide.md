# Social Automation Operating Guide (V1.5)

## Mode Behavior (enforced)
- Manual: only plan/draft/review generation; no auto publish attempt.
- Auto Draft: auto queue, but lands in draft/review states only.
- Controlled Auto Publish: attempts publish only when capability is `public_ready`; otherwise auto-downgrades.

## What Operators Should Check Daily
1. Connection panel: auth configured, token expiry, capability reason.
2. Queue panel: status + downgrade reason before manual release.
3. Reply queue: escalate all high urgency/high intent to human.
4. Analytics snapshot: verify source label; treat simulated seed as internal rehearsal data.

## No-Fake-Publish Rule
- Never present downgraded draft/private/manual flow as “public published”.
- For restricted platform states, keep manual checkpoint visible.
