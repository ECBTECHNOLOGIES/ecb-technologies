// Unit tests for docs/seo/live-site/research.js. Run: node test-research.mjs
// (copies the modules to a temp folder as .mjs so Node can import them).
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const src = join(dirname(fileURLToPath(import.meta.url)), "../../docs/seo/live-site");
const dir = mkdtempSync(join(tmpdir(), "ecb-research-"));
for (const f of ["research", "catalog-map"]) {
  writeFileSync(join(dir, `${f}.mjs`), readFileSync(join(src, `${f}.js`), "utf8").replace(/\.\/([a-z-]+)\.js"/g, './$1.mjs"'));
}
const R = await import(join(dir, "research.mjs"));
const { CATEGORY_OF, CATEGORIES } = await import(join(dir, "catalog-map.mjs"));

let passed = 0;
const test = (name, fn) => {
  fn();
  passed++;
  console.log("ok -", name);
};

// Synthetic laptops: use real laptop slugs from catalog-map so categories resolve.
const laptopSlugs = Object.keys(CATEGORY_OF).filter((s) => CATEGORIES[CATEGORY_OF[s]][0] === "laptops");
const make = (n, price) => laptopSlugs.slice(0, n).map((slug, i) => ({ slug, name: slug, url: `/item/${slug}`, price: price(i, slug) }));

test("shares add up to exactly 100", () => {
  for (const counts of [[1, 1, 1], [7, 0, 2, 9], [333, 333, 334], [1, 2, 3, 4, 5, 6, 7]]) assert.equal(R.shares(counts).reduce((a, b) => a + b, 0), 100);
});

test("price bands do not overlap and cover every price", () => {
  for (const p of [1001, 29999, 30000, 49999, 50000, 119999, 120000, 1999999]) {
    assert.equal(R.LAPTOP_BANDS.filter(([lo, hi]) => p >= lo && p < hi).length, 1, `price ${p}`);
  }
});

test("band counts add up to the number of laptops", () => {
  const s = R.computeLaptopStudy(make(200, (i) => 15000 + i * 1000));
  const t = s.tables.find((x) => x.id === "by-budget");
  assert.equal(t.rows.reduce((a, r) => a + Number(r[1]), 0), s.n);
  assert.equal(t.rows.reduce((a, r) => a + Number(r[2].replace("%", "")), 0), 100);
});

test("comparison flips with the data", () => {
  assert.equal(R.compare(100, 50), "more");
  assert.equal(R.compare(50, 100), "less");
  assert.equal(R.compare(100, 98), "same");
  const cheapI7 = R.computeLaptopStudy(make(laptopSlugs.length, (i, s) => (/-i7-/.test(`-${s}-`) ? 20000 : 90000)));
  const f = cheapI7.findings.find((x) => x.id === "core-i7-vs-core-i5");
  if (f) assert.match(f.text, /less than the median Core i5/);
  const dearI7 = R.computeLaptopStudy(make(laptopSlugs.length, (i, s) => (/-i7-/.test(`-${s}-`) ? 90000 : 20000)));
  const g = dearI7.findings.find((x) => x.id === "core-i7-vs-core-i5");
  if (g) assert.match(g.text, /more than the median Core i5/);
});

test("small gaps are reported as about the same", () => {
  const s = R.computeLaptopStudy(make(laptopSlugs.length, (i, sl) => (/-i7-/.test(`-${sl}-`) ? 50000 : 49000)));
  const f = s.findings.find((x) => x.id === "core-i7-vs-core-i5");
  if (f) assert.match(f.text, /about the same/);
});

test("thin data produces no findings", () => {
  assert.equal(R.computeLaptopStudy(make(R.MIN_SAMPLE - 1, () => 30000)).findings.length, 0);
  assert.equal(R.computeCategoryStudy(make(5, () => 30000)).findings.length, 0);
});

test("unusable prices and duplicates are excluded", () => {
  const rows = make(30, () => 40000);
  rows.push({ ...rows[0] }, { ...rows[1], slug: rows[1].slug + "-x", price: 5700027 }, { ...rows[2], slug: rows[2].slug + "-y", price: 0 });
  assert.equal(R.cleanRows(rows).length, 30);
});

test("finding and answer anchors are unique", () => {
  const s = R.computeLaptopStudy(make(laptopSlugs.length, (i) => 15000 + (i % 50) * 3000));
  const c = R.computeCategoryStudy(make(laptopSlugs.length, (i) => 15000 + i * 100));
  for (const st of [s, c]) {
    const ids = [...st.findings.map((f) => f.id), ...st.faq.map((f) => f.id), ...st.tables.map((t) => t.id)];
    assert.equal(new Set(ids).size, ids.length);
  }
});

test("median is correct for odd and even counts", () => {
  assert.equal(R.median([3, 1, 2]), 2);
  assert.equal(R.median([1, 2, 3, 4]), 3);
});

test("percentages in findings match the tables", () => {
  const s = R.computeLaptopStudy(make(laptopSlugs.length, (i) => 15000 + (i % 40) * 4000));
  const t = s.tables.find((x) => x.id === "by-budget");
  const f = s.findings.find((x) => x.id === "laptops-under-30000");
  assert.ok(f.text.includes(`(${t.rows[0][2]})`) && f.text.includes(`(${t.rows[4][2]})`));
});

console.log(`\n${passed} tests passed`);
