// Builds the "used CSS" for the ecb-speed Worker: the rules from the merged
// stylesheet that match something on real shop pages (home, categories,
// products), in phone and desktop sizes, after the page's scripts have run.
// The stylesheet is parsed by Chrome itself (so theme CSS errors are handled
// exactly as browsers do). Pseudo-classes (:hover, ::before...) are ignored
// when matching, so hover/focus styles of matched elements are kept.
//
// Usage: node used-css.js <bundle-url> <bundle-file> <out.js>
const { chromium, devices } = require("playwright");
const fs = require("fs");

const B = "https://www.ecbtechkenya.com";
const PAGES = [
  "/", "/category", "/category/laptops", "/category/gaming", "/category/printers", "/category?search=hp",
  "/category/laptops?sort=price_asc",
  "/item/dell-xps-13-9305-i7-11th-gen-16-gb-ram-512-touchscreen-vzk6882nzg",
  "/item/kyocera-ecosys-fs-1025mfp-d3j2506q9o",
  "/item/acer-projector-1128h-4800-lumens-ndi3977gff",
  "/item/hp-15-core-ultra-5-1334u-8gb-512gb-ssd-dos-156-touch-silver-aue6748vj5",
  "/item/lenovo-thinkpad-t15p-i7-10th-gen-16gb-512ssd-2gb-invidia-geforce-gtx-graphics-non-touch-zm76349s4g",
  "/item/samsung-m8-smart-monitor-ls32fm801umxue-32-4k-smart-usb-c-60hz-built-in-speakers-webcam-white-tfx4771hq4",
];

// Runs in the page. Returns ids ("3/1") of style rules matching the page.
function findUsed(cssText) {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssText);
  const split = (s) => {
    const out = []; let depth = 0, cur = "";
    for (const ch of s) {
      if (ch === "(" || ch === "[") depth++;
      if (ch === ")" || ch === "]") depth--;
      if (ch === "," && depth === 0) { out.push(cur); cur = ""; } else cur += ch;
    }
    out.push(cur);
    return out.map((x) => x.trim()).filter(Boolean);
  };
  const strip = (sel) =>
    sel.replace(/::?-(webkit|moz|ms)-[\w-]+(\([^)]*\))?/g, "")
      .replace(/::?(hover|focus-visible|focus-within|focus|active|visited|link|before|after|placeholder-shown|placeholder|selection|marker|checked|disabled|enabled|invalid|valid|target|first-letter|first-line|backdrop|indeterminate|autofill|read-only|required|optional|default|empty|user-invalid|user-valid)(?![\w-])(\([^)]*\))?/g, "")
      .trim() || "*";
  const used = [];
  const walk = (rules, prefix) => {
    [...rules].forEach((r, i) => {
      const id = prefix + i;
      if (r instanceof CSSStyleRule) {
        const ok = split(r.selectorText).some((s) => {
          try { return !!document.querySelector(strip(s)); } catch { return true; }
        });
        if (ok) used.push(id);
      } else if (r.cssRules && !(r instanceof CSSKeyframesRule)) walk(r.cssRules, id + "/");
    });
  };
  walk(sheet.cssRules, "");
  return used;
}

// Runs in the page. Serializes the kept rules.
function serialize({ cssText, used }) {
  const keep = new Set(used);
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssText);
  const names = new Set();
  const out = [];
  const walk = (rules, prefix) => {
    const parts = [];
    [...rules].forEach((r, i) => {
      const id = prefix + i;
      if (r instanceof CSSStyleRule) {
        if (keep.has(id)) {
          parts.push(r.cssText);
          const a = (r.style.animationName || "") + "," + (r.style.getPropertyValue("-webkit-animation-name") || "");
          a.split(",").forEach((n) => n.trim() && names.add(n.trim()));
        }
      } else if (r instanceof CSSKeyframesRule) {
        parts.push({ keyframes: r });
      } else if (r instanceof CSSFontFaceRule) {
        parts.push(r.cssText);
      } else if (r.cssRules) {
        const inner = walk(r.cssRules, id + "/");
        if (inner.length) {
          const head = r.cssText.slice(0, r.cssText.indexOf("{")).trim();
          parts.push({ head, inner });
        }
      }
    });
    return parts;
  };
  const tree = walk(sheet.cssRules, "");
  const render = (parts) =>
    parts.map((p) => {
      if (typeof p === "string") return p;
      if (p.keyframes) return names.has(p.keyframes.name) ? p.keyframes.cssText : "";
      const inner = render(p.inner).filter(Boolean);
      return inner.length ? `${p.head}{${inner.join("")}}` : "";
    }).filter(Boolean);
  return render(tree).join("\n");
}

(async () => {
  const [bundleUrl, file, out] = process.argv.slice(2);
  const cssText = fs.readFileSync(file, "utf8");
  const typeOf = (path) => (path === "/" ? "home" : path.startsWith("/item/") ? "item" : "category");
  const used = { home: new Set(), category: new Set(), item: new Set() };
  const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  let lastPage = null, lastCtx = null;
  for (const [name, opts] of [["phone", devices["Moto G4"]], ["desktop", { viewport: { width: 1350, height: 940 } }]]) {
    for (const path of PAGES) {
      const ctx = await browser.newContext(opts);
      const page = await ctx.newPage();
      await page.goto(B + path, { waitUntil: "load", timeout: 90000 });
      await page.waitForTimeout(2500);
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
      await page.waitForTimeout(800);
      const hits = await page.evaluate(findUsed, cssText);
      hits.forEach((h) => used[typeOf(path)].add(h));
      console.log(`${name} ${path}: ${hits.length} rules match`);
      if (lastCtx) await lastCtx.close();
      lastPage = page; lastCtx = ctx;
    }
  }
  const result = {};
  for (const type of Object.keys(used)) {
    result[type] = await lastPage.evaluate(serialize, { cssText, used: [...used[type]] });
    console.log(`${type}: bundle ${cssText.length} bytes -> used ${result[type].length} bytes`);
  }
  await browser.close();
  const hash = (bundleUrl.match(/bundle-([0-9a-f]+)\.css/) || [])[1];
  fs.writeFileSync(out, `// Generated by scripts/live-site/used-css.js from bundle ${hash}. Do not edit.\nexport const USED_FOR = ${JSON.stringify(hash)};\nexport const USED_CSS = ${JSON.stringify(result)};\n`);
})();
