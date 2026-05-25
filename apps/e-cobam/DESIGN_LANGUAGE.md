# e-cobam Design Language

## Positioning

e-cobam is the commerce face of COBAM GROUP: practical, premium, and technical enough for real construction purchases. The interface should feel like a trusted catalogue desk, not a generic storefront template.

## Core Principles

- **Commerce first:** every page should help users find, compare, save, or request products.
- **Technical clarity:** SKU, availability, price/devis state, documents, variants, and specifications must be easy to scan.
- **Premium restraint:** use contrast, spacing, material photography, and clean typography instead of decorative noise.
- **Mobile parity:** mobile navigation, product cards, filters, and product detail actions must feel intentional.
- **Truthful UX:** show real database data. If a backend model does not exist yet, expose a clear UI entry point without fake persistence.

## Visual System

- **Ink:** `#14202e` for primary text, premium dark surfaces, and high-emphasis controls.
- **Water blue:** `#0a8dc1` for commerce intent, links, focus states, and selected accents.
- **Brass:** `#b08a5a` as a warm premium secondary accent, used sparingly.
- **Paper:** `#fafaf7` for the global background.
- **Stone:** `#f1eee8` and `#e5ded2` for product image wells, empty states, and quiet panels.
- **Line:** `#dbe2ea` for soft borders.

The palette should not drift into a single blue theme. Use white, stone, ink, blue, and occasional brass together.

## Typography

- Display typography uses **Figtree** for larger commerce moments: hero headlines, section titles, and editorial emphasis.
- UI typography uses **Manrope** for commerce clarity: navigation, buttons, forms, badges, filters, labels, and dense product metadata.
- Product names and prices use **Manrope**, not the display font, because product discovery must stay crisp and readable.
- Avoid serif fonts in the ecommerce app.
- Headings should feel refined rather than heavy: use generous line-height, controlled letter spacing, and avoid oversized all-caps blocks.
- Product names should keep line length controlled so cards stay easy to scan.
- Utility labels use uppercase tracking only for metadata like SKU, brand, section labels, and filters.

## Layout & Spacing

- Use `.commerce-container` for page width rhythm: max `92rem`, responsive viewport gutters.
- Prefer large rounded sections (`1.5rem` to `2rem`) for commerce surfaces.
- Product cards use stable media ratios to prevent layout shift.
- Keep dense data in organized panels, not floating card stacks inside cards.

## Components

- **Header:** sticky, compact, searchable, with category navigation and cart entry.
- **Product cards:** image-first, price/devis, stock status, brand/category label, and strong hover affordance.
- **Catalog:** left filters on desktop, simple full-width search and sort controls.
- **Product detail:** large gallery, sticky commerce panel rhythm, variant sélection, attributes grouped by DB group, documents, and local cart action.
- **Cart and checkout:** server-backed guest cart, checkout sessions, and pending orders. Keep validation on the server and keep manual payment states honest until an online provider is integrated.

## Data Rules

- Product/category/brand/media data must come from the shared Prisma database.
- Media is served through the e-cobam `/api/media/:id/file` route and shared storage driver.
- Cart and checkout data must use the shared ecommerce Prisma models. Do not add fake payment capture before an online payment provider is integrated.
- If price is hidden or missing, display **Sur devis** instead of inventing a price.
- The homepage uses a resilient landing data helper. Category/product loading failures must stay inside the affected section, never become a full-page storefront error.
- Subcategory visibility flags should be respected when the database has the columns; until every environment is migrated, the landing page must still render real visible products without crashing.

## Homepage Rules

- The first viewport must make the commerce purpose obvious: catalogue, quote request, real product preview, and COBAM brand.
- Hero CTAs must always have visible text. Avoid icon-only or dark unlabeled actions.
- Category discovery can use taxonomy fallback links only when the database query fails or returns nothing; product cards should stay database-backed.
- Product preview sections should prefer real product imagery, then a neutral COBAM placeholder when no media exists.
- Product query errors should show a calm inline fallback such as “Impossible de charger les produits pour le moment.”

## Accessibility

- Controls need labels or visible text.
- Focus states use the water blue outline/ring.
- Product cards are full links with meaningful image alt text.
- Empty/error states should explain next steps.

## Extension Guidance

Future checkout/account work should keep the existing flow:

1. Product discovery in `/catalogue`.
2. Product confidence in `/produits/[slug]`.
3. Basket preparation in `/panier`.
4. Checkout turns the guest cart into a pending order; future authenticated account routes can reuse the same order model.

When adding new features, prefer small commerce-specific components and server-loaded data. Push client components only where state is truly interactive.
