# Search Console regex filters for ECB Technologies

Copy a pattern into Search Console: **Performance → + Add filter → Query →
Custom (regex) → Matches regex**. Use **Doesn't match regex** to exclude
(e.g. the brand pattern to see non-brand queries only). GSC uses RE2: no
lookaheads; `(?i)` makes a pattern case-insensitive.

Generated from `scripts/live-site/gsc-intents.mjs` (one source; the
opportunities script uses the same patterns to group a Queries.csv export:
`node scripts/live-site/gsc-opportunities.mjs Pages.csv Queries.csv`, list 5).

## Useful combinations

- **Money queries, non-brand:** Matches `transactional` or `commercial`, and Doesn't match `navigational`.
- **AI-style prompts:** `conversational` (8+ words) or `question`; read them for FAQ entries and new sections (`gsc-page-gaps.mjs`).
- **Positions 10–30 on money queries:** filter `transactional`, sort by position: the quickest wins.
- **Repairs demand:** `repair` + `local`.
- **B2B demand:** `business`.
- **Condition demand:** `condition` (how many people search refurbished / ex-UK / new).

## Filters

### Buy, order, price, delivery, payment [transactional] (218 chars)
```
(?i)\b(buy|order|price|prices|pricing|cost|how much|shop|for sale|deal|deals|offer|offers|discount|cheap|cheapest|affordable|in stock|available|delivery|deliver|mpesa|m-pesa|lipa|installments?|instalments?|pay later)\b
```

### Best, vs, alternatives, compare, worth it [commercial] (129 chars)
```
(?i)\b(best|top|vs|versus|alternatives?|compare|comparison|better|review|reviews|worth it|worth buying|good for|recommend(ed)?)\b
```

### Explanations and how-to [informational] (148 chars)
```
(?i)^(what|how|why|when|which|who|where|is|are|can|does|do|should|will)\b|\b(meaning|explained|guide|tutorial|difference|definition|requirements?)\b
```

### Problems and fixes [problem] (173 chars)
```
(?i)\b(not working|won'?t|wont|doesn'?t|slow|lag|overheat(ing)?|drain(ing)?|black screen|not charging|flicker(ing)?|freez(e|es|ing)|restart(ing|s)?|error|fix|broken|stuck)\b
```

### ECB brand, site, contact [navigational] (51 chars)
```
(?i)\b(ecb|ecbtech|ecbtechkenya|ecb technologies)\b
```

### Question opener or ends with ? [question] (89 chars)
```
(?i)^(what|how|why|when|which|who|where|is|are|can|does|do|should|will|would|could)\b|\?$
```

### 8+ words (AI-style, long-tail) [conversational] (17 chars)
```
^(\S+\s+){7,}\S+$
```

### Personal context (I, my, for me) [personal] (53 chars)
```
(?i)\b(i|my|me|i'm|im|for my|for me|should i|can i)\b
```

### Budget and price limits (KSh) [budget] (94 chars)
```
(?i)\b(under|below|less than|within|around)\s*(ksh|kes|sh)?\.?\s?\d|\b\d{2,3}\s?k\b|\bksh\s?\d
```

### Model names and numbers [model] (163 chars)
```
(?i)\b(elitebook|probook|zbook|thinkpad|thinkbook|latitude|precision|xps|inspiron|ideapad|yoga|legion|omen|victus|omnibook|spectre|envy|pavilion|surface|macbook)\b
```

### Specs (CPU, RAM, SSD, GPU, generation) [spec] (151 chars)
```
(?i)\b(i[3579]|core ultra|ultra [579]|ryzen|snapdragon|\d+\s?gb|\d\s?tb|ssd|ram|\d+(th|st|nd|rd) gen|gen \d+|rtx|gtx|touch ?screen|x360|2[- ]in[- ]1)\b
```

### Refurbished, ex-UK, used, new [condition] (93 chars)
```
(?i)\b(refurbished|refurb|ex[- ]?uk|used|second[- ]?hand|renewed|grade [abc]|brand new|new)\b
```

### Students and education [student] (83 chars)
```
(?i)\b(student|students|university|campus|college|school|kcse|helb|class|classes)\b
```

### Business, bulk and corporate [business] (124 chars)
```
(?i)\b(bulk|wholesale|corporate|company|companies|business|office|tender|supplier|suppliers|quote|quotation|lpo|employees)\b
```

### Repairs and parts [repair] (89 chars)
```
(?i)\b(repair|repairs|fix|replacement|replace|technician|service centre|service center)\b
```

### Trust, reviews, genuine, warranty [trust] (87 chars)
```
(?i)\b(legit|scam|genuine|original|fake|reviews?|trusted|reliable|warranty|guarantee)\b
```

### Local (Nairobi, towns, near me) [local] (140 chars)
```
(?i)\b(near me|nairobi|cbd|moi avenue|kenya|mombasa|kisumu|nakuru|eldoret|thika|machakos|nyeri|kakamega|open now|location|directions|shop)\b
```

### Payment methods [payment] (111 chars)
```
(?i)\b(mpesa|m-pesa|lipa na|paybill|till|installments?|instalments?|pay later|paystack|card|cash on delivery)\b
```

### Marketplaces and other shops (edit list) [marketplace] (44 chars)
```
(?i)\b(jumia|kilimall|jiji|pigiame|amazon)\b
```

### Exclude the brand: use "Doesn't match regex" with the navigational pattern.
