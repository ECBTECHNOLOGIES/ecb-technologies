"""Daily backup of everything reachable without the hosting panel.

  python3 -I scripts/backup/backup.py <repo-root>

Writes into <repo-root>/backups/ (overwritten each run; git history keeps
every version):

  site/        markdown copy of every page in the sitemap (products, categories,
               guides, info pages), plus llms.txt, llms-full.txt, robots.txt
               and the sitemaps
  catalogue/   products.json and products.csv (slug, name, price, url) from the
               live "all products" page
  cloudflare/  Worker scripts (as deployed), Worker routes, KV keys and values,
               zone settings and a BIND export of the DNS records
  MANIFEST.md  what was saved, when, and anything that failed

Cloudflare calls rely on the environment's saved API token (the network proxy
adds it); nothing secret is read or written here.

NOT covered (needs the DirectAdmin panel, port 2222, unreachable from the cloud
sandbox): the shop's files and database, and ecb.lumina.co.ke. Those need the
panel's own scheduled backups (see docs/backups.md).
"""
import concurrent.futures as cf
import csv
import datetime as dt
import html
import json
import os
import re
import sys
import urllib.error
import urllib.request

SITE = "https://www.ecbtechkenya.com"
CF = "https://api.cloudflare.com/client/v4"
ACCOUNT = "3f36c314d659d48ad634e5b5b17830c7"
ZONE = "ceffc2034be3a0f007abe5ffadedfd93"
KV_NAMESPACE = "afab40b84f974ada97e6f8c469cab40c"
WORKERS = ["ecb-speed", "ecb-sitemap"]
UA = {"User-Agent": "Mozilla/5.0 (ECB backup)"}
MIN_PRODUCTS = 300  # refuse to overwrite a good backup with a cut-off catalogue

errors = []


def get(url, binary=False, tries=3):
    last = None
    for _ in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
                data = r.read()
                return data if binary else data.decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            last = f"HTTP {e.code}"
            if e.code in (401, 403, 404):
                break
        except Exception as e:  # timeouts, cut-off reads
            last = type(e).__name__
    raise RuntimeError(f"{url}: {last}")


def write(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb" if isinstance(data, bytes) else "w") as fh:
        fh.write(data)


def site(root):
    out = os.path.join(root, "site")
    for name in ["llms.txt", "llms-full.txt", "robots.txt", "sitemap.xml"]:
        try:
            write(os.path.join(out, name), get(f"{SITE}/{name}"))
        except Exception as e:
            errors.append(str(e))
    index = get(f"{SITE}/sitemap.xml")
    urls = []
    for sm in re.findall(r"<loc>([^<]+)</loc>", index):
        body = get(sm)
        write(os.path.join(out, sm.rsplit("/", 1)[1]), body)
        urls += re.findall(r"<loc>([^<]+)</loc>", body)

    def md(u):
        path = u[len(SITE):] or "/"
        target = "/index.md" if path == "/" else f"{path}.md"
        try:
            write(os.path.join(out, "pages", target.lstrip("/")), get(SITE + target))
            return None
        except Exception as e:
            return str(e)

    with cf.ThreadPoolExecutor(6) as ex:
        failed = [e for e in ex.map(md, urls) if e]
    errors.extend(failed[:20])
    return len(urls), len(failed)


def catalogue(root):
    page = get(f"{SITE}/category?pageby=10000")
    rows, seen = [], set()
    for card in page.split('<div class="ecb-fp-card"')[1:]:
        a = re.search(r'href="(https://www\.ecbtechkenya\.com/item/([A-Za-z0-9-]+))"', card)
        n = re.search(r'class="ecb-fp-name">\s*([^<]+?)\s*<', card)
        p = re.search(r'class="ecb-fp-price">\s*([^<]+?)\s*<', card)
        if a and n and a.group(2) not in seen:
            seen.add(a.group(2))
            price = re.sub(r"[^\d.]", "", p.group(1)) if p else ""
            rows.append({"slug": a.group(2), "name": html.unescape(n.group(1)), "price": price, "url": a.group(1)})
    if len(rows) < MIN_PRODUCTS:
        raise RuntimeError(f"catalogue: only {len(rows)} products read; previous backup kept")
    out = os.path.join(root, "catalogue")
    write(os.path.join(out, "products.json"), json.dumps(rows, indent=1, ensure_ascii=False))
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, "products.csv"), "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=["slug", "name", "price", "url"])
        w.writeheader()
        w.writerows(rows)
    return len(rows)


def cloudflare(root):
    out = os.path.join(root, "cloudflare")
    saved = []
    jobs = {
        "routes.json": f"{CF}/zones/{ZONE}/workers/routes",
        "zone-settings.json": f"{CF}/zones/{ZONE}/settings",
        "dns-records.json": f"{CF}/zones/{ZONE}/dns_records?per_page=500",
        "zone-rulesets.json": f"{CF}/zones/{ZONE}/rulesets",
    }
    for name, url in jobs.items():
        try:
            write(os.path.join(out, name), json.dumps(json.loads(get(url)).get("result"), indent=1))
            saved.append(name)
        except Exception as e:
            errors.append(str(e))
    try:
        write(os.path.join(out, "dns-export.bind"), get(f"{CF}/zones/{ZONE}/dns_records/export"))
        saved.append("dns-export.bind")
    except Exception as e:
        errors.append(str(e))
    for w in WORKERS:
        try:
            write(os.path.join(out, "workers", f"{w}.multipart"), get(f"{CF}/accounts/{ACCOUNT}/workers/scripts/{w}", binary=True))
            settings = json.loads(get(f"{CF}/accounts/{ACCOUNT}/workers/scripts/{w}/settings")).get("result") or {}
            # bindings only (names/types); secret values are never returned by the API
            write(os.path.join(out, "workers", f"{w}.settings.json"), json.dumps(settings, indent=1))
            saved.append(f"workers/{w}")
        except Exception as e:
            errors.append(str(e))
    try:
        keys = json.loads(get(f"{CF}/accounts/{ACCOUNT}/storage/kv/namespaces/{KV_NAMESPACE}/keys?limit=1000")).get("result") or []
        kv = {}
        for k in keys:
            name = k["name"]
            if name.startswith(("http://", "https://", "page:")) or len(kv) > 200:  # page cache: not worth keeping
                continue
            try:
                kv[name] = get(f"{CF}/accounts/{ACCOUNT}/storage/kv/namespaces/{KV_NAMESPACE}/values/{urllib.request.quote(name, safe='')}")
            except Exception as e:
                errors.append(str(e))
        write(os.path.join(out, "kv.json"), json.dumps(kv, indent=1, ensure_ascii=False))
        saved.append(f"kv ({len(kv)} keys of {len(keys)})")
    except Exception as e:
        errors.append(str(e))
    return saved


def main(repo):
    root = os.path.join(repo, "backups")
    started = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    lines = [f"# Backup {started}", ""]
    try:
        n, failed = site(root)
        lines.append(f"- site: {n} sitemap pages saved as markdown ({failed} failed)")
    except Exception as e:
        errors.append(f"site: {e}")
    try:
        lines.append(f"- catalogue: {catalogue(root)} products")
    except Exception as e:
        errors.append(str(e))
    try:
        lines.append(f"- cloudflare: {', '.join(cloudflare(root))}")
    except Exception as e:
        errors.append(f"cloudflare: {e}")
    lines += ["- not covered: shop files and database, ecb.lumina.co.ke (DirectAdmin panel only; see docs/backups.md)", ""]
    if errors:
        lines += ["## Problems", ""] + [f"- {e}" for e in errors[:50]] + [""]
    write(os.path.join(root, "MANIFEST.md"), "\n".join(lines))
    print("\n".join(lines))
    return 1 if any(e.startswith(("site:", "catalogue")) for e in errors) else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "."))
