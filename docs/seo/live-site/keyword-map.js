// ECB Technologies keyword map (one keyword cluster per page).
//
// Each row assigns a cluster of related searches (and the AI prompts they
// fan out from) to the one page that should rank for them. Columns follow
// the Semrush keyword-mapping template: pillar, subpage, keywords, volume,
// KD%, target URL, status, last updated. Volume and KD are left empty on
// purpose: they must come from Keyword Planner or Semrush, never be guessed.
//
// status: "Mapped"      page exists and is optimized for the cluster
//         "To optimize" page exists; title/H1/intro do not yet match
//         "To create"   no page yet (see note for why / what is needed)
//         "Not targeted" we do not sell this; listed so nobody builds it
//
// Review every 3 months (next: REVIEW_BY), or sooner after adding,
// merging or removing important pages.
//
// Used by: the Worker (category H1s and titles: CATEGORY_SEO), and
// scripts/live-site/keyword-map.mjs (CSV export + page audit).

export const MAP_UPDATED = "2026-11-16";
export const REVIEW_BY = "2027-02-16";

const L = (pillar, page, url, primary, cluster, intent, status, prompts = [], note = "") => ({ pillar, page, url, primary, cluster, intent, status, prompts, note });

export const KEYWORD_MAP = [
  // ---------- Brand and shop ----------
  L("Brand & shop", "Home", "/", "ECB Technologies", ["ecb technologies", "ecb tech kenya", "ecbtechkenya"], "navigational", "Mapped", [], "Brand searches only; money keywords live on category and guide pages (the homepage should not be the page that ranks for them)."),
  L("Brand & shop", "Shop in Nairobi CBD", "/laptop-shop-nairobi", "laptop shop in Nairobi", ["laptop shop nairobi cbd", "laptop shops in nairobi", "where to buy a laptop in nairobi", "computer shops in nairobi cbd", "electronics shop moi avenue", "phone shop nairobi cbd"], "local", "Mapped", ["Who is the best laptop shop in Nairobi?", "Best place to buy a laptop in Nairobi", "I need a laptop shop in Nairobi to buy a laptop under 40k"]),
  L("Brand & shop", "Delivery", "/delivery", "laptop delivery across Kenya", ["laptop delivery nairobi", "electronics delivery kenya", "deliver laptop to mombasa", "deliver laptop to kisumu", "same day delivery nairobi laptop"], "informational", "Mapped", ["Which electronics shop in Nairobi delivers countrywide?"]),
  L("Brand & shop", "Contact", "/contact", "ECB Technologies contact", ["ecb technologies phone number", "ecb technologies location", "techmart iconic business plaza"], "navigational", "Mapped"),
  L("Brand & shop", "All categories (hub)", "/categories", "ECB Technologies categories", ["laptops phones accessories nairobi", "electronics shop categories"], "navigational", "Mapped", [], "Hub page: just links."),

  // ---------- Laptops (pillar) ----------
  { ...L("Laptops", "Laptops (pillar)", "/category/laptops", "laptops in Kenya", ["buy laptops in kenya", "laptops for sale in kenya", "laptops nairobi", "laptop shop online kenya", "new laptops kenya"], "transactional", "Mapped", [], "H1 now 'Laptops in Kenya'. /category/gaming also says 'Laptops' in its title: reviewed, it is the narrower gaming-monitor page."), reviewed: ["/category/gaming"] },
  L("Laptops", "Laptop prices", "/research/laptop-prices-kenya", "laptop prices in Kenya", ["laptop price in kenya", "average laptop price in kenya", "how much is a laptop in kenya", "laptop prices kenya 2026", "laptop price list kenya"], "informational", "To optimize", ["What is the average laptop price in Kenya?", "How much does a laptop cost in Kenya?"], "Cannibalized by /laptop-prices-in-kenya (static copy, stale numbers): 301 it here."),
  L("Laptops", "Laptops under 25k", "/best/best-laptops-under-25k-kenya", "laptops under 25000 in Kenya", ["laptop under 25k kenya", "cheapest laptop in kenya", "cheap laptops in kenya"], "commercial", "Mapped"),
  L("Laptops", "Laptops under 30k", "/best/best-laptops-under-30k-kenya", "laptops under 30000 in Kenya", ["best laptop under 30k kenya", "laptop under 30k"], "commercial", "Mapped", ["Suggest a shop in Nairobi CBD with laptops under KSh 30,000"]),
  L("Laptops", "Laptops under 40k", "/student-laptops-kenya", "laptops under 40000 in Kenya", ["best laptop under 40k kenya", "laptop under 40k"], "commercial", "Mapped", [], "Merged into the student page (same laptops); /best/best-laptops-under-40k-kenya 301s there."),
  L("Laptops", "Laptops under 50k", "/best/best-laptops-under-50k-kenya", "laptops under 50000 in Kenya", ["best laptop under 50k kenya", "laptop under 50k"], "commercial", "Mapped"),
  L("Laptops", "Laptops under 60k–80k", "/best/best-laptops-under-70k-kenya", "laptops under 70000 in Kenya", ["laptop under 60k kenya", "laptop under 70k kenya", "laptop under 80k kenya"], "commercial", "Mapped", [], "Separate 60k and 80k pages also exist; each targets its own budget."),
  L("Laptops", "Budget laptops", "/category/laptops/Budget", "budget laptops in Kenya", ["affordable laptops kenya", "budget laptop deals nairobi"], "transactional", "To optimize", [], "Title reads 'Budget Laptops Prices in Kenya'."),
  L("Laptops", "Student laptops", "/student-laptops-kenya", "laptops for students in Kenya", ["student laptops kenya", "best laptop for university students kenya", "laptop for campus kenya", "student laptop under 40k"], "commercial", "To optimize", ["What are the best laptops for students in Nairobi?", "Which laptop shop in Nairobi is best for students?"], "Static copy from 15 Nov (stale): rebuild live from the catalogue. Also takes the under-40k cluster."),
  L("Laptops", "Student deals (category)", "/category/laptops/Student-Deals", "student laptop deals", ["student laptop offers nairobi"], "transactional", "To create", [], "Title reads 'Student Deals Laptops Prices in Kenya'. EMPTY since the 16 Nov restore (0 products): noindex and out of the sitemap until products are assigned to it in the admin."),
  L("Laptops", "Business laptops", "/best/business-laptops-kenya", "business laptops in Kenya", ["office laptops kenya", "laptops for small business kenya", "corporate laptops nairobi"], "commercial", "Mapped", ["What are the best laptops for small businesses in Nairobi?"]),
  L("Laptops", "Programming laptops", "/best/laptops-for-programming-kenya", "laptops for programming in Kenya", ["best laptop for coding kenya", "laptop for software development kenya", "developer laptop kenya"], "commercial", "Mapped", ["Best laptops for programmers in Kenya"]),
  L("Laptops", "Design laptops", "/best/laptops-for-graphic-design-and-video-editing-kenya", "laptops for graphic design in Kenya", ["laptop for video editing kenya", "laptop for architecture students kenya", "workstation laptop kenya"], "commercial", "Mapped", ["Which shop in Nairobi has laptops for graphic designers?"]),
  L("Laptops", "Gaming laptops", "/best/gaming-laptops-kenya", "gaming laptops in Kenya", ["gaming laptop price in kenya", "rtx laptop kenya", "hp omen price in kenya", "hp victus price in kenya"], "commercial", "Mapped", ["Which shop in Nairobi sells gaming laptops?"], "Category /category/laptops/Gaming is the transactional twin; it targets 'gaming laptops for sale'."),
  L("Laptops", "Gaming laptops (category)", "/category/laptops/Gaming", "gaming laptops for sale in Kenya", ["buy gaming laptop nairobi"], "transactional", "To optimize", [], "Title reads 'Gaming Laptops Prices in Kenya'; collides with the guide. Retitle to the transactional phrase."),
  L("Laptops", "2-in-1 laptops", "/best/2-in-1-laptops-kenya", "2-in-1 laptops in Kenya", ["x360 laptop price in kenya", "convertible laptop kenya", "laptop that folds into tablet kenya"], "commercial", "Mapped"),
  L("Laptops", "Touchscreen laptops", "/best/touchscreen-laptops-kenya", "touchscreen laptops in Kenya", ["touch screen laptop price in kenya"], "commercial", "Mapped"),
  L("Laptops", "16 GB RAM laptops", "/best/16gb-ram-laptops-kenya", "16GB RAM laptops in Kenya", ["16gb ram laptop price in kenya"], "commercial", "Mapped"),

  // ---------- Laptop brands, series and processors ----------
  L("Laptop brands", "HP laptops", "/laptops/hp-laptops-kenya", "HP laptops price in Kenya", ["hp laptops in kenya", "hp laptop prices nairobi"], "commercial", "Mapped", ["I need a shop in Nairobi to buy an HP laptop"]),
  L("Laptop brands", "Lenovo laptops", "/laptops/lenovo-laptops-kenya", "Lenovo laptops price in Kenya", ["lenovo laptops in kenya"], "commercial", "Mapped"),
  L("Laptop brands", "Dell laptops", "/laptops/dell-laptops-kenya", "Dell laptops price in Kenya", ["dell laptops in kenya", "dell xps price in kenya"], "commercial", "Mapped", [], "XPS has too few models for its own page; folded in here."),
  L("Laptop brands", "HP vs Dell vs Lenovo", "/hp-vs-dell-vs-lenovo-laptops-kenya", "HP vs Dell vs Lenovo laptops", ["hp or dell which is better kenya", "best laptop brand in kenya"], "commercial", "Mapped"),
  L("Laptop brands", "ThinkPad", "/series/thinkpad-kenya", "Lenovo ThinkPad price in Kenya", ["thinkpad price in kenya", "thinkpad t480 price kenya", "thinkpad x1 carbon price kenya"], "commercial", "Mapped", ["Find a Nairobi shop that sells Lenovo ThinkPads"]),
  L("Laptop brands", "EliteBook", "/series/elitebook-kenya", "HP EliteBook price in Kenya", ["elitebook price in kenya", "hp elitebook 840 price kenya", "elitebook x360 price kenya"], "commercial", "Mapped", ["Find a Nairobi shop that sells HP EliteBook laptops"]),
  L("Laptop brands", "Latitude", "/series/latitude-kenya", "Dell Latitude price in Kenya", ["latitude laptop price kenya"], "commercial", "Mapped"),
  L("Laptop brands", "ZBook", "/series/zbook-kenya", "HP ZBook price in Kenya", ["zbook price kenya", "hp workstation laptop kenya"], "commercial", "Mapped"),
  L("Laptop brands", "HP x360", "/series/x360-kenya", "HP x360 price in Kenya", ["hp x360 laptop kenya", "elitebook x360 kenya"], "commercial", "Mapped"),
  L("Laptop brands", "ProBook", "", "HP ProBook price in Kenya", ["probook price in kenya"], "commercial", "To create", [], "Generated page fails the 900-word gate (20 models); covered by /laptops/hp-laptops-kenya meanwhile."),
  L("Laptop brands", "MacBook", "", "MacBook price in Kenya", ["macbook air price in kenya", "macbook pro price in kenya"], "commercial", "To create", ["I need a shop in Nairobi to buy a MacBook"], "12 MacBooks: series page fails the word gate and the Apple list duplicates the design page. /compare/macbook-vs-windows-laptops-kenya covers comparison intent only."),
  L("Laptop brands", "Core i5", "/laptops/core-i5-laptops-kenya", "Core i5 laptop price in Kenya", ["i5 laptop price in kenya", "core i5 8th gen laptop price kenya"], "commercial", "Mapped"),
  L("Laptop brands", "Core i7", "/laptops/core-i7-laptops-kenya", "Core i7 laptop price in Kenya", ["i7 laptop price in kenya"], "commercial", "Mapped"),
  L("Laptop brands", "Core Ultra", "/laptops/core-ultra-laptops-kenya", "Intel Core Ultra laptop price in Kenya", ["core ultra 7 laptop kenya", "ai laptop kenya"], "commercial", "Mapped"),
  L("Laptop brands", "AMD Ryzen", "/laptops/amd-ryzen-laptops-kenya", "AMD Ryzen laptop price in Kenya", ["ryzen 5 laptop price in kenya", "ryzen 7 laptop kenya"], "commercial", "Mapped"),

  // ---------- Comparisons ----------
  L("Comparisons", "ThinkPad vs EliteBook", "/compare/thinkpad-vs-elitebook-kenya", "ThinkPad vs EliteBook", ["thinkpad or elitebook", "elitebook vs thinkpad which is better"], "commercial", "Mapped"),
  L("Comparisons", "EliteBook vs Latitude", "/compare/elitebook-vs-latitude-kenya", "EliteBook vs Latitude", ["latitude vs elitebook"], "commercial", "Mapped"),
  L("Comparisons", "ThinkPad vs Latitude", "/compare/thinkpad-vs-latitude-kenya", "ThinkPad vs Latitude", ["latitude vs thinkpad"], "commercial", "Mapped"),
  L("Comparisons", "EliteBook vs ProBook", "/compare/elitebook-vs-probook-kenya", "EliteBook vs ProBook", ["probook vs elitebook difference"], "commercial", "Mapped"),
  L("Comparisons", "Core i5 vs i7", "/compare/core-i5-vs-core-i7-kenya", "Core i5 vs Core i7", ["core i5 vs core i7 laptop", "i5 or i7 laptop", "difference between i5 and i7 laptop price"], "commercial", "Mapped"),
  L("Comparisons", "Core Ultra vs i7", "/compare/core-ultra-vs-core-i7-kenya", "Core Ultra vs Core i7", ["core ultra 7 vs i7"], "commercial", "Mapped"),
  L("Comparisons", "8GB vs 16GB RAM", "/compare/8gb-vs-16gb-ram-kenya", "8GB vs 16GB RAM", ["8gb vs 16gb ram laptop", "is 8gb ram enough", "8gb or 16gb ram for students"], "commercial", "Mapped"),
  L("Comparisons", "MacBook vs Windows", "/compare/macbook-vs-windows-laptops-kenya", "MacBook vs Windows laptop", ["macbook or windows for university"], "commercial", "Mapped"),

  // ---------- Phones & tablets (pillar) ----------
  L("Phones & tablets", "Phones & tablets (pillar)", "/category/smartphones", "phones and tablets in Kenya", ["smartphones in kenya", "phone prices in kenya", "tablets price in kenya"], "transactional", "To optimize", [], "H1 is 'SmartPhones'."),
  L("Phones & tablets", "iPhone prices", "/phones/iphone-price-kenya", "iPhone price in Kenya", ["iphone prices in kenya", "iphone 16 price in kenya", "iphone 15 price in kenya", "iphone shop nairobi"], "commercial", "To create", ["Where can I buy an iPhone in Nairobi?"], "10 iPhones in stock."),
  L("Phones & tablets", "Samsung prices", "/phones/samsung-price-kenya", "Samsung phone price in Kenya", ["samsung galaxy price in kenya", "samsung s25 ultra price in kenya", "samsung tablet price in kenya"], "commercial", "To create", [], "17 Samsung phones and tablets in stock."),
  L("Phones & tablets", "Google Pixel prices", "/phones/google-pixel-price-kenya", "Google Pixel price in Kenya", ["pixel 9 price in kenya", "pixel phone kenya"], "commercial", "To create", [], "11 Pixels in stock."),
  L("Phones & tablets", "iPad prices", "/phones/ipad-price-kenya", "iPad price in Kenya", ["ipad air price in kenya", "ipad pro price in kenya", "ipad a16 price in kenya"], "commercial", "To create", [], "10 iPads in stock."),

  // ---------- Other categories ----------
  L("Computing", "PC accessories (pillar)", "/category/Computing-Accessories", "computer accessories in Kenya", ["pc accessories kenya", "laptop accessories nairobi"], "transactional", "To optimize", [], "H1 'PC Accessories'."),
  L("Computing", "Monitors", "/category/Computing-Accessories/monitors", "monitors price in Kenya", ["computer monitor price in kenya", "curved monitor price in kenya", "34 inch monitor kenya"], "transactional", "To create", [], "Title reads 'monitors PC Accessories Prices in Kenya'. EMPTY since the 16 Nov restore (0 products): noindex and out of the sitemap until products are assigned to it in the admin."),
  L("Computing", "Gaming monitors & laptops", "/category/gaming", "gaming monitors in Kenya", ["gaming monitor price in kenya", "samsung odyssey price in kenya", "165hz monitor kenya"], "transactional", "To optimize", [], "Category holds gaming monitors and gaming laptops (no consoles); H1 'Gaming'."),
  L("Computing", "Printers", "/category/printers", "printers price in Kenya", ["printer prices in kenya", "epson printer price in kenya", "hp printer price in kenya", "kyocera printer price kenya"], "transactional", "To optimize", [], "H1 'Printers'."),
  L("Computing", "Mobile accessories", "/category/Mobile-Accessories", "phone accessories in Kenya", ["mobile accessories nairobi", "phone chargers kenya"], "transactional", "To optimize", [], "H1 'Mobile Accessories'."),
  L("Computing", "Audio", "/category/Audio-Accessories", "headphones and earbuds in Kenya", ["earbuds price in kenya", "headphones price in kenya"], "transactional", "To optimize", [], "H1 'Audio Accessories'; 13 products."),
  L("Computing", "Tech price statistics", "/research/tech-prices-kenya", "tech prices in Kenya", ["electronics prices in kenya", "phone vs laptop prices kenya"], "informational", "Mapped"),

  // ---------- Not sold ----------
  L("Not targeted", "Game consoles", "", "PS5 price in Kenya", ["playstation 5 price kenya", "xbox price kenya"], "commercial", "Not targeted", [], "No consoles in the catalogue."),
  L("Not targeted", "TVs", "", "TV prices in Kenya", ["smart tv price kenya"], "commercial", "Not targeted", [], "TV category is empty (noindex)."),
];

// Category pages: H1, title and noun (for "N <noun> in Kenya" titles and
// descriptions) from the map; the shop's own are bare category names.
// Keys are lower-case paths.
export const CATEGORY_SEO = {
  "/category/laptops": { noun: "Laptops", h1: "Laptops in Kenya" },
  "/category/smartphones": { noun: "Phones & Tablets", h1: "Phones & Tablets in Kenya" },
  "/category/computing-accessories": { noun: "Computer Accessories", h1: "Computer Accessories in Kenya" },
  "/category/mobile-accessories": { noun: "Phone Accessories", h1: "Phone Accessories in Kenya" },
  "/category/printers": { noun: "Printers", h1: "Printer Prices in Kenya" },
  "/category/gaming": { noun: "Gaming Monitors & Laptops", h1: "Gaming Monitors & Laptops in Kenya" },
  "/category/audio-accessories": { noun: "Headphones & Earbuds", h1: "Headphones & Earbuds in Kenya" },
  "/category/laptops/budget": { noun: "Budget Laptops", h1: "Budget Laptops in Kenya", title: "Budget Laptops in Kenya: Affordable Laptop Deals | ECB" },
  "/category/laptops/student-deals": { noun: "Student Laptop Deals", h1: "Student Laptop Deals in Kenya", title: "Student Laptop Deals in Kenya | ECB Technologies" },
  "/category/laptops/gaming": { noun: "Gaming Laptops", h1: "Gaming Laptops for Sale in Kenya", title: "Gaming Laptops for Sale in Kenya | ECB Technologies" },
  "/category/computing-accessories/monitors": { noun: "Monitors", h1: "Monitor Prices in Kenya", title: "Monitors Price in Kenya: Curved, 4K & Office | ECB" },
};
