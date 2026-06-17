# StandbyPilot v1.1 Test Suite

This version adds five realistic non-rev trip examples so the product can be judged against different standby situations instead of only one Portugal case.

## Goal

Validate whether the Battle Card output is useful, believable, and action-oriented.

The product should answer three questions for each trip:

1. What is the risk?
2. What are the best route/back-up moves?
3. When should the traveler switch plans or buy confirmed?

## Five test trips

| # | Test trip | Purpose | Expected behavior |
|---:|---|---|---|
| 1 | Portugal / Algarve Summer Trip | International summer leisure, group of 4, no SEA nonstop to Portugal/Algarve | Should flag Orange-ish risk, recommend leaving early, carry-on only, Europe gateway strategy, and willingness to buy final intra-Europe leg. |
| 2 | London Group Trip / Southwark Park | Strong nonstop route but group-size pressure | Should not over-panic. Should show Yellow risk, prioritize nonstop SEA-LHR, but keep Europe backup hubs. |
| 3 | Nairobi 2-Day Efficiency Run | Long-haul international with gateway dependency | Should flag that solo travel helps, but route complexity matters. Should recommend gateway strategy and a paid final-leg rescue trigger. |
| 4 | Munich/Vienna Christmas Return | Holiday return, 2 travelers, partial baggage uncertainty, deadline pressure | Should show Orange risk and force a paid rescue/overnight-reset trigger. |
| 5 | LAX to SEA Late Return | Domestic route with many flights but tight late-night window | Should show Yellow risk and warn about last-flight/overnight risk despite strong city-pair frequency. |

## How to test

1. Open `index.html`.
2. Click **Load 5 Test Trips**.
3. Open each saved trip in the left sidebar.
4. Read the risk score, route cards, switch-plan triggers, and Battle Card.
5. Fill out `VALIDATION_FEEDBACK_FORM.md` for each trip.
6. Adjust the scoring model if the output feels too optimistic or too conservative.

## What we are looking for

A useful Battle Card should be:

- Clear enough to act on at the airport.
- Honest about risk without scaring the traveler unnecessarily.
- Specific about the next move.
- Strong on backup routes.
- Strong on when to stop waiting.
- Conservative when the trip has a hard deadline.

## Current scoring snapshot

| Test trip | v1.1 score | Risk |
|---|---:|---|
| Portugal / Algarve Summer Trip | 51 | Orange |
| London Group Trip / Southwark Park | 42 | Yellow |
| Nairobi 2-Day Efficiency Run | 50 | Yellow |
| Munich/Vienna Christmas Return | 65 | Orange |
| LAX to SEA Late Return | 45 | Yellow |

These are not final. They are the starting point for validation.
