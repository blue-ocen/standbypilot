# StandbyPilot Next Product Moves

## Move 1: Test v1 with 5 real trips

Use the app to build Battle Cards for:

1. Seattle to Portugal
2. Domestic weekend trip
3. International trip with checked bag
4. Group trip of 4+
5. Deadline-sensitive trip such as wedding/cruise/work

Goal: find where the output feels helpful and where it feels generic.

## Move 2: Add route database

Add static airport and hub logic before paying for APIs.

Needed data:

- major airport code list
- nearby airports by city
- useful international gateways
- hub strength by region
- risky airport notes

## Move 3: Add trip outcomes

After each trip, record:

- cleared / did not clear
- bought rescue fare
- split group
- overnighted
- checked bag issue
- actual arrival delay

This will improve the scoring model more than theoretical guessing.

## Move 4: Build production app

Rebuild with:

- Next.js
- Supabase Auth
- Supabase Postgres
- RLS policies
- hosted battle cards
- shared read-only Battle Card links

## Move 5: Add data providers

Later integrations:

- flight schedule/status provider
- fare search provider
- airport guide data
- travel document provider

Avoid scraping airline employee systems or other restricted portals.
