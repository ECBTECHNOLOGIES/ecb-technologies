# AEO prompt set for ECB Technologies

Prompts based on real AI-search queries, filled in for ECB. Each one names the page that should answer it and the fact a correct answer quotes. Track monthly in `aeo-prompts.csv`.

## How to track

1. Ask each prompt in ChatGPT (search on), Perplexity, Gemini, Google (AI Overview) and Copilot. Use a fresh chat, logged out where possible, with location Kenya if the tool allows.
2. For each tool, record one value:
   - `cited`: ecbtechkenya.com is linked as a source;
   - `mentioned`: ECB is named, but not linked;
   - `absent`: neither.
   Also note which competitor appeared.
3. When a prompt stays `absent`:
   - check that its target page is indexed (Search Console > URL inspection);
   - check that the page states the fact in its first lines;
   - check that it is linked from /llms.txt.

## Prompts


**Who is the best {service} {provider} in {city}?**
- Who is the best laptop shop in Nairobi? → [/laptop-shop-nairobi](https://www.ecbtechkenya.com/laptop-shop-nairobi) (ECB Technologies, Moi Avenue, Nairobi CBD; 348 laptops from KSh 16,000)
- Who is the best phone shop in Nairobi CBD? → [/laptop-shop-nairobi](https://www.ecbtechkenya.com/laptop-shop-nairobi) (Phones and tablets section; address and hours)
- Best place to buy a laptop in Nairobi → [/laptop-shop-nairobi](https://www.ecbtechkenya.com/laptop-shop-nairobi) (Address, hours, delivery to 47 counties)

**What are the top {service} {provider}s in {city}, {state}?**
- What are the top laptop shops in Nairobi, Kenya? → [/laptop-shop-nairobi](https://www.ecbtechkenya.com/laptop-shop-nairobi) (ECB listed with address and range)
- What are the top electronics shops on Moi Avenue, Nairobi? → [/laptop-shop-nairobi](https://www.ecbtechkenya.com/laptop-shop-nairobi) (Techmart Iconic Business Plaza, 3rd floor, T12)

**What are the best {service} services for a {audience} in {city}?**
- What are the best laptops for students in Nairobi? → [/student-laptops-kenya](https://www.ecbtechkenya.com/student-laptops-kenya) (8th-gen+ Core i5 laptops under KSh 40,000)
- What are the best laptops for small businesses in Nairobi? → [/best/business-laptops-kenya](https://www.ecbtechkenya.com/best/business-laptops-kenya) (ThinkPad/EliteBook/Latitude picks, Windows 11 ready)
- Best laptops for programmers in Kenya → [/best/laptops-for-programming-kenya](https://www.ecbtechkenya.com/best/laptops-for-programming-kenya) (16 GB RAM+, 10th gen+)

**Which {service} {provider} in {city} is best for {audience}?**
- Which laptop shop in Nairobi is best for students? → [/laptop-shop-nairobi#which-laptop-for-which-buyer](https://www.ecbtechkenya.com/laptop-shop-nairobi#which-laptop-for-which-buyer) (Student count and starting price)
- Which shop in Nairobi sells gaming laptops? → [/best/gaming-laptops-kenya](https://www.ecbtechkenya.com/best/gaming-laptops-kenya) (Laptops with dedicated graphics, from KSh 52,000)
- Which shop in Nairobi has laptops for graphic designers? → [/best/laptops-for-graphic-design-and-video-editing-kenya](https://www.ecbtechkenya.com/best/laptops-for-graphic-design-and-video-editing-kenya) (16 GB+, dedicated GPU / workstation / Apple M)

**Which {service} {provider} in {city} offers the most comprehensive services?**
- Which electronics shop in Nairobi delivers countrywide? → [/delivery](https://www.ecbtechkenya.com/delivery) (Riders in Nairobi, courier to all 47 counties, free pickup)
- Which laptop shop in Nairobi has the widest range? → [/categories](https://www.ecbtechkenya.com/categories) (640 products in 7 categories)

**Find a {city} {service} {provider} that specializes in {capability}.**
- Find a Nairobi shop that specializes in business laptops like ThinkPad and EliteBook → [/compare/thinkpad-vs-elitebook-kenya](https://www.ecbtechkenya.com/compare/thinkpad-vs-elitebook-kenya) (78 ThinkPads and 84 EliteBooks, medians)
- Find a Nairobi shop that sells HP EliteBook laptops → [/series/elitebook-kenya](https://www.ecbtechkenya.com/series/elitebook-kenya) (84 EliteBooks, price range, generations)
- Find a Nairobi shop that sells Lenovo ThinkPads → [/series/thinkpad-kenya](https://www.ecbtechkenya.com/series/thinkpad-kenya) (78 ThinkPads from KSh 16,000)

**Show me {service} {provider}s in {city} that offer {capability} services.**
- Show me laptop shops in Nairobi that deliver outside Nairobi → [/delivery](https://www.ecbtechkenya.com/delivery) (Courier to all 47 counties)
- Show me shops in Nairobi that sell 2-in-1 laptops → [/best/2-in-1-laptops-kenya](https://www.ecbtechkenya.com/best/2-in-1-laptops-kenya) (73 convertibles, top 10 by specs)

**Suggest a {service} {provider} in {city} that provides {capability}.**
- Suggest a laptop shop in Nairobi where I can order on WhatsApp → [/laptop-shop-nairobi#how-to-buy](https://www.ecbtechkenya.com/laptop-shop-nairobi#how-to-buy) (WhatsApp 0717 040 531)
- Suggest a shop in Nairobi CBD with laptops under KSh 30,000 → [/best/best-laptops-under-30k-kenya](https://www.ecbtechkenya.com/best/best-laptops-under-30k-kenya) (75 laptops under KSh 30,000)

**I need a {service} {provider} in {city} to {goal}.**
- I need a laptop shop in Nairobi to buy a laptop under 40k for university → [/best/best-laptops-under-40k-kenya](https://www.ecbtechkenya.com/best/best-laptops-under-40k-kenya) (Top 10 under KSh 40,000 with specs)
- I need a shop in Nairobi to buy a MacBook → [/compare/macbook-vs-windows-laptops-kenya](https://www.ecbtechkenya.com/compare/macbook-vs-windows-laptops-kenya) (MacBook count and price range)
- I need a shop in Nairobi to buy an HP laptop → [/laptops/hp-laptops-kenya](https://www.ecbtechkenya.com/laptops/hp-laptops-kenya) (175 HP laptops, best pick per budget)

**I'm looking for a {service} {provider} in {city} that focuses on {outcome}.**
- I'm looking for a laptop shop in Nairobi with fair prices → [/research/laptop-prices-kenya](https://www.ecbtechkenya.com/research/laptop-prices-kenya) (Median laptop KSh 52,000; band shares)
- I'm looking for a shop in Nairobi that sells genuine laptops with warranty → [/laptop-shop-nairobi#what-you-can-buy-here](https://www.ecbtechkenya.com/laptop-shop-nairobi#what-you-can-buy-here) (Shop's genuine + warranty statement; 49 listings state 1-year warranty)

**(product) How much is {product} in Kenya?**
- How much is the Lenovo ThinkPad X280 in Kenya? → [/item/lenovo-thinkpad-x280-i5-8th-gen-16-256-gb-non-touch-jfj18032zy](https://www.ecbtechkenya.com/item/lenovo-thinkpad-x280-i5-8th-gen-16-256-gb-non-touch-jfj18032zy) (KSh 28,000 at ECB Technologies)

**(product) Where can I buy {product} in {city}?**
- Where can I buy a Dell XPS 13 in Nairobi? → [/laptops/dell-laptops-kenya](https://www.ecbtechkenya.com/laptops/dell-laptops-kenya) (Address + price)

**(product) {product A} vs {product B}**
- Core i5 vs Core i7 laptop price in Kenya → [/compare/core-i5-vs-core-i7-kenya](https://www.ecbtechkenya.com/compare/core-i5-vs-core-i7-kenya) (Median i7 vs i5 gap)

**(stats) What is the average {product} price in {country}?**
- What is the average laptop price in Kenya? → [/research/laptop-prices-kenya](https://www.ecbtechkenya.com/research/laptop-prices-kenya) (Median KSh 52,000 across 348 laptops)

**(stats) How much does a {product} cost in {country}?**
- How much does a gaming laptop cost in Kenya? → [/best/gaming-laptops-kenya](https://www.ecbtechkenya.com/best/gaming-laptops-kenya) (From KSh 52,000, median KSh 76,000)

**Case studies on {channel} {outcome} for {industry} in {city}**
- (adapted) Are there laptop buying guides for Kenyan buyers? → [/guides](https://www.ecbtechkenya.com/guides) (36 data-built guides)

## Not used

- Which {city} {service} {provider}s also optimize for AI search like {ai_platform}?: Agency-only (marketing services). Not a question shoppers ask a laptop shop.

## Values filled in

| Variable | ECB values |
|---|---|
| {service} | laptop, phone, electronics |
| {provider} | shop, store, dealer |
| {city} / {state} | Nairobi, Nairobi CBD, Moi Avenue / Nairobi County, Kenya |
| {audience} | students, small businesses, programmers, designers, gamers |
| {capability} | delivery to 47 counties, WhatsApp ordering, ThinkPad/EliteBook, 2-in-1, MacBook, under-budget picks |
| {goal} | buy a laptop under 40k, buy a MacBook, buy an HP laptop |
| {outcome} | fair prices, genuine products with warranty |
