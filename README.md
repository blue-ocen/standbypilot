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

## Airport autocomplete and scope detection

The prototype includes a small local JavaScript airport dataset. It does not call live APIs or flight-data services.

Origin and destination fields support autocomplete by airport code, city, airport name, or country. For example:

- `Seattle` suggests `SEA`
- `Lisbon` suggests `LIS`
- `Portugal` suggests `LIS`, `FAO`, and `OPO`

When a suggestion is selected, StandbyPilot stores the airport code, name, city, country, and region in the saved route data. The app uses known origin and destination countries to auto-detect trip scope:

- matching countries = Domestic
- different countries = International
- unknown airport on either side = Unknown, with a prompt to choose domestic or international manually

The risk score uses that detected scope. International routes add risk and domestic routes avoid international document warnings.

The local dataset also powers concise nearby-airport alternatives, including SEA nearby (`PDX`, `YVR`), NYC nearby (`JFK`, `EWR`, `LGA`), Miami nearby (`MIA`, `FLL`), Portugal alternatives (`LIS`, `FAO`, `OPO`), London alternatives (`LHR`, `LGW`), and California alternatives (`SFO`, `LAX`).

## Risk explanation and route ratings

Route Results include a **Why this rating?** panel so users can see why the route is Green, Yellow, Orange, or Red. The panel shows the risk grade and score, the top three risk drivers, the top three risk reducers, and a confidence note.

Risk drivers and reducers come from the same static inputs used by the prototype: domestic/international scope, must-arrive window, trip type, connection flexibility, nearby-airport flexibility, load tracking, one-way simplicity, and paid rescue preference.

Route cards now include a route rating, short reason, and switch trigger. Ratings include Best Overall, Safer Backup, Faster but Riskier, Good Alternate Airport Play, and Last Resort.

## Refined route recommendation logic

The static route recommender now uses local-only heuristics to make route cards more specific without adding APIs, live loads, real seat availability, or prices.

- Domestic routes prefer destination-first nearby logic, so SEA to NYC can surface `JFK`, `EWR`, and `LGA` flexibility instead of unrelated origin alternates.
- International routes favor major gateway routing and call out final-leg recovery risk for Portugal, Nairobi, and other long-haul trips.
- No-connection requests warn when the local data does not know a direct route and recommend enabling connections or choosing a nearby destination airport.
- Tight arrival windows and deadline-sensitive trip types produce stronger switch triggers and earlier-departure guidance.
- Load tracking changes the wording: favorable open-seat margins improve confidence, while high standby pressure adds caution without guaranteeing boarding.
- Paid rescue preference can add a concise Paid Rescue Note when the user allows it and the route risk or deadline makes it relevant.

## More Details drawers

The main Route Brief stays intentionally short: Final Call, Risk Grade, Recommended Route, Backup Routes, and Switch Trigger.

Advanced route intelligence lives in collapsed More Details drawers below the route cards. Drawers include Risk factors, Nearby airports, Connection risk, Load tracking notes, Paid rescue logic, Airline rule reminders, and Travel document reminders.

Drawer content is based only on local/static inputs and the local airport dataset. It does not use live flight data, real-time seat data, restricted airline rules, or real prices.

## Paid rescue preference

The More details area includes a **Paid rescue preference** selector:

- **Recommend when smart:** adds concise paid-rescue wording for Yellow, Orange, or Red routes.
- **Only for deadline risk:** adds buy-confirmed trigger language only for deadline-sensitive trips such as wedding, cruise, work, event, family urgency, or tight arrival windows.
- **Do not recommend paid tickets:** removes confirmed-ticket suggestions and recommends lower-risk non-rev tactics instead.

This setting only changes route guidance wording and risk explanation labels. StandbyPilot does not show real prices, sell tickets, process payments, or connect to booking systems.

## Trip Outcome Tracker

The Outcome Tracker is a secondary local-only section below saved routes. For each saved trip, users can record whether they cleared, followed the recommended route, switched to a backup, bought a confirmed ticket, overnighted, arrived on time, and how useful the recommendation was.

Outcome records are stored on the saved trip in browser local storage. They survive refresh and are preserved by the existing route JSON export/import flow.

The tracker also shows lightweight validation insight: average usefulness score, completed outcome count, and counts for risk too low, about right, and too high.

## Core product output

The Route Brief is the core product output. It is intentionally concise and airport-ready: final call, risk grade, recommended route, backups, switch trigger, paid rescue preference, and the reason behind the rating.

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
- show real ticket prices
- book flights
- guarantee boarding or seat availability
- verify visa/passport requirements in real time
- provide real authentication or account-based storage
- provide a concierge service
- process payments

Saved routes and outcomes live only in the current browser unless exported/imported.
