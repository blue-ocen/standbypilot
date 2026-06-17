# Product Decisions After Testing

After testing the five trips, make these decisions before writing production code.

## 1. Is the Battle Card the right core output?

Keep it if testers say:

- “This makes the trip clearer.”
- “I would use this at the airport.”
- “The switch-plan triggers are helpful.”

Change it if testers say:

- “This is too generic.”
- “I still do not know what to do.”
- “The risk score does not match how non-rev actually feels.”

## 2. Does the scoring model need more inputs?

Likely next inputs:

- Number of useful flights remaining that day.
- Whether the route has a same-day recovery option.
- Whether the final leg is the last flight of the day.
- Whether the traveler has fixed hotel/event/cruise loss.
- Whether the traveler can position to another airport.
- Whether pass priority is strong or weak on the selected airline.

## 3. What should v2 add?

Do not jump straight to a mobile app. v2 should add:

1. Better route graph logic.
2. Manual same-day flight list.
3. Rescue fare field.
4. Airport survival notes.
5. PDF export.
6. Basic user accounts and saved trips through Supabase.

## 4. What not to build yet

Do not build these until the Battle Card is validated:

- Community load-sharing.
- Full mobile app.
- Live airline load integrations.
- Booking engine.
- Complex map UI.

The product wins if it becomes a trusted decision layer first.
