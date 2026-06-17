# StandbyPilot v1 Static Route Prototype

StandbyPilot is a browser-based static prototype for quick non-rev route decisions.

## Static page structure

GitHub Pages serves `index.html` first.

- `index.html` = simplified landing page
- `login.html` = visual-only prototype login mock
- `app.html` = working 3-step StandbyPilot route decision app

The login page is not real authentication. It does not validate, store, or protect credentials. Do not enter real passwords.

## 3-step app flow

StandbyPilot now focuses on a fast, Flighty-inspired route check:

1. **Trip Basics:** origin, destination, earliest departure, must-arrive-by time, one-way/roundtrip, trip type, and connection flexibility.
2. **Load Tracking:** optional open seats, standby count, cabin notes, last checked time, and general load notes.
3. **Route Results:** final call, risk grade, recommended route, backup routes, switch trigger, why the rating was chosen, and optional more details.

If no load information is entered, the app still generates results and explains that risk is based on route, timing, flexibility, and trip type. Adding load tracking improves confidence.

The app assumes 1 traveler and carry-on by default. More details can improve the rating later, but the default experience stays short.

## Core product output

The Route Brief is the core product output. It is intentionally concise and airport-ready: final call, risk grade, recommended route, backups, switch trigger, and the reason behind the rating.

## How to run locally

Open `index.html`, `login.html`, or `app.html` in a browser.

No install step is required.

## Prototype privacy note

Do not paste restricted airline portal data, screenshots, sensitive traveler information, pass details, or private airline portal information into this prototype. Summarize only what you are comfortable sharing.

## GitHub Pages workflow

The GitHub Actions workflow lives at `.github/workflows/pages.yml`.

On pull requests targeting `main`, pushes to `main`, and manual `workflow_dispatch` runs, the workflow checks the static prototype files, validates the `app.html` static asset links, runs JavaScript syntax checks, parses `test_trips_seed.json`, and confirms `supabase_schema.sql` contains `create table` statements.

Deployment only runs after a successful push to `main`. The deploy job uploads the repository root as a static GitHub Pages artifact and publishes it with the official GitHub Pages Actions.

After deployment, open the workflow run in GitHub Actions and use the `github-pages` environment URL to view the published landing page.

## Important limitations

This prototype does **not**:

- connect to live airline loads
- scrape employee travel portals
- book flights
- guarantee boarding or seat availability
- verify visa/passport requirements in real time
- provide real authentication or account-based storage
- provide a concierge service
- process payments

Saved routes live only in the current browser unless exported/imported.
