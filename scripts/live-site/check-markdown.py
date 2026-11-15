"""Checks that every public page has a working markdown version.

For each URL in the live sitemap it requests <url>.md (index.md for the home
page) and fails if the answer is not 200 text/markdown with a canonical
pointing back to the HTML page. Also checks content negotiation and the
site files. Run after adding a page type or changing markdown.js:

    python3 -I check-markdown.py            # exits 1 on any failure
"""
import json
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

SITE = "https://www.ecbtechkenya.com"


def get(url, accept=None, method="GET"):
    req = urllib.request.Request(url, method=method, headers={"User-Agent": "ECB markdown check", **({"Accept": accept} if accept else {})})
    try:
        r = urllib.request.urlopen(req, timeout=90)
        return r.status, dict(r.headers), r.read().decode("utf-8", "replace") if method == "GET" else ""
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read().decode("utf-8", "replace")


def md_url(url):
    path = url[len(SITE):] or "/"
    return SITE + ("/index.md" if path == "/" else path + ".md")


def check(url):
    st, h, body = get(md_url(url))
    ok = st == 200 and h.get("Content-Type", "").startswith("text/markdown") and body.startswith("# ") and f"Canonical: {url}" in body
    return url, ok, st


def main():
    failures = []
    sitemap = get(SITE + "/sitemap.xml")[2]
    urls = re.findall(r"<loc>([^<]+)</loc>", sitemap)
    with ThreadPoolExecutor(8) as ex:
        results = list(ex.map(check, urls))
    failures += [f"{u} -> {st}" for u, ok, st in results if not ok]
    print(f"markdown versions: {sum(ok for _, ok, _ in results)}/{len(urls)} ok")
    tests = [
        ("Accept: text/markdown gets markdown", lambda: get(SITE + "/delivery", "text/markdown")[1].get("Content-Type", "").startswith("text/markdown")),
        ("Accept: */* gets HTML", lambda: get(SITE + "/", "*/*")[1].get("Content-Type", "").startswith("text/html")),
        ("no Accept gets HTML", lambda: get(SITE + "/")[1].get("Content-Type", "").startswith("text/html")),
        ("missing page is a markdown 404", lambda: get(SITE + "/does-not-exist.md")[0] == 404),
        ("private page is not exposed", lambda: get(SITE + "/user/login.md")[0] == 404),
        ("llms.txt", lambda: get(SITE + "/llms.txt")[2].startswith("# ECB Technologies")),
        ("llms-full.txt under 500k", lambda: 0 < len(get(SITE + "/llms-full.txt")[2]) < 500000),
        ("ai.txt", lambda: "[identity]" in get(SITE + "/ai.txt")[2]),
        ("catalog", lambda: json.loads(get(SITE + "/api/md/_catalog")[2])["count"] > 100),
        ("robots.txt welcomes AI search bots", lambda: "OAI-SearchBot" in get(SITE + "/robots.txt")[2]),
        ("home has ai-summary + markdown alternate", lambda: all(x in get(SITE + "/")[2] for x in ['name="ai-summary"', 'type="text/markdown"'])),
    ]
    for name, fn in tests:
        try:
            ok = fn()
        except Exception as e:
            ok = False
        print(("PASS " if ok else "FAIL ") + name)
        if not ok:
            failures.append(name)
    if failures:
        print("\n".join(failures[:20]))
        sys.exit(1)


if __name__ == "__main__":
    main()
