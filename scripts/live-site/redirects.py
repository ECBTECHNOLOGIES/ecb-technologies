"""After the SEO run: find each product's new address and pair it with the old one.
Old addresses come from the original crawl (products.jsonl, keyed by product id).
Output: Cloudflare Bulk Redirects CSV (source,target,301) for www and bare domain."""
import json, re, sys, time, urllib.request

old_file, out_csv, out_report = sys.argv[1:4]
BASE = "https://www.ecbtechkenya.com"
UA = {"User-Agent": "Mozilla/5.0 (ECB SEO redirects)"}

def get(url):
    for _ in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                return r.status, r.read().decode("utf-8", "ignore")
        except urllib.error.HTTPError as e:
            return e.code, ""
        except Exception:
            time.sleep(3)
    return 0, ""

old = {}
for line in open(old_file):
    r = json.loads(line)
    old[r["id"]] = r["slug"]
old_slugs = set(old.values())

current = []
for page in range(1, 80):
    _, s = get(f"{BASE}/category?page={page}")
    found = [m for m in dict.fromkeys(re.findall(r'/item/([A-Za-z0-9-]+)"', s)) if m not in current]
    if not found:
        break
    current += found
    time.sleep(0.4)
print("current product addresses:", len(current), flush=True)

new_by_id = {}
for i, slug in enumerate(current):
    if slug in old_slugs:
        continue  # unchanged address
    _, s = get(f"{BASE}/item/{slug}")
    m = re.search(r'id="product_id" value="([^"]*)"', s)
    if m:
        new_by_id[m.group(1)] = slug
    if i % 50 == 0:
        print("checked", i, flush=True)
    time.sleep(0.3)

pairs = [(old[pid], new) for pid, new in new_by_id.items() if pid in old and old[pid] != new]
missing = [pid for pid, s in old.items() if s not in current and pid not in new_by_id]
with open(out_csv, "w") as f:
    for o, n in pairs:
        for host in ("www.ecbtechkenya.com", "ecbtechkenya.com"):
            f.write(f"{host}/item/{o},{BASE}/item/{n},301\n")
with open(out_report, "w") as f:
    json.dump({"changed": len(pairs), "unchanged": len([s for s in current if s in old_slugs]),
               "old_products_not_found": missing}, f, indent=1)
print("changed:", len(pairs), "| old products not found now:", len(missing), flush=True)
