# StandbyPilot Smoke Test Checklist

Use this checklist after restoring or changing the static prototype.

## File sanity checks

- `index.html` starts with `<!doctype html>`.
- `styles.css` starts with CSS/root/style rules.
- `app.js` parses as JavaScript.
- `test_trips_seed.json` parses as JSON.
- `supabase_schema.sql` contains `create table` statements.

## Browser smoke test

1. Open `index.html` in a browser.
2. Confirm the page loads without missing `styles.css` or `app.js` errors in the console.
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

## Expected result

The app remains fully static and runnable by opening `index.html`. No package install, build step, backend, or framework migration is required.
