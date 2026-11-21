# Ranking without backlinks: the weekly loop

The process: target questions almost nobody competes for, publish a small
set of good pages, then improve them every week from Search Console data.
What's in place on the site, and the weekly routine.

## 1. Keywords: low-competition questions

No keyword tool (Ahrefs, Semrush) is connected here, so the starting set
comes from questions buyers ask in the shop and on WhatsApp, and from what
the catalogue can answer with real numbers. Published so far:

- 8 buying-advice articles under `/learn/` (processor generations, how much
  RAM, 256 vs 512 GB SSD, used-laptop checklist, ThinkPad / EliteBook /
  Latitude models explained, touchscreen worth it). Source:
  `docs/seo/live-site/articles.js`.
- About 140 buying guides (budget, brand, processor, model prices, model
  alternatives, comparisons), released 15 a day.

When a keyword tool is available, ask it (or Claude with the tool
connected) for: matching and related terms for seeds like "laptop Kenya",
"ex-UK laptop", "ThinkPad", "EliteBook", "student laptop"; filtered to KD
0–5 and volume 0–50; grouped by intent (one page per group); with the
suggested page type. Add new groups to `docs/seo/live-site/keyword-map.js`
and, for questions, as new entries in `articles.js`.

The best free source is your own Search Console data once pages get
impressions: `node scripts/live-site/gsc-opportunities.mjs Pages.csv
Queries.csv` lists question-style searches the site already shows up for.

## 2. Check the search intent before writing

Search the keyword on Google (logged out) and look at the top results:
landing page, listicle, how-to or comparison. Build the format Google
already rewards. Our templates map to these formats: `/best/` = listicle,
`/compare/` = comparison, `/learn/` = how-to / explainer, model and brand
pages = landing/price pages.

## 3. Every week (from 7 days after a page goes live)

For each page that has impressions:

1. **Export its queries.** Search Console → Performance → Search results →
   "+ New" → Page → exact URL → Last 7 days (28 for low-traffic pages) →
   Export → CSV. Use `Queries.csv` from the download.
2. **Find the gaps:**
   `node scripts/live-site/gsc-page-gaps.mjs <page URL> Queries.csv`
   It lists queries the page doesn't mention and queries in positions 10–30,
   says where to add each (FAQ entry, new section or a sentence tweak), and
   prints a starter block.
3. **Write the additions** in `docs/seo/live-site/additions.json` (replace
   every TODO with a real answer; keep answers short and factual).
4. **Publish without a deploy:** `node scripts/live-site/page-additions.mjs`
   (dry run), then `--apply`. The page updates within about 5 minutes; its
   FAQ structured data includes the new questions.
5. **Ask for a recrawl:** Search Console → URL inspection → paste the URL →
   Request indexing. (New pages are also sent to Bing and Yandex through
   IndexNow automatically when they go live.)
6. Wait 7 days and repeat.

For a template's own text (rather than one page), change the generator in
`pseo.js` or `articles.js` and deploy.

## 4. Every month

- `node scripts/live-site/gsc-opportunities.mjs Pages.csv Queries.csv`:
  pages with high impressions but low CTR (rewrite title and description),
  pages on page 2, pages losing clicks (export with Compare on).
- `node scripts/live-site/guide-templates.mjs Pages.csv`: impressions per
  template. Scale the templates that earn impressions; turn off the ones
  that don't (`--disable <template>`).
- Build 2–5 backlinks (see `docs/seo/backlinks.md`).

## 5. After 90 days

`node scripts/live-site/prune-guides.mjs Pages.csv --apply` noindexes guide
pages that have been live 90+ days with no impressions. Review the whole
plan after 3 months; expect results in 3–12 months.
