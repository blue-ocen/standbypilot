# StandbyPilot Validation Playbook

## Goal

Prove whether the Non-Rev Battle Card is useful enough that a traveler would rely on it before going to the airport.

This phase is not about beautiful UI. It is about whether the product creates a better decision.

## Test group

Start with 5 to 10 people:

- Airline employees who non-rev
- Eligible pass riders
- Buddy-pass travelers
- Travelers who have been stranded before
- People planning international trips with flexible travel dates

## Test script

Give the tester one trip scenario and ask them to read the Battle Card.

Then ask:

1. What would you do after reading this?
2. Did the plan make the trip feel more manageable?
3. What part felt most useful?
4. What part felt vague or wrong?
5. Would you trust this before going to the airport?
6. Would you pay for a custom version of this plan?
7. What price would feel fair for one trip?

## Validation scores

Score each Battle Card from 1 to 5:

- Clarity: Is the plan easy to understand?
- Trust: Would they rely on it?
- Actionability: Does it tell them what to do next?
- Stress reduction: Does it reduce uncertainty?
- Willingness to pay: Would they pay for this?

## Minimum useful signal

A trip passes validation if average score is at least 4.0 and actionability is at least 4.

The product passes this stage if at least 3 of 5 trips pass.

## What to watch for

Strong signal:

- “I would use this before every non-rev trip.”
- “The switch triggers are helpful.”
- “This would have saved me last time.”
- “I would pay for an international version.”

Weak signal:

- “This is obvious.”
- “I still need to figure everything out myself.”
- “It does not know enough about loads.”
- “The route advice is too generic.”

## Decision after testing

If the feedback is strong, build a private hosted version with accounts and saved trips.

If the feedback is mixed, improve the Battle Card logic before building infrastructure.

If the feedback is weak, pivot toward a manual concierge service where a human reviews every plan.
