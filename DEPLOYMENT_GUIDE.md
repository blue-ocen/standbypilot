# StandbyPilot Data Model v1

This is the current browser-side data model. Future Supabase/PostgreSQL tables should follow this shape.

## Trip

```json
{
  "id": "trip_...",
  "tripName": "Portugal / Algarve Summer Trip",
  "travelerName": "Robert",
  "origin": "SEA",
  "destination": "LIS / FAO / Portugal",
  "finalDestination": "Portimão / Praia da Rocha",
  "earliestDeparture": "2026-06-30T18:00",
  "mustArriveBy": "2026-07-02T18:00",
  "returnDate": "2026-07-07",
  "travelers": "4",
  "bags": "carry-on",
  "tripType": "event",
  "scope": "international",
  "connections": "yes",
  "nearbyAirports": "yes",
  "splitGroup": "maybe",
  "backupBudget": "1000",
  "passSystem": "Airline employee / non-rev pass access",
  "passPriority": "Enter priority when known",
  "priority": "highest-arrival-chance",
  "openSeats": "",
  "standbyCount": "",
  "cabinNotes": "",
  "loadNotes": "Manual load notes",
  "notes": "Trip notes",
  "score": 68,
  "riskLabel": "Orange",
  "loadChecks": [],
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

## Load Check

```json
{
  "id": "trip_...",
  "createdAt": "ISO datetime",
  "flight": "SEA-LHR / DLxxx",
  "openSeats": "8",
  "standbys": "4",
  "cabin": "Y 8, J full, 2 upgrades"
}
```

## Future production tables

- users
- trips
- route_options
- load_checks
- battle_cards
- outcomes
- airport_guides
- travel_requirements
- rescue_fares
