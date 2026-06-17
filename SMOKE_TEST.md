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

## Airport autocomplete smoke test

1. Open `app.html` in a browser.
2. Type `Seattle` in Origin and confirm `SEA` appears as a suggestion.
3. Select `SEA` and confirm the helper text shows Seattle, United States.
4. Type `Lisbon` in Destination and confirm `LIS` appears as a suggestion.
5. Type `Portugal` in Destination and confirm `LIS`, `FAO`, and `OPO` appear as suggestions.
6. Select `LIS` and confirm scope auto-detects as International.
7. Enter `SEA` to `JFK` and confirm scope auto-detects as Domestic.
8. Enter an unknown destination and confirm the note says **Scope could not be detected. Choose domestic or international for better accuracy.**
9. Manually choose Domestic or International from More details and confirm the scope note updates.

## App smoke test

1. Open `app.html` in a browser.
2. Confirm the app loads without missing `styles.css`, `app.js`, `app-core.js`, or `battle-card.js` errors in the console.
3. Confirm the 3-step progress indicator appears: Trip, Loads, Routes.
4. Fill only required Trip Basics: origin, destination, earliest departure, must-arrive-by, one-way/roundtrip, trip type, and willing to connect.
5. Click **Generate Route Brief** and confirm results generate without load data.
6. Confirm the no-load note appears: **Risk is based on route, timing, flexibility, and trip type. Add load tracking for a sharper rating.**
7. Confirm the **Why this rating?** panel appears with risk grade, score, top risk drivers, top risk reducers, and confidence note.
8. Confirm the risk drivers and reducers show no more than 3 bullets each.
9. Confirm route cards show route name, route rating, short reason, and switch trigger.
10. Confirm route-card ratings include labels such as **Best Overall**, **Safer Backup**, **Faster but Riskier**, **Good Alternate Airport Play**, or **Last Resort**.
11. Add optional load tracking: open seats, standby count, cabin notes, and last checked time.
12. Click **Add load check** and confirm the load check appears in the log.
13. Generate again and confirm the confidence note changes to **Load notes included. Recheck close to departure before relying on this route.**
14. Confirm Route Results include Final Call, Risk Grade, Recommended Route, Backup Routes, Switch Trigger, Why This Rating, and More Details.
15. Confirm route cards appear for Recommended Route, Backup Route 1, Backup Route 2, and Alternate Airport when available.
16. Confirm nearby airport suggestions appear in results, such as **Nearby alternatives: PDX, YVR** or **Portugal alternatives: LIS, FAO, OPO**.
17. Expand and collapse More Details.
18. Click **Load Portugal Sample** and confirm it detects International, generates a Route Brief, and shows the risk explanation panel.
19. Click **Load 5 Test Trips** and confirm saved routes are added.
20. Open the NYC test route and confirm it detects Domestic and still shows route ratings.
21. Open the Nairobi test route and confirm it detects International and still shows route ratings.
22. Save a route, reopen it from Saved Routes, and confirm it loads.
23. Export routes as JSON.
24. Import the exported JSON and confirm routes are added without deleting existing routes.
25. Copy the Route Brief and confirm clipboard fallback does not throw an error.
26. Use Print and confirm the printable Route Brief view appears.

## GitHub Pages visual check

1. Open the GitHub Pages project URL.
2. Confirm GitHub Pages serves the simplified landing page first.
3. Confirm `login.html` loads as a static login mock.
4. Confirm `app.html` loads the 3-step route decision tool.
5. Confirm airport autocomplete, risk explanation, route ratings, load tracking, copy, and print still work.
6. Confirm no concierge service sections or CTAs appear.

## Expected result

The app remains fully static and runnable through GitHub Pages. No package install, build step, backend, auth system, payment processing, API, live flight data, concierge service, or framework migration is required.
