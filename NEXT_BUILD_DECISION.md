# Next Build Decision

After validation, choose one path.

## Path A: Manual concierge first

Choose this if testers like the plan but want human confidence and trip-specific judgment.

Build:

- Public landing page
- Intake form
- Manual fulfillment workflow
- Payment link
- PDF Battle Plan template

This is the safest business path because it tests willingness to pay without heavy engineering.

## Path B: Private web app first

Choose this if testers are comfortable self-serving and repeatedly editing trips.

Build:

- Hosted Next.js app
- Supabase auth
- Saved trips database
- Exportable Battle Cards
- Validation/outcome logging

This is the best product path if frequent non-rev travelers want a tool they can use often.

## Path C: Improve the decision engine

Choose this if testers say the product is useful but too generic.

Improve:

- Route specificity
- Hub ranking
- Domestic vs international logic
- Final-leg risk
- Last-flight trap detection
- Group splitting recommendations
- Paid rescue triggers

This is the correct path if trust or actionability scores are low.

## My recommendation

Run manual concierge and private app testing in parallel for a small group.

Use the current prototype to create Battle Cards, but deliver the final plan manually at first. That lets the product learn faster without pretending the engine is smarter than it is.
