# StandbyPilot Smoke Test Checklist

Use this checklist after restoring or changing the static prototype.

## File sanity checks

- `index.html` starts with `<!doctype html>`.
- `styles.css` starts with CSS/root/style rules.
- `app.js` parses as JavaScript.
- `app-core.js` parses as JavaScript.
- `battle-card.js` parses as JavaScript.
- `test_trips_seed.json` parses as JSON.
- `supabase_schema.sql` contains `create table` statements.

## Access gate smoke test

1. Open `index.html` in a fresh browser session.
2. Confirm the password gate appears before the main app.
3. Enter the prototype password and confirm the app unlocks.
4. Confirm the **Lock / Logout** button appears in the app header.
5. Click **Lock / Logout** and confirm the password screen returns.
6. Unlock again and continue the browser smoke test.

## Browser smoke test

1. Open `index.html` in a browser.
2. Confirm the page loads without missing `styles.css`, `app.js`, `app-core.js`, or `battle-card.js` errors in the console.
3. Click **Load Portugal Sample** and confirm a saved trip appears.
4. Click **Load 5 Test Trips** and confirm the validation trip suite appears in saved trips.
5. Open each saved trip and confirm risk score, risk badge, route cards, and Battle Card render.
6. Create a new trip, generate a Battle Plan, and save it.
7. Edit the saved trip and confirm the saved-trip status updates.
8. Add and remove a manual load check.
9. Copy the Battle Card and confirm clipboard fallback does not throw an error.
10. Use Print / Save PDF and confirm the printable Battle Card view appears.
11. Export trips as JSON.
12. Import the exported JSON and confirm trips are added without deleting existing trips.
13. Save validation feedback and confirm dashboard metrics update.

## Battle Card quality checks

1. Load the Portugal sample and generate a Battle Plan.
2. Confirm the Battle Card uses sections A-J from Final Recommendation through Bottom Line.
3. Confirm the Portugal sample includes international document notes, final-leg risk, backup route strategy, rescue fare guidance, and a blunt bottom line.
4. Load the 5 Test Trips and confirm each saved trip still opens and renders a detailed Battle Card.
5. Confirm the LAX to SEA domestic trip has lighter warnings than the international/event examples.
6. Confirm international, group, and deadline-sensitive trips have stronger warnings about documents, split-party strategy, arrival buffer, and rescue triggers.
7. Confirm **Copy Battle Card** copies the detailed report text.
8. Confirm **Print / Save PDF** still shows a clean printable Battle Card.

## GitHub Pages visual check

1. Open the GitHub Pages project URL.
2. Confirm the password gate appears.
3. Enter the prototype password and confirm the app unlocks.
4. Confirm styling applies: dark background, panels, badges, and spacing are visible.
5. Confirm buttons look styled, not browser-default.
6. Click **Load Portugal Sample** and confirm the sample trip loads.
7. Click **Generate / Update Battle Plan** and confirm the risk score, route cards, and Battle Card render.
8. Click **Lock / Logout** and confirm the password screen returns.

## Expected result

The app remains fully static and runnable by opening `index.html` or through GitHub Pages. No package install, build step, backend, or framework migration is required.
