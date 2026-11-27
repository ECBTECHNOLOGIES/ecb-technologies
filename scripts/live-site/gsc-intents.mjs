// Search-intent regex filters for ECB Technologies (Kenyan laptop shop).
//
// One source for two uses:
//   1. Copy-paste into Google Search Console: Performance → + Add filter →
//      Query → Custom (regex) → "Matches regex" (or "Doesn't match regex").
//      GSC uses RE2: no lookaheads; (?i) makes a pattern case-insensitive.
//   2. Imported by gsc-opportunities.mjs to group a Queries.csv export by intent.
//
//   node scripts/live-site/gsc-intents.mjs   # prints every filter, ready to paste
//
// Patterns stay well under GSC's 4,096-character limit.

export const INTENTS = [
  // --- Funnel stage ---
  { id: "transactional", label: "Buy, order, price, delivery, payment", re: String.raw`(?i)\b(buy|order|price|prices|pricing|cost|how much|shop|for sale|deal|deals|offer|offers|discount|cheap|cheapest|affordable|in stock|available|delivery|deliver|mpesa|m-pesa|lipa|installments?|instalments?|pay later)\b` },
  { id: "commercial", label: "Best, vs, alternatives, compare, worth it", re: String.raw`(?i)\b(best|top|vs|versus|alternatives?|compare|comparison|better|review|reviews|worth it|worth buying|good for|recommend(ed)?)\b` },
  { id: "informational", label: "Explanations and how-to", re: String.raw`(?i)^(what|how|why|when|which|who|where|is|are|can|does|do|should|will)\b|\b(meaning|explained|guide|tutorial|difference|definition|requirements?)\b` },
  { id: "problem", label: "Problems and fixes", re: String.raw`(?i)\b(not working|won'?t|wont|doesn'?t|slow|lag|overheat(ing)?|drain(ing)?|black screen|not charging|flicker(ing)?|freez(e|es|ing)|restart(ing|s)?|error|fix|broken|stuck)\b` },
  { id: "navigational", label: "ECB brand, site, contact", re: String.raw`(?i)\b(ecb|ecbtech|ecbtechkenya|ecb technologies)\b` },
  // --- Query shape (AI-style and long-tail) ---
  { id: "question", label: "Question opener or ends with ?", re: String.raw`(?i)^(what|how|why|when|which|who|where|is|are|can|does|do|should|will|would|could)\b|\?$` },
  { id: "conversational", label: "8+ words (AI-style, long-tail)", re: String.raw`^(\S+\s+){7,}\S+$` },
  { id: "personal", label: "Personal context (I, my, for me)", re: String.raw`(?i)\b(i|my|me|i'm|im|for my|for me|should i|can i)\b` },
  // --- Topic ---
  { id: "budget", label: "Budget and price limits (KSh)", re: String.raw`(?i)\b(under|below|less than|within|around)\s*(ksh|kes|sh)?\.?\s?\d|\b\d{2,3}\s?k\b|\bksh\s?\d` },
  { id: "model", label: "Model names and numbers", re: String.raw`(?i)\b(elitebook|probook|zbook|thinkpad|thinkbook|latitude|precision|xps|inspiron|ideapad|yoga|legion|omen|victus|omnibook|spectre|envy|pavilion|surface|macbook)\b` },
  { id: "spec", label: "Specs (CPU, RAM, SSD, GPU, generation)", re: String.raw`(?i)\b(i[3579]|core ultra|ultra [579]|ryzen|snapdragon|\d+\s?gb|\d\s?tb|ssd|ram|\d+(th|st|nd|rd) gen|gen \d+|rtx|gtx|touch ?screen|x360|2[- ]in[- ]1)\b` },
  { id: "condition", label: "Refurbished, ex-UK, used, new", re: String.raw`(?i)\b(refurbished|refurb|ex[- ]?uk|used|second[- ]?hand|renewed|grade [abc]|brand new|new)\b` },
  { id: "student", label: "Students and education", re: String.raw`(?i)\b(student|students|university|campus|college|school|kcse|helb|class|classes)\b` },
  { id: "business", label: "Business, bulk and corporate", re: String.raw`(?i)\b(bulk|wholesale|corporate|company|companies|business|office|tender|supplier|suppliers|quote|quotation|lpo|employees)\b` },
  { id: "repair", label: "Repairs and parts", re: String.raw`(?i)\b(repair|repairs|fix|replacement|replace|technician|service centre|service center)\b` },
  { id: "trust", label: "Trust, reviews, genuine, warranty", re: String.raw`(?i)\b(legit|scam|genuine|original|fake|reviews?|trusted|reliable|warranty|guarantee)\b` },
  { id: "local", label: "Local (Nairobi, towns, near me)", re: String.raw`(?i)\b(near me|nairobi|cbd|moi avenue|kenya|mombasa|kisumu|nakuru|eldoret|thika|machakos|nyeri|kakamega|open now|location|directions|shop)\b` },
  { id: "payment", label: "Payment methods", re: String.raw`(?i)\b(mpesa|m-pesa|lipa na|paybill|till|installments?|instalments?|pay later|paystack|card|cash on delivery)\b` },
  { id: "marketplace", label: "Marketplaces and other shops (edit list)", re: String.raw`(?i)\b(jumia|kilimall|jiji|pigiame|amazon)\b` },
];

export const toJs = (re) => new RegExp(re.replace(/^\(\?i\)/, ""), re.startsWith("(?i)") ? "i" : "");
export const classify = (query) => INTENTS.filter((x) => toJs(x.re).test(query)).map((x) => x.id);

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const x of INTENTS) console.log(`\n# ${x.label} [${x.id}] (${x.re.length} chars)\n${x.re}`);
  console.log("\n# Exclude the brand: use \"Doesn't match regex\" with the navigational pattern.");
}
