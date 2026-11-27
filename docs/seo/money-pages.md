# Money pages (bottom of funnel) for ECB Technologies

The B2B "money page" types mapped to a laptop shop, and where each lives.
Build and improve these before more top-of-funnel articles.

| Type | ECB equivalent | Pages |
|---|---|---|
| Product | Product pages (678) | /item/... with live price, specs Q&A, WhatsApp order, similar-price products, and now "Compare before you buy" links to the model, alternatives, series, brand, budget and explainer pages |
| Use case | What the laptop is for | /best/business-laptops-kenya, /best/laptops-for-programming-kenya, /best/laptops-for-graphic-design-and-video-editing-kenya, /best/gaming-laptops-kenya, /learn/best-laptops-for-autocad-and-revit-kenya, /learn/laptop-requirements-video-photo-editing-3d |
| Role | Who uses it | /learn/best-laptop-for-your-profession-kenya (accountants, lawyers, marketers, developers, designers), /learn/laptops-for-engineering-data-and-programming-software |
| Segment | Who buys it | /student-laptops-kenya (flagship), /learn/laptops-for-small-business-kenya, /learn/business-laptop-procurement-kenya (companies, bulk quotes) |
| Comparison | Model vs model | /compare/* (live), /hp-vs-dell-vs-lenovo-laptops-kenya, /laptops/<model>-alternatives-kenya, /learn/laptop-product-families-explained, /learn/business-vs-consumer-laptops |
| Pricing | Prices by budget, brand, model | /laptops/<model>-price-kenya (model pages), /laptops/macbook-price-kenya, /best/best-laptops-under-*k-kenya, /learn/best-value-laptops-kenya, /research/laptop-prices-kenya |
| Integrations | Services around the purchase | /delivery (47 counties), /laptop-repair-nairobi, /laptop-shop-nairobi; payments: Paystack (pending the owner's admin step) |

## Next money-page improvements

1. **Condition per product** (new / refurbished / ex-UK) in the admin product names or descriptions, so product pages show it and a "refurbished laptops in stock" page can be built.
2. **Paystack live**, then payment methods stated on product and checkout pages.
3. **Warranty per product** where the shop confirms it.

## Every article hands off to one money page

Each /learn article now ends its content with a "Next step" link to the
buying page that fits it (budget, use-case, comparison, series, repair or
accessories page), chosen from live pages or set per article (`money` in
articles.js).

## Measuring money pages (not traffic)

1. **Search Console:** Performance → filter Page by `/best/`, `/laptops/`,
   `/compare/`, `/series/`, `/item/`, `/laptop-shop-nairobi`,
   `/laptop-repair-nairobi`, and report them separately from `/learn/`.
2. **AI-referred visits (GA4):** Reports → Acquisition → Traffic acquisition,
   filter Session source containing `chatgpt`, `perplexity`, `gemini`,
   `copilot` or `claude`, then add Landing page as a secondary dimension.
   ChatGPT links carry `utm_source=chatgpt.com`.
3. **Conversions:** WhatsApp clicks (`whatsapp_click`) and calls
   (`call_click`) by landing page; orders once Paystack is live.
4. **Share of Model, quarterly:** ask ChatGPT, Gemini, Perplexity and
   Google AI Mode the prompts below and record which shops and URLs are
   named:
   - Where can I buy a laptop in Nairobi CBD?
   - Best laptop for university students in Kenya under KSh 40,000
   - Best business laptop in Kenya for an accountant
   - HP EliteBook 840 G5 price in Kenya
   - ThinkPad vs EliteBook, which to buy in Kenya?
   - Where can I repair my laptop in Nairobi?
   - Best laptop for AutoCAD in Kenya
   - MacBook Air price in Kenya
   - Where can a company buy laptops in bulk in Kenya?
   - Refurbished laptops in Nairobi with warranty

Review every money page quarterly; pages show their last-updated date.
