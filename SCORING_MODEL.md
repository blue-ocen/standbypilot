# Route Source Notes

These are route assumptions used to shape the five validation examples. They are not live load data and should not be treated as airline clearance probability.

## Portugal / Algarve

- SEA to Lisbon does not currently have nonstop service; route options require at least one stop.
- SEA to Faro does not currently have nonstop service; common stopover gateways include London Heathrow, Amsterdam, and Frankfurt.
- Product implication: use a major Europe gateway first, then treat LIS/FAO as flexible arrival targets.

## London

- SEA to London Heathrow has multiple nonstop operators.
- Product implication: the route itself is strong, but a group of four still requires a backup and split-party logic.

## Nairobi

- SEA to Nairobi does not currently have nonstop service.
- Nairobi can be reached through major gateways such as Amsterdam, Frankfurt, Paris, Istanbul, Doha, Dubai, or JFK depending on airline access.
- Product implication: route complexity should add risk even for a solo traveler.

## Munich/Vienna Christmas Return

- Seattle has direct Europe service including Munich, but holiday return windows are deadline-sensitive and loads can be unforgiving.
- Product implication: the app should recommend multiple Europe gateway exits and a paid rescue trigger.

## LAX to SEA Late Return

- LAX to SEA has multiple nonstop operators.
- Product implication: frequency helps, but late-night travel windows still create last-flight risk.

## Important

This prototype intentionally does not scrape employee travel systems, airline pass portals, StaffTraveler, myIDTravel, or ID90. Manual load inputs are user-provided.
