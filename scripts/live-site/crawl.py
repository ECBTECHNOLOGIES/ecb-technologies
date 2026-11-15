import html, json, re, sys, time, urllib.request

OUT = sys.argv[1]
BASE = "https://www.ecbtechkenya.com"
UA = {"User-Agent": "Mozilla/5.0 (ECB SEO audit)"}

def get(url):
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                return r.read().decode("utf-8", "ignore")
        except Exception as e:
            time.sleep(3)
    return ""

def text(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()

slugs = []
for page in range(1, 70):
    s = get(f"{BASE}/category?page={page}")
    found = [m for m in re.findall(r'/item/([A-Za-z0-9-]+)"', s)]
    new = [f for f in dict.fromkeys(found) if f not in slugs]
    if not new:
        break
    slugs += new
    time.sleep(0.4)
print("listing pages done:", len(slugs), flush=True)

with open(OUT, "w") as out:
    for i, slug in enumerate(slugs):
        s = get(f"{BASE}/item/{slug}")
        def meta(pattern):
            m = re.search(pattern, s, re.S)
            return html.unescape(m.group(1)).strip() if m else None
        h1 = [text(h) for h in re.findall(r"<h1[^>]*>(.*?)</h1>", s, re.S)]
        crumbs = [text(c) for c in re.findall(r'<a[^>]+href="https://www\.ecbtechkenya\.com/category/[^"]*"[^>]*>(.*?)</a>', s, re.S)]
        rec = {
            "slug": slug,
            "title": meta(r"<title>(.*?)</title>"),
            "h1": h1[0] if h1 else None,
            "keywords": meta(r'name="keywords"\s+content="([^"]*)"'),
            "description": meta(r'name="description"\s+content="([^"]*)"'),
            "og_image": meta(r'property="og:image"\s+content="([^"]*)"'),
            "price": meta(r'id="product_price" value="([^"]*)"'),
            "id": meta(r'id="product_id" value="([^"]*)"'),
            "in_stock": "ecb-pd-stock-badge--in" in s,
            "crumbs": crumbs[:4],
            "body": text(m.group(1))[:3000] if (m := re.search(r'id="ecbPdDescription"[^>]*>(.*?)(?:<div class="tab-pane|</section>)', s, re.S)) else None,
            "bytes": len(s),
        }
        out.write(json.dumps(rec) + "\n")
        if i % 50 == 0:
            print("products:", i, flush=True)
        time.sleep(0.3)
print("done", flush=True)
