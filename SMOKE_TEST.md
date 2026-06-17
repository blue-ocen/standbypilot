# StandbyPilot Smoke Test Checklist

Use this checklist after changing the static prototype.

## File sanity checks

- `index.html` starts with `<!doctype html>` and is the public landing page.
- `login.html` starts with `<!doctype html>` and is the visual-only prototype login mock.
- `app.html` starts with `<!doctype html>` and contains the working app shell.
- `app.html` links `./styles.css`, references `./battle-card.js`, and loads `./app.js` with relative paths.
- `styles.css` starts with CSS/root/style rules.
- `app.js` parses as JavaScript.
- `app-core.js` parses as JavaScript.
- `battle-card.js` parses as JavaScript.
- `test_trips_seed.json` parses as JSON.
- `supabase_schema.sql` contains `create table` statements.

## Landing page smoke test

1. Open `index.html` in a browser.
2. Confirm the landing page headline says **Smarter non-rev travel decisions.**
3. Confirm the subtitle says **StandbyPilot helps pass travelers compare route risk, backup options, switch triggers, and rescue plans before heading to the airport.**
4. Confirm the page has CTAs for **Open Prototype** and **Request Concierge Battle Plan**.
5. Confirm the landing page sections mention Recommended Route, Backup Strategy, Route Rating, Switch Triggers, and Manual Concierge Beta.
6. Confirm the disclaimer says StandbyPilot does not guarantee boarding, seat availability, or airline outcomes.
7. Click **Open Prototype** and confirm it opens `login.html`.
8. Click **Request Concierge Battle Plan** and confirm it jumps to the concierge section.
9. Confirm the page nav includes Home, Prototype App, and Concierge Beta.

## Login mock smoke test

1. Open `login.html` in a browser.
2. Confirm it clearly says prototype access only and no real authentication.
3. Confirm email and password fields appear for visual design only.
4. Confirm the note says **Prototype login only. Do not enter real passwords.**
5. Click **Continue to Prototype** and confirm it opens `app.html`.
6. Confirm the page nav includes Home, Prototype App, and Concierge Beta.

## App smoke test

1. Open `app.html` in a browser.
2. Confirm the app loads without missing `styles.css`, `app.js`, `app-core.js`, or `battle-card.js` errors in the console.
3. Confirm the app nav includes Home, Prototype App, and Concierge Beta.
4. Click **Load Portugal Sample** and confirm a saved trip appears.
5. Confirm the trip summary card updates with Origin to Destination, trip name, risk color/score, final call, travelers, bags, scope, and primary goal.
6. Click **Load 5 Test Trips** and confirm the validation trip suite appears in saved trips.
7. Open each saved trip and confirm risk score, risk badge, route cards, and Battle Card render.
8. Confirm route results show visually distinct cards for Recommended Route, Plan B, Plan C, and rescue/alternate notes when available.
9. Create a new trip, generate a Battle Plan, and save it.
10. Edit the saved trip and confirm the saved-trip status updates.
11. Add and remove a manual load check.
12. Expand and collapse each More Details section: Risk factors, Nearby airports, Connection risk, Paid rescue logic, Airline rule notes, and Travel document reminders.
13. Copy the Battle Card and confirm clipboard fallback does not throw an error.
14. Use Print / Save PDF and confirm the printable Battle Card view appears.
15. Export trips as JSON.
16. Import the exported JSON and confirm trips are added without deleting existing trips.
17. Save validation feedback and confirm dashboard metrics update.

## Battle Card quality checks

1. Load the Portugal sample and generate a Battle Plan.
2. Confirm the Portugal sample scope is International, not Domestic.
3. Confirm the Portugal sample does not show Green/24 for a SEA to Portugal summer trip with final-leg risk.
4. Confirm the Battle Card uses these sections: Final Call, Risk Snapshot, Best Plan, Backup Moves, Switch Triggers, Travel Rules, Bottom Line.
5. Confirm the Battle Card has clean printable spacing, heading weights, and bullet spacing without getting longer.
6. Confirm the Portugal sample Battle Card fits mostly on one printed page.
7. Confirm international trips include the compact passport, visa/transit, onward/return proof, and entry-requirements reminder.
8. Confirm domestic trips keep lighter warnings than international/group/deadline trips.
9. Confirm **Copy Battle Card** copies the concise card text.
10. Confirm **Print / Save PDF** still shows a clean printable Battle Card.

## Validation smoke test

1. Confirm the validation section appears lower on `app.html` below the Battle Card workflow.
2. Select clarity, trust, actionability, stress reduction, and pay scores.
3. Click **Save Validation** and confirm the validation status and metrics update.
4. Click **Validation** in the app action row and confirm it scrolls to the lower validation section.

## GitHub Pages visual check

1. Open the GitHub Pages project URL.
2. Confirm GitHub Pages serves the landing page first.
3. Confirm `login.html` loads as a static login mock.
4. Confirm `app.html` loads the working prototype.
5. Click **Load Portugal Sample** and confirm the sample trip loads.
6. Click **Generate / Update Battle Plan** and confirm the risk score, route cards, trip summary card, expandable details, and concise Battle Card render.
7. Confirm Copy, Print / Save PDF, Export / Import JSON, and Validation still work.

## Expected result

The app remains fully static and runnable through GitHub Pages. No package install, build step, backend, auth system, payment processing, API, or framework migration is required.
