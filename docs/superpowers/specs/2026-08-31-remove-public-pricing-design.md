# Remove public pricing content

## Goal
Remove every visitor-facing monetary amount and pricing-related statement from the Sanjeevani Dental Clinic website.

## Scope
- Scan every published HTML page, including treatment pages, FAQs, blog content, navigation, and structured data.
- Remove dedicated price sections, ranges, currency symbols, fees, costs, and price-related wording.
- Replace removed calls to action with neutral booking or contact prompts when needed to preserve page flow.
- Remove pricing-related schema fields and metadata that could surface in search.
- Preserve treatment descriptions, clinic details, navigation, booking links, and the shared header/footer structure.

## Out of scope
- Internal repository documents, such as README and content notes, unless they are deployed to visitors.
- Changes to clinical service descriptions unrelated to pricing.

## Validation
- Run the existing page validator: `node tools/check-pages.mjs`.
- Run a repository-wide scan of published HTML for currency markers and pricing terminology.
- Review the changed pages for valid markup and consistent calls to action.
