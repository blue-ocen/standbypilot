# Codex Handoff — StandbyPilot

## One-sentence brief
StandbyPilot is a non-rev travel decision assistant that turns standby trip details into a route strategy, risk score, backup plan, switch-plan triggers, and printable Battle Card.

## What has already been built
The current artifact is `StandbyPilot v1.2 Validation Dashboard`, a static web prototype with:

- Trip intake
- Saved trips through browser localStorage
- Manual load-check log
- Risk scoring engine
- Route strategy generator
- Battle Card output
- 5 test trips
- Validation dashboard for clarity, trust, actionability, stress reduction, and willingness to pay
- Supporting product docs and Supabase starter schema

## Product direction
The next build should not jump straight into a full production app unless validation proves demand. The current focus is to improve the validation prototype so real airline/non-rev users can test whether the Battle Card is useful.

## What Codex should do first
Suggested first task:

> Review the StandbyPilot static prototype. Refactor the JavaScript into cleaner modules while preserving current behavior. Add a lightweight test checklist or simple browser-based smoke test. Improve the Battle Card export so it can generate clean Markdown. Do not migrate to Next.js yet. Keep the app runnable by opening `index.html`.

## Product rules
- StandbyPilot is a decision system, not a booking platform.
- Do not promise guaranteed boarding.
- Do not scrape airline employee systems, StaffTraveler, myIDTravel, ID90, or FlightConnections.
- Treat manual load input as user-provided context.
- Risk scoring should be transparent and explainable.
- The output should tell the traveler what to do next, not just list flights.

## Future build path
1. Polish v1.2 validation dashboard.
2. Run 5–10 real non-rev test plans.
3. Decide whether to launch concierge MVP, hosted private app, or both.
4. If validation passes, migrate to Next.js + Supabase.
5. Later add flight schedule/status APIs, paid fallback fare search, airport survival guides, and account-based saved trips.

## Suggested Codex prompts

### Prompt 1 — Codebase audit
Review this repository and summarize the current architecture, main files, data flow, and the safest next engineering improvements. Do not modify files yet.

### Prompt 2 — Refactor static app
Refactor `app.js` into smaller logical sections or modules while keeping the app runnable as a static site. Preserve all current behavior, including saved trips, sample trips, validation scores, manual load logs, copy, print, export, and import.

### Prompt 3 — Improve Battle Card export
Add a clean Markdown export for the Battle Card. The exported Markdown should include trip overview, risk score, route strategy, switch-plan triggers, load notes, validation notes, and final recommendation.

### Prompt 4 — Add smoke test checklist
Create a `SMOKE_TEST.md` file with manual test steps for the current static app. Include tests for loading sample trips, creating a new trip, saving, editing, exporting, importing, printing, copying Battle Card, and scoring validation.

### Prompt 5 — Prepare for Next.js later
Create a `MIGRATION_PLAN_NEXTJS_SUPABASE.md` file that explains how to migrate this static prototype into a production Next.js + Supabase app without losing the current product logic.
