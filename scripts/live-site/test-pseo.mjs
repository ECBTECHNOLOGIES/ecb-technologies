// Tests for the programmatic guide pages (docs/seo/live-site/pseo.js).
// Run: node scripts/live-site/test-pseo.mjs
import assert from "node:assert/strict";
import * as G from "../../docs/seo/live-site/pseo.js";
import { CATEGORIES, CATEGORY_OF } from "../../docs/seo/live-site/catalog-map.js";

let passed = 0;
const test = (name, fn) => {
  fn();
  passed++;
  console.log(`ok - ${name}`);
};
const laptopSlugs = Object.keys(CATEGORY_OF).filter((s) => CATEGORIES[CATEGORY_OF[s]][0] === "laptops");
const make = (f) => laptopSlugs.map((slug, i) => ({ slug, name: slug.replace(/-/g, " ").slice(0, 40), url: `https://www.ecbtechkenya.com/item/${slug}`, price: f(i) }));
const built = G.buildPages(make((i) => 15000 + (i % 60) * 3500), { changedAt: "2026-11-15T00:00:00Z" });

test("specs are read from the address", () => {
  const s = G.specsOf("dell-xps-13-9305-i7-11th-gen-16-gb-ram-512-touchscreen-vzk6882nzg");
  assert.equal(s.cpu, "Core i7");
  assert.equal(s.gen, 11);
  assert.equal(s.ram, 16);
  assert.equal(s.touch, true);
  const t = G.specsOf("lenovo-thinkpad-x280-i5-8th-gen-16-256-gb-non-touch-jfj18032zy");
  assert.equal(t.ram, 16);
  assert.equal(t.ssd, 256);
  assert.equal(t.touch, false);
  assert.equal(G.specsOf("hp-elitebook-x360-1030-g3-i7-8th-gen-16512-gb-ssd-touch-abc").ssd, 512);
});
test("score never exceeds its published maximum", () => {
  for (const slug of laptopSlugs) assert.ok(G.score(G.specsOf(slug)) <= G.SCORE_MAX);
});
test("slugs and primary keywords are unique", () => {
  const urls = built.pages.map((d) => d.url);
  const kws = built.pages.map((d) => d.seo.primary_keyword.toLowerCase());
  assert.equal(new Set(urls).size, urls.length);
  assert.equal(new Set(kws).size, kws.length);
});
test("every published page meets the quality gates", () => {
  for (const d of built.pages) {
    const min = /-price-kenya$/.test(d.url) && /\/laptops\//.test(d.url) ? 300 : /Comparisons|Profiles|Locations/.test(d.playbook_type) ? 900 : 600;
    assert.ok(G.wordCount(d) >= min, `${d.url} words`);
    assert.ok(d.content.faq.length >= 3, `${d.url} faq`);
    assert.ok(d.internal_links.length >= 5, `${d.url} links`);
    assert.ok(d.related_pages.length >= 2, `${d.url} related`);
    assert.ok(d.seo.title.length <= 60, `${d.url} title ${d.seo.title}`);
    assert.ok(d.seo.meta_description.length <= 160, `${d.url} description`);
  }
});
test("no page links to a guide that does not exist", () => {
  const live = new Set(built.pages.map((d) => d.url));
  for (const d of built.pages) {
    for (const u of [...d.internal_links, ...d.related_pages.map((r) => r.url)]) {
      if (/\/(best|compare|series|laptops)\//.test(u)) assert.ok(live.has(u), `${d.url} -> ${u}`);
    }
    for (const s of d.content.sections) for (const m of s.body.matchAll(/\]\((https:\/\/www\.ecbtechkenya\.com\/(?:best|compare|series|laptops)\/[^)]+)\)/g)) assert.ok(live.has(m[1]), `${d.url} body -> ${m[1]}`);
  }
});
test("every listed product exists in the catalogue", () => {
  const known = new Set(laptopSlugs.map((s) => `https://www.ecbtechkenya.com/item/${s}`));
  for (const d of built.pages) for (const u of d.internal_links.concat(...d.content.sections.map((s) => [...s.body.matchAll(/\((https:\/\/www\.ecbtechkenya\.com\/item\/[^)]+)\)/g)].map((m) => m[1])))) if (u.includes("/item/")) assert.ok(known.has(u), u);
});
test("thin data publishes nothing and says why", () => {
  const b = G.buildPages(make((i) => 15000 + i).slice(0, 5));
  assert.equal(b.pages.length, 0);
  assert.ok(b.skipped.length > 0 && b.skipped.every((s) => s.status === "SKIPPED" && s.reason));
});
test("near-duplicate lists are merged, not published twice", () => {
  for (let i = 0; i < built.pages.length; i++)
    for (let j = i + 1; j < built.pages.length; j++) {
      const a = built.pages[i];
      const b = built.pages[j];
      if (a._view.kind !== b._view.kind || a._view.kind !== "list") continue;
      const la = a._view.sections.find((s) => s.items).items.map((x) => x.url);
      const lb = b._view.sections.find((s) => s.items).items.map((x) => x.url);
      const shared = la.filter((u) => lb.includes(u)).length;
      assert.ok(shared / Math.min(la.length, lb.length) <= G.MAX_OVERLAP, `${a.url} ~ ${b.url}`);
    }
});
test("one page per keyword cluster: duplicates merge with a target", () => {
  // HP vs Dell is covered by the existing three-way guide.
  assert.ok(built.skipped.some((s) => s.url && s.url.endsWith("/compare/hp-vs-dell-kenya") && /existing guide/.test(s.reason)));
  // Every merged page names the page it merged into, and that page is live.
  const live = new Set(built.pages.map((d) => d.url));
  for (const s of built.skipped.filter((x) => x.mergedInto)) assert.ok(live.has(s.mergedInto), `${s.url} -> ${s.mergedInto}`);
  // Primary keywords are unique across published pages.
  const kws = built.pages.map((d) => d.seo.primary_keyword.toLowerCase());
  assert.equal(new Set(kws).size, kws.length);
});
test("public JSON has exactly the requested keys", () => {
  const d = G.publicJson(built.pages[0]);
  assert.deepEqual(Object.keys(d), ["url", "playbook_type", "seo", "content", "schema", "internal_links", "related_pages", "data_requirements_used"]);
  assert.deepEqual(Object.keys(d.content), ["h1", "introduction", "sections", "faq", "call_to_action"]);
});
test("HP x360 page lists HP laptops only", () => {
  const d = built.pages.find((x) => x.url.endsWith("/series/x360-kenya"));
  if (d) for (const u of d.internal_links.filter((x) => x.includes("/item/"))) assert.ok(/\/item\/hp-/.test(u), u);
});

test("local page states the shop facts and links every audience guide", () => {
  // Needs the whole catalogue (phones, accessories), not just laptops.
  const everything = Object.keys(CATEGORY_OF).map((slug, i) => ({ slug, name: slug.replace(/-/g, " ").slice(0, 40), url: `https://www.ecbtechkenya.com/item/${slug}`, price: 15000 + (i % 60) * 3500 }));
  const d = G.buildPages(everything, { changedAt: "2026-11-15T00:00:00Z" }).pages.find((x) => x.url.endsWith("/laptop-shop-nairobi"));
  assert.ok(d, "local page published");
  assert.match(d.content.introduction, /Moi Avenue, Nairobi CBD/);
  assert.match(d.content.introduction, /Monday to Saturday, 9am to 7pm/);
  assert.ok(d.internal_links.some((u) => u.endsWith("/student-laptops-kenya")) || d.content.sections.some((s) => s.body.includes("/student-laptops-kenya")));
  assert.ok(!/best (laptop )?shop/i.test(d.content.introduction), "no unprovable 'best' claim");
  assert.equal(d.schema.structured_data["@graph"][0].mainEntity["@id"], "https://www.ecbtechkenya.com/#store");
});

test("model keys and names", () => {
  assert.equal(G.modelKey("hp-elitebook-840-g6-i5-8th-gen-8gb-ram-256gb-non-touch-jzv2433lv5"), "hp elitebook 840 g6");
  assert.equal(G.modelKey("lenovo-thinkpad-x280-i5-8th-gen-16-256-gb-non-touch-jfj18032zy"), "lenovo thinkpad x280");
  assert.equal(G.modelKey("dell-latitude-i5-8gb-abcdefghij"), null); // no model number
  assert.equal(G.modelName("hp elitebook 840 g6"), "HP EliteBook 840 G6");
  assert.equal(G.modelName("lenovo thinkpad t480s"), "Lenovo ThinkPad T480s");
});
test("new model and combo pages are released in daily batches; published ones stay", () => {
  const prices = (i) => 15000 + (i % 60) * 3500;
  const day1 = G.buildPages(make(prices), { changedAt: "2026-11-20T00:00:00Z" });
  const queued = day1.skipped.filter((s) => s.queued);
  assert.ok(Object.keys(day1.newlySeen).length > 0);
  // Day 2: day 1's pages are remembered, the next batch goes out.
  const seen = { ...day1.newlySeen };
  const day2 = G.buildPages(make(prices), { changedAt: "2026-11-21T00:00:00Z", firstSeen: seen });
  for (const d of day1.pages) assert.ok(day2.pages.some((x) => x.url === d.url), `kept ${d.url}`);
  const added = day2.pages.length - day1.pages.length;
  assert.ok(added <= G.DAILY_RELEASE && (queued.length === 0 || added > 0), `added ${added}`);
  // A day-2 batch never exceeds the cap.
  assert.ok(Object.keys(day2.newlySeen).length <= G.DAILY_RELEASE);
  // Nothing redirects to a page that is not live.
  const live = new Set(day2.pages.map((d) => d.url));
  for (const s of day2.skipped.filter((x) => x.mergedInto)) assert.ok(live.has(s.mergedInto));
});
test("combo pages compare against both parent groups and carry FAQ schema", () => {
  const all = Object.fromEntries([...built.pages.map((d) => [d.url, "2026-11-01"]), ...built.skipped.filter((s) => s.queued).map((s) => [s.url, "2026-11-01"])]);
  const b = G.buildPages(make((i) => 15000 + (i % 60) * 3500), { changedAt: "2026-11-15T00:00:00Z", firstSeen: all });
  const combos = b.pages.filter((d) => d.content.sections.some((s) => s.heading === "How this group compares"));
  assert.ok(combos.length > 0);
  for (const d of combos) {
    assert.ok(d.seo.title.length <= 60, d.seo.title);
    assert.ok(d.schema.structured_data["@graph"].some((g) => g["@type"] === "FAQPage"), d.url);
    assert.ok(!/\b(Under|Laptops)\b/.test(d.content.h1.replace(/^Best /, "")), d.content.h1);
  }
});
test("pruned pages are flagged (noindex), not deleted", () => {
  const anyUrl = built.pages[0].url;
  const b = G.buildPages(make((i) => 15000 + (i % 60) * 3500), { changedAt: "2026-11-15T00:00:00Z", pruned: [anyUrl] });
  const d = b.pages.find((x) => x.url === anyUrl);
  assert.ok(d && d._pruned === true);
  assert.ok(!("_pruned" in G.publicJson(d)));
});
test("model pages list only that model, at least MIN_CONFIGS configurations", () => {
  for (const d of built.pages.filter((x) => /\/laptops\/.*-price-kenya$/.test(x.url))) {
    const key = d.url.match(/\/laptops\/(.*)-price-kenya$/)[1].replace(/-/g, " ");
    const items = d.schema.structured_data["@graph"][0].mainEntity.itemListElement;
    assert.ok(items.length >= G.MIN_CONFIGS, d.url);
    for (const it of items) assert.equal(G.modelKey(it.url.split("/item/")[1]), key, `${d.url}: ${it.url}`);
  }
});

console.log(`\n${passed} tests passed`);
