# Project plan: SEO Lens

## Brief

**Type:** Marketing and SEO tool

**Problem:** A page owner needs an understandable first-pass checklist before commissioning a full technical review.

**Audience:** A content editor or junior SEO practitioner inspecting page source they already have.

## Experience flow

1. Arrive at a direct, descriptive introduction.
2. Review the sample interface and its scope before interacting.
3. Try the core control: Audit pasted HTML locally with eight explainable checks.
4. See a local result or demonstration state without sending a request to a service.

## Interaction

DOMParser checks title, description, H1 count, image alt attributes, canonical URL, language, viewport and noindex directives; findings are prioritized and scored as checklist coverage.

## Key design decision

Keep source local, explain each check and label the score as coverage rather than a ranking prediction.

## Boundaries

No crawling, rendering, schema analysis or search-engine ranking assessment; HTML parsing is heuristic.

The tool is intentionally transparent about its input, assumptions and limits. It is a front-end educational prototype, not a substitute for platform data, professional review or controlled measurement.

## Next iteration

Add explicit export of findings and expand documented checks with fixtures from controlled examples.

## Learning goals

- Structure a complete page with meaningful headings, landmarks and labelled controls.
- Separate visual rules in CSS from interaction logic in JavaScript.
- Make states understandable with keyboard controls and live status text.
- Document assumptions and the boundary between a helpful prototype and a production service.
