# Master content map: 400 questions

One architecture, one keyword map. Every question from the four briefs is mapped to a live page in:

| Batch | Questions | Map | Answered on live pages |
|---|---|---|---|
| 1 | Prices, best laptops, brands, specs, students, gaming, refurbished, buying, repairs, where to buy | [question-map.md](question-map.md) | 94 / 100 |
| 2 | Models, processors, upgrades, software, displays, professions, MacBooks, gaming GPUs, accessories, buying safely | [question-map-2.md](question-map-2.md) | 96 / 100 |
| 3 | Budgets, troubleshooting, security, Wi-Fi, specs, small business, comparisons, maintenance, ports, refurbished | [question-map-3.md](question-map-3.md) | 100 / 100 |
| 4 | Students, creative, displays, hardware compatibility, software, charging, verification, specialist software, product families, procurement | [question-map-4.md](question-map-4.md) | 100 / 100 |

**390 of 400 answered.** The 10 not published: ASUS and Acer (not stocked), repair prices and repair services (not confirmed by the shop), brand-new stock (no condition data), and prices of parts the shop doesn't sell (RAM, SSD, battery, charger).

## Architecture

- **Pillars:** /learn/laptop-buying-guide-kenya (buying), /student-laptops-kenya (students, flagship), /best/business-laptops-kenya and /learn/laptops-for-small-business-kenya (business), /learn/laptop-terms-explained (glossary), /guides (hub of all guides).
- **Commercial lists** (/best/, /laptops/, /compare/, /series/): generated from live stock, release-gated, overlap-checked (pseo.js).
- **Articles** (/learn/): articles.js; numbers from live stock; FAQ and section additions without a deploy via additions.json.
- **One page per intent:** a new question with an existing page's intent becomes a FAQ or section there (see the "Decision" column in each map).

## Tools

- `scripts/live-site/onpage-check.mjs`: on-page checklist for every guide.
- `scripts/live-site/gsc-page-gaps.mjs`, `gsc-opportunities.mjs`, `guide-templates.mjs`, `prune-guides.mjs`: Search Console loop.
- `scripts/live-site/page-additions.mjs`: publish additions.json.
