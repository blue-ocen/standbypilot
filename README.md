# StandbyPilot v1 Private App Starter

StandbyPilot v1 is a browser-based private prototype for planning non-revenue standby travel.

## What changed from v0

v0 proved the Battle Card concept. v1 makes it reusable:

- Saved trips in browser localStorage
- Trip dashboard with average risk and load-check counts
- Manual load check log per trip
- Export/import trips as JSON
- Portugal sample trip
- Reusable risk scoring engine
- Route strategy generator
- Copyable and printable Non-Rev Battle Card

## How to run locally

Open `index.html` in a browser.

No install step is required.

## GitHub Pages workflow

The GitHub Actions workflow lives at `.github/workflows/pages.yml`.

On pull requests targeting `main`, pushes to `main`, and manual `workflow_dispatch` runs, the workflow checks the static prototype files, validates the `index.html` asset links, runs `node --check app.js`, parses `test_trips_seed.json`, and confirms `supabase_schema.sql` contains `create table` statements.

Deployment only runs after a successful push to `main`. The deploy job uploads the repository root as a static GitHub Pages artifact and publishes it with the official GitHub Pages Actions.

After deployment, open the workflow run in GitHub Actions and use the `github-pages` environment URL to view the published Pages site.

## How to host as a private prototype

Use one of these options:

1. **Simplest:** upload the folder to Netlify Drop or Vercel as a static site.
2. **Better private preview:** put it behind a password-protected page, Cloudflare Access, Netlify password protection, Vercel Authentication, or a private internal workspace.
3. **Production path:** rebuild this as a Next.js app with Supabase Auth and database storage.

## Important limitations

This prototype does **not**:

- connect to live airline loads
- scrape employee travel portals
- book flights
- verify visa/passport requirements in real time
- protect data if hosted publicly as a static site

Trips are saved only in the current browser unless exported/imported.

## Product thesis

Non-rev travelers do not only need flight options. They need a decision system:

- What route should I try first?
- How risky is this setup?
- What are my backup routes?
- When do I switch plans?
- When do I buy confirmed?

StandbyPilot should become the layer that turns fragmented travel information into a clear next move.
