# AGENTS.md — StandbyPilot

## Project overview
StandbyPilot is a non-revenue travel decision assistant prototype. It helps airline employees, eligible pass riders, buddy pass travelers, and frequent standby travelers turn uncertain standby trips into a clear route plan, backup strategy, risk score, and printable Battle Card.

The current app is a static browser prototype using HTML, CSS, JavaScript, and localStorage. It does not connect to airline systems, scrape travel portals, or use live flight/load data.

## Product principle
Do not build another flight search engine or booking site. StandbyPilot's core value is the decision layer:

- What is the best non-rev route strategy?
- What are the backup routes?
- What is the trip risk?
- When should the traveler switch plans?
- When should they buy a confirmed fallback?
- What should they avoid, such as checked bags, last-flight traps, or tight connections?

## Current version
Version: v1.2 Validation Dashboard

Current features:
- Trip intake form
- Saved trips in localStorage
- 5 sample validation trips
- Risk scoring model
- Route strategy generator
- Manual load log
- Printable/copyable Battle Card
- Validation scoring dashboard
- Tester notes and product decision documents

## Important files
- `index.html`: static app shell
- `styles.css`: styling
- `app.js`: app logic, state, scoring, rendering, localStorage
- `test_trips_seed.json`: 5 sample test trips
- `supabase_schema.sql`: future backend starter schema
- `README.md`: current version overview
- `SCORING_MODEL.md`: risk model documentation
- `VALIDATION_PLAYBOOK.md`: how to test the product
- `CONCIERGE_MVP_OFFER.md`: manual-service version of the product
- `NEXT_BUILD_DECISION.md`: decision logic for next build direction

## Coding guidelines
- Keep the product plainspoken and practical.
- Favor clear traveler decisions over fancy UI.
- Do not add fake guarantees or exact clearance probabilities unless the user supplies real load data.
- Do not scrape StaffTraveler, myIDTravel, ID90, airline employee portals, or FlightConnections.
- Use manual user-provided load inputs for now.
- Preserve privacy: do not store sensitive pass details unnecessarily.
- Keep the current static prototype working without a build step unless explicitly asked to migrate to Next.js.

## Validation goals
The prototype should help test whether users find the Battle Card:
- Clear
- Trustworthy
- Actionable
- Stress-reducing
- Worth paying for

Build forward only if validation scores support it.

## Recommended next engineering tasks
1. Split app logic into smaller modules while keeping the static prototype functional.
2. Add better test-trip comparison views.
3. Add exportable Battle Card markdown/PDF-friendly output.
4. Add local validation analytics summary.
5. Then migrate to Next.js + Supabase only after the v1.2 validation confirms demand.

## Testing commands
There is currently no build system or automated test runner. For now:
- Open `index.html` locally in a browser.
- Load the 5 sample trips.
- Create, edit, save, export, import, print, and score trips.
- Check browser console for JavaScript errors.

If you add a package manager or framework, update this file and `README.md` with exact install, run, test, and build commands.
