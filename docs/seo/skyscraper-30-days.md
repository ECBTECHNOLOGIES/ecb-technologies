# 30-day plan: one flagship page (Brian Dean's playbook)

One page, one keyword, one relaunch per month. This month's page:

**https://www.ecbtechkenya.com/student-laptops-kenya**, keyword *laptops
for students in Kenya* (also "best laptop for university students Kenya").
Buyer intent, steady demand every semester, and the pages ranking for it are
beatable.

## Week 1: research (done)

Competing pages for this keyword (Kenyan news sites and shops):

- The Kenya Times: budget laptops for university students, 2026
  (thekenyatimes.com/sci-tech/…)
- Shoptech: best laptops in Kenya for students, entrepreneurs and business
- Lansotech Solutions: student laptop recommendations
- Techweez: tips for choosing a college laptop (2023)
- Mars Computers and other shop blogs (many near-identical posts)

What they have in common: 5–10 models, prices typed by hand that go stale,
no stock behind the recommendations, little on courses or what to check.

## Week 2: the skyscraper (done, live)

The page is now clearly better on every point Dean lists:

| | Competitors | Our page |
|---|---|---|
| Fresh | Prices from when the post was written | Live prices from real stock, dated |
| Complete | A list of models | 10 best picks, **best laptop per course** (business/law/medicine, computer science, engineering, design), **budget tiers** from KSh 25,000, where extra money goes, a 5-minute pre-purchase check, 8 FAQs |
| Original | Opinions | Own data: 58 qualifying laptops, median price, same-model price of 16 GB vs 8 GB, published spec score |
| Opens with | A generic intro | Agree–Promise–Preview: the problem, what the page gives, what's inside |

## Week 3: on-page checklist and publish (done)

- `node scripts/live-site/onpage-check.mjs` checks every guide against the
  Chapter 4 list: title ≤ 60 with the keyword up front and a modifier, short
  URL, keyword in the first 100 words and in the H1, a keyword variation in an
  H2, internal links near the top, description 70–158 characters. 87 of 89
  guides pass. The 2 exceptions are deliberate: the design page keeps its
  older URL, and the shop page's title reads better without a modifier.
- Internal links near the top of every guide (Related: …).
- Links out to authoritative sources where facts are cited (Microsoft's
  Windows 11 requirements and Windows 10 end of support).
- Internal links into the flagship from the strongest pages: the homepage
  footer (via /guides), /laptop-shop-nairobi, the /learn articles and the
  budget guides already link to it.

## Week 4: promote (owner)

1. **Email the sites that cover student laptops.** No link-analysis tool
   (Ahrefs, Semrush) is connected, so start with the writers of the pages
   above and with university pages that list resources for new students.
   Personalise every email; keep it short:

   > Subject: Updated student laptop prices for your [article name]
   >
   > Hi [name], I read your piece on [title] ([their URL]). Prices for
   > student laptops have moved a lot this year. We keep a live list from
   > our stock in Nairobi CBD, with the best laptop for each course and
   > what each budget gets: https://www.ecbtechkenya.com/student-laptops-kenya
   >
   > If it's useful for your readers, feel free to link to it or quote the
   > numbers (median price, what 16 GB costs over 8 GB). Happy to answer
   > questions for your next update.
   >
   > [name], ECB Technologies

2. **Share it in one community where students are:** a university
   Facebook or WhatsApp group (freshers' groups at intake time), r/Kenya,
   or a TikTok/Instagram post of the "best laptop per course" table. Help
   first; link second.
3. **Relaunch one older page** (Chapter 7): pick the guide with the most
   impressions but falling clicks (`gsc-opportunities.mjs`, list 3), refresh
   it, keep the URL, then share it again. Guides refresh their prices
   automatically; a relaunch means new sections or FAQs
   (`additions.json`) and a better title.

## Click-through tests (Chapter 7)

For a page with low CTR for its position (`gsc-opportunities.mjs`, list
1): add `title` and/or `description` plus `since` (the date) for that path
in `docs/seo/live-site/additions.json`, run `page-additions.mjs --apply`.
After 2–4 weeks compare CTR before and after in Search Console (Pages →
the page → Compare dates). Keep the winner; remove the override if the old
one was better. A number, the year or a concrete benefit in the title
usually wins ("58 Under KSh 40,000", "(2026)", "Live Prices").

## What to measure

- Referring domains to the flagship (Search Console → Links → Top linking
  sites).
- Position and clicks for "laptops for students in Kenya" (Search Console →
  Performance → filter Query).
- CTR of the page.

Give it 4–12 weeks before judging. Next month: pick the next page (a /learn
article with impressions, or the HP vs Dell vs Lenovo comparison) and run
the same cycle. Every quarter, review the top 20 pages by clicks.
