# 30 days to more calls and WhatsApp messages from local search

What's done on the website, and what the shop needs to do (Google Business
Profile, reviews, phone). Everything to paste is below.

## Done on the website (21 Nov 2026)

- **One address everywhere.** The footer and contact page said "Iconic
  Business Centre, T12"; the site now says *Techmart Iconic Business Plaza,
  3rd Floor, Room T12, Moi Avenue, Nairobi CBD* everywhere, matching the
  structured data. Use exactly this on Google, Bing, Apple and every
  directory.
- **Tap to call on phones:** a call button above the WhatsApp button on
  every page (the top bar number was already a tap-to-call link). Clicks are
  counted in Google Analytics as `call_click`.
- **After hours:** outside Mon–Sat 9am–7pm (Nairobi time) a small note says
  "Closed now · opens Monday 9am. WhatsApp us and we'll reply when we open."
- **Review link:** https://www.ecbtechkenya.com/review (see week 2).
- **Local page:** /laptop-shop-nairobi (address, hours, what we stock, how
  to buy, FAQ) plus /delivery (all 47 counties).

## Week 1: Google Business Profile

Open https://business.google.com and check each item.

**Categories.** People search "laptop shop Nairobi", "buy laptop Nairobi",
"phone shop Nairobi CBD". Pick from Google's list (type and choose; names
must match the dropdown):

- Primary: **Computer store** (or "Laptop store" if the dropdown offers it).
- Secondary, all that apply: **Cell phone store**, **Electronics store**,
  **Computer accessories store**, **Used computer store**, **Printer store**
  or "Office equipment supplier", **Video game store** (if gaming gear is a
  real line).
- **Computer repair service** (the shop does repairs; confirmed 27 Nov 2026).
- Don't add services you don't offer just for the category.

**Name:** ECB Technologies (no extra keywords; Google suspends for that).

**Address:** Techmart Iconic Business Plaza, 3rd Floor, Room T12, Moi
Avenue, Nairobi. Check the map pin is on the building.

**Hours:** Mon–Sat 9:00–19:00, Sunday closed. Add special hours for public
holidays (Jamhuri Day 12 Dec, Christmas, Boxing Day, New Year's Day).

**Phone:** 0717 040 531. **Website:** https://www.ecbtechkenya.com/laptop-shop-nairobi
(the local page converts better than the homepage for "near me" searches).

**Description** (paste; under 750 characters):

> ECB Technologies is a laptop and phone shop in Nairobi CBD, on the 3rd
> floor of Techmart Iconic Business Plaza, Moi Avenue. We stock hundreds of
> laptops (HP EliteBook, Lenovo ThinkPad, Dell Latitude and XPS, MacBook and
> gaming laptops), plus iPhones, Samsung phones, iPads, printers, monitors and
> accessories. Every product has its price in KSh on our website. Come and see
> any laptop before you pay, or order on WhatsApp and get it delivered: riders
> within Nairobi and couriers to all 47 counties. Open Monday to Saturday,
> 9am to 7pm.

**Services / products** (add each with a description and price range;
update the numbers from the website when they change):

| Name | Description to paste |
|---|---|
| Laptops | Business, student and gaming laptops from HP, Lenovo, Dell and Apple, from about KSh 16,000. Prices on every product page; see any laptop at the shop before paying. |
| Student laptops | 8th-gen or newer Core i5 laptops under KSh 40,000, picked for university and college. List: ecbtechkenya.com/student-laptops-kenya |
| Business laptops | ThinkPad, EliteBook and Latitude laptops for office work, durable and easy to repair. |
| Gaming and design laptops | Laptops with dedicated graphics cards for gaming, design and video editing. |
| Phones and tablets | iPhones, Samsung phones, iPads and tablets, with prices in KSh. |
| Printers and monitors | Printers, scanners and monitors for home and office. |
| Laptop repairs | Laptop repairs at the shop on Moi Avenue: bring the laptop and charger for a diagnosis and quote, or WhatsApp 0717 040 531 first. ecbtechkenya.com/laptop-repair-nairobi |
| Delivery across Kenya | Riders within Nairobi, couriers to all 47 counties; delivery cost shown at checkout. Free pickup at the shop. |

**Also:** add 10+ real photos (shopfront and building entrance, inside the
shop, the team, laptops on the counter), turn on **messaging** (if offered)
and add the **WhatsApp** link, and post once a week (new stock, a price
drop, a buying tip from /learn).

## Week 2: the review machine

1. **Get the direct review link:** in the profile, "Ask for reviews" →
   copy the link (g.page/r/…/review). Send it to whoever updates the
   website: it goes in `REVIEW_URL` in `cloudflare-worker-speed.js` so
   ecbtechkenya.com/review opens the review box directly. (Today it opens
   the profile, one tap from "Write a review".)
2. **List every customer from the last 90 days** (WhatsApp chats, the
   shop's order list in the admin, receipts) and send each one:

   > Hi [name], this is [your name] from ECB Technologies. Thanks again for
   > buying your [laptop/phone] from us. Would you mind leaving a quick
   > Google review? Mentioning what you bought and that you're in [town]
   > helps other buyers a lot: ecbtechkenya.com/review

3. **Make it a rule:** every customer gets that message within 24 hours of
   pickup or delivery. Save it as a WhatsApp Business **quick reply**
   (Settings → Business tools → Quick replies, shortcut `/review`).
4. **Target: at least one new review a week.** Reply to every review within
   a day, good or bad, mentioning the product ("Glad the EliteBook 840 G6 is
   working well for your classes").
5. Never offer money or discounts for reviews, and don't write them for
   customers: Google removes them and can suspend the profile.

## Week 3: pages

- **Service pages:** in place. Each product line has a page with prices,
  questions answered and the phone number (categories, /guides, /learn,
  /laptop-shop-nairobi, /delivery).
- **City pages:** the shop serves Nairobi in person (/laptop-shop-nairobi)
  and the rest of Kenya by courier (/delivery lists all 47 counties). A
  separate page per town ("laptops Mombasa") with nothing specific to say
  would be a doorway page, which Google penalises. They become worth it only
  with real local facts. If you want them for the towns that order most
  (e.g. Mombasa, Kisumu, Nakuru, Eldoret, Thika), send for each: the courier
  used, typical delivery time, delivery cost, and a few real orders or
  reviews from that town. The pages can then be generated like the guides.

## Week 4: plug the leaks

1. **Call the shop after 7pm and on a Sunday.** What happens? A missed call
   should never go unanswered.
2. **WhatsApp Business** (Settings → Business tools):
   - *Away message*, outside business hours: "Thanks for contacting ECB
     Technologies! We're closed now (open Mon–Sat 9am–7pm). Tell us what
     you're looking for and your budget, and we'll reply first thing."
   - *Greeting message* for new chats: "Hi, welcome to ECB Technologies!
     What are you looking for, and what's your budget? Send a product link
     from ecbtechkenya.com and we'll confirm stock and price."
3. **Missed calls:** if the shop phone is Android, a missed-call auto-reply
   app (search the Play Store for "missed call auto SMS") can send:
   "Sorry we missed you, this is ECB Technologies. What do you need help
   with? WhatsApp us on 0717 040 531 and we'll get back to you today."
   Alternatively, forward calls to a second phone after hours.
4. **AI recommendations.** Ask ChatGPT, Gemini and Copilot "Where's the best
   place to buy a laptop in Nairobi CBD?" and "What would ECB Technologies
   need to get recommended here?" Note what they say. What they generally
   rely on, and where ECB stands:

   | Signal | Status |
   |---|---|
   | Google reviews (count, recency, detail) | Owner: week 2 |
   | Consistent name, address and phone everywhere | Website fixed; check Google, Facebook, Instagram, Jiji |
   | Listed on Bing Places and Apple Business Connect | Owner: see docs/seo/backlinks.md |
   | Kenyan directories (BusinessList, AngloInfo) | Owner: see docs/seo/backlinks.md |
   | Mentions on news and tech sites | Owner: pitch our price data (backlinks.md) |
   | Clear facts AI can read (llms.txt, structured data, FAQ) | Done |
   | Answers to buyer questions | Done (/learn, guides, product FAQs) |

   Knock out the list, then ask the assistants again in a month.
