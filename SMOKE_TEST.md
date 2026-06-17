# StandbyPilot Smoke Test Checklist

Use this checklist after changing the static prototype.

## File sanity checks

- `index.html` starts with `<!doctype html>` and is the simplified public landing page.
- `login.html` starts with `<!doctype html>` and is the visual-only prototype login mock.
- `app.html` starts with `<!doctype html>` and contains the 3-step route decision app.
- `app.html` links `./styles.css`, references `./battle-card.js`, and loads `./app.js` with relative paths.
- `styles.css` starts with CSS/root/style rules.
- `app.js` parses as JavaScript.
- `app-core.js` parses as JavaScript.
- `battle-card.js` parses as JavaScript.
- `test_trips_seed.json` parses as JSON.
- `supabase_schema.sql` contains `create table` statements.

## Landing page smoke test

1. Open `index.html` in a browser.
2. Confirm the headline says **Smarter non-rev route decisions.**
3. Confirm the subtitle says **Enter your trip, add optional load notes, and get route risk with backup options in minutes.**
4. Confirm the CTAs are **Open Prototype** and **View Sample Route**.
5. Confirm there are no Manual Concierge Beta or concierge CTA references.
6. Confirm the sample route preview appears.

## Login mock smoke test

1. Open `login.html` in a browser.
2. Confirm it clearly says prototype access only and no real authentication.
3. Confirm email and password fields appear for visual design only.
4. Confirm the note says **Prototype login only. Do not enter real passwords.**
5. Click **Continue to Prototype** and confirm it opens `app.html`.
6. Confirm there is no concierge link.

## App smoke test

1. Open `app.html` in a browser.
2. Confirm the app loads without missing `styles.css`, `app.js`, `app-core.js`, or `battle-card.js` errors in the console.
3. Confirm the 3-step progress indicator appears: Trip, Loads, Routes.
4. Fill only required Trip Basics: origin, destination, earliest departure, must-arrive-by, one-way/roundtrip, trip type, and willing to connect.
5. Click **Generate Route Brief** and confirm results generate without load data.
6. Confirm the no-load note appears: risk is based on route, timing, flexibility, and trip type; add load tracking for a sharper rating.
7. Add optional load tracking: open seats, standby count, cabin notes, and last checked time.
8. Click **Add load check** and confirm the load check appears in the log.
9. Generate again and confirm the risk grade/rating reflects the load snapshot.
10. Confirm Route Results include Final Call, Risk Grade, Recommended Route, Backup Routes, Switch Trigger, Why This Rating, and More Details.
11. Confirm route cards appear for Recommended Route, Backup Route 1, Backup Route 2, and Alternate Airport when available.
12. Expand and collapse More Details.
13. Click **Load Portugal Sample** and confirm it generates an international route brief.
14. Click **Load 5 Test Trips** and confirm saved routes are added.
15. Save a route, reopen it from Saved Routes, and confirm it loads.
16. Export routes as JSON.
17. Import the exported JSON and confirm routes are added without deleting existing routes.
18. Copy the Route Brief and confirm clipboard fallback does not throw an error.
19. Use Print and confirm the printable Route Brief view appears.

## GitHub Pages visual check

1. Open the GitHub Pages project URL.
2. Confirm GitHub Pages serves the simplified landing page first.
3. Confirm `login.html` loads as a static login mock.
4. Confirm `app.html` loads the 3-step route decision tool.
5. Confirm no concierge service sections or CTAs appear.

## Expected result

The app remains fully static and runnable through GitHub Pages. No package install, build step, backend, auth system, payment processing, API, live flight data, concierge service, or framework migration is required.
