# Live site (GeniusCart) product SEO tools

Used on www.ecbtechkenya.com, the GeniusCart shop. This is not the Next.js app in
this repo.

1. `crawl.py OUT.jsonl`: reads every public product page (name, price, id,
   address, current SEO).
2. `generate_v2.py IN.jsonl OUT.json OUT.csv`: writes, from facts only:
   - a meta description with price + location
   - 6 meta tags (model, price in Kenya, brand+category Nairobi, Nairobi CBD,
     price band)
   - product tags (price band, brand, use case)
   - a "price in Kenya" intro paragraph
3. `runner_v2.js DATA.json CRAWL.jsonl LOG.jsonl`: logs in to the admin with
   `ECB_EMAIL` / `ECB_PASSWORD` from the environment. For each product it opens
   the Edit page, checks that the live price matches the data, replaces the SEO,
   adds product tags, refreshes the intro paragraph (replacing its own earlier
   one), and saves with the admin's own Save routine. Use `ECB_ONLY=id1,id2`
   to test on specific products.
4. `redirects.py`: if product addresses change, builds a Cloudflare Bulk
   Redirects CSV (old to new).

Re-run steps 1 to 3 after price changes so the descriptions show current
prices. Product addresses don't change on later saves; GeniusCart only rebuilt
them on the first save.

To convert `generate_v2.py` output into runner input, keep these fields: `id`,
`name`, `price`, `tags` (= `meta_tags`), `description` (= `meta_description`),
`product_tags`, `intro_html`.
