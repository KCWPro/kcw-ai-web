# KCW Content Ops V1 Operating Guide

## Scope / Boundaries
- Lightweight architecture only (`lib/contentOps/*` preserved).
- Human review first: `approved` is required for high-priority publishing.
- Local lead conversion first, authenticity first, no bulk spam automation.
- Persistence uses local JSON runtime store under `data/contentOps/runtime/`.

## Review Workflow
1. Script/Post Plan starts at `draft`.
2. Reviewer action: `mark_reviewed` / `approve` / `reject` / `revert_to_draft`.
3. Reviewer notes are mandatory for operational traceability.
4. Version history is appended on each transition.
5. Only `approved` content enters recommended publish priority.

## Asset Workflow
1. Upload media through `/internal/content-ops` Asset Library panel.
2. Edit metadata (`tags`, `service_type`, `safe_for_public`, `notes`).
3. Bind to `topic`, `script`, `post-plan` at upload time.
4. Filter by service type, tags, before/after, B-roll, talking-head compatibility.
5. Use missing-asset alerts before filming.

## Execution Workflow
1. Daily task board tracks status: planned → filmed → edited → posted → reviewed.
2. Ops action flags: comments replied / DMs handled / hot lead escalated.
3. Team checks in completed items for daily accountability.
4. Dashboard shows total, completed, incomplete, and bottleneck stage.

## Performance Import Guide
1. Import via CSV file upload or sheet-style TSV input.
2. Validation checks required columns + enum constraints.
3. Import updates aggregation, 5-day review, and dashboard alerts.
4. Google Sheet readonly adapter accepts `sheet_id` + `range` + optional mock TSV.

## Monetization Operating Guide
1. Every post has execution labels: lead_capture / affiliate / sponsor_safe / education_only.
2. Stage-driven CTA recommendation remains lead-first by default.
3. Manual override is supported per post.
4. Affiliate/Sponsor content must keep disclosure + local trust guardrail.
5. lead_capture routes prioritize website/form/DM/phone handoff to human.
