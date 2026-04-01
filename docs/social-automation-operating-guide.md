# Social Automation V1 Operating Guide

## Modes
1. Manual Review Mode: AI generates, human approves, human publishes.
2. Auto Draft Mode: AI generates and queues draft/private-compatible payloads.
3. Controlled Auto Publish Mode: AI can publish where connection + policy + review gates allow.

## Daily Runbook
1. Open `/internal/social-automation`.
2. Check Safety/Degraded banner.
3. Validate platform connection states.
4. Review Today’s Auto Plan + generated queue payload visibility.
5. Review reply drafts and escalate high-intent/high-risk threads.
6. Read 5-day analytics recommendation (repeat/stop/expand).

## Failure / Downgrade Behavior
- Token expired → analytics and publish degrade warnings.
- TikTok audit restricted → publish path downgrades to private/draft-compatible flow.
- Not connected platform → queue retained, no publish action.
