# ECB Technologies keyword map

Updated 2026-11-16. Next review by 2027-02-16 (every 3 months, or sooner after adding, merging or removing important pages).

- **60 keyword clusters**, each assigned to one page.
- Status: 52 mapped, 0 to optimize, 6 to create, 2 not targeted, 0 broken.
- Volume and KD% are empty on purpose. Fill them from Google Keyword Planner (Kenya) or Semrush; nothing here is estimated.

Files:
- `keyword-map.csv`: the map, with the Semrush template columns plus the audit. Import it into Google Sheets.
- `docs/seo/live-site/keyword-map.js`: the source.

## How to use it

1. **To optimize:** put the primary keyword naturally in the title, H1, meta description and first paragraph. Use cluster terms in subheadings and answer the AI prompts in the text.
2. **To create:** see the note for what is missing (usually stock or real content). Do not publish thin pages.
3. **Internal links:** use the target page's primary keyword, or a cluster variation, as anchor text.
4. **Every 3 months:**
   - Rerun `node scripts/live-site/keyword-map.mjs`.
   - In Search Console (Performance → Queries → Pages), check whether two pages get impressions for one cluster. If so, pick one page and change the other.
   - Add new clusters for new stock.

## Clusters that need work

- **ProBook** (HP ProBook price in Kenya): To create. Generated page fails the 900-word gate (20 models); covered by /laptops/hp-laptops-kenya meanwhile.
- **MacBook** (MacBook price in Kenya): To create. 12 MacBooks: series page fails the word gate and the Apple list duplicates the design page. /compare/macbook-vs-windows-laptops-kenya covers comparison intent only.
- **iPhone prices** (iPhone price in Kenya): To create https://www.ecbtechkenya.com/phones/iphone-price-kenya. 10 iPhones in stock.
- **Samsung prices** (Samsung phone price in Kenya): To create https://www.ecbtechkenya.com/phones/samsung-price-kenya. 17 Samsung phones and tablets in stock.
- **Google Pixel prices** (Google Pixel price in Kenya): To create https://www.ecbtechkenya.com/phones/google-pixel-price-kenya. 11 Pixels in stock.
- **iPad prices** (iPad price in Kenya): To create https://www.ecbtechkenya.com/phones/ipad-price-kenya. 10 iPads in stock.

## Cannibalization

- None: no other mapped page carries a cluster's main keyword in its title.
