# StandbyPilot Risk Engine v1

The v1 risk engine is a rules-based model. It is intentionally simple so users can understand why a trip was graded a certain way.

## Base score

Every trip starts at 25.

## Risk additions

- +10 international trip
- +15 summer Europe demand, when detected
- +15 deadline-sensitive trip purpose
- +15 must-arrive deadline within 24 hours
- +5 per traveler after traveler #1, capped at +25
- +15 checked bag
- +8 mixed or uncertain bags
- +10 unwilling to connect
- +10 unwilling to use nearby airports
- +10 unwilling to split group with party size greater than 1
- +10 no stated backup budget
- +20 manual load input shows more demand than likely open seats

## Risk reductions

- -10 useful travel buffer of roughly 48+ hours
- -5 carry-on only
- -5 willingness to connect
- -10 nearby-airport flexibility
- -10 willing to split group
- -3 maybe willing to split group
- -10 backup budget of $1,000+
- -5 backup budget of $500+
- -15 healthy manual seat margin
- -5 workable manual seat margin

## Bands

| Score | Risk | Meaning |
|---:|---|---|
| 0-25 | Green | Good setup if loads hold |
| 26-50 | Yellow | Reasonable, monitor closely |
| 51-75 | Orange | Risky; backup matters as much as Plan A |
| 76-100 | Red | Do not rely on standby if arrival truly matters |

## Near-term improvement ideas

1. Separate route risk from load risk.
2. Add airport reliability data.
3. Add peak date/holiday calendars.
4. Add trip outcome tracking to tune weights.
5. Add party-clearance probability based on historical manual load checks.
