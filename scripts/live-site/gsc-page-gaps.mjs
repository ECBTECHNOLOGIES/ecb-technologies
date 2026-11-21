// One page's Search Console queries against what the page actually says.
//
//   node scripts/live-site/gsc-page-gaps.mjs <page URL or path> <Queries.csv>
//
// Export: Search Console → Performance → Search results → "+ New" filter →
// Page → exact URL → date range "Last 7 days" (or 28) → Export → CSV; use
// "Queries.csv" from the download.
//
// Lists:
//   1. Queries with impressions that the page doesn't mention.
//   2. Queries ranking in positions 10–30 (the "goldmine").
// For each it suggests where to add it (new FAQ entry, new section, or a
// sentence tweak) and prints a starter block for docs/seo/live-site/
// additions.json. Write the answers yourself, then run page-additions.mjs.
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const SITE = "https://www.ecbtechkenya.com";
const [target, csv] = process.argv.slice(2);
if (!target || !csv) {
  console.error("usage: node scripts/live-site/gsc-page-gaps.mjs <page URL or path> <Queries.csv>");
  process.exit(2);
}
const path = target.replace(SITE, "").replace(/\/$/, "") || "/";
const curl = (a) => execFileSync("curl", ["-s", ...a], { maxBuffer: 64 << 20 }).toString();
const md = curl(["-A", "Mozilla/5.0 (ECB gaps)", `${SITE}${path === "/" ? "/index" : path}.md`]);
if (!md || /^<!doctype/i.test(md)) throw new Error(`could not read ${SITE}${path}.md`);
const text = md.toLowerCase().replace(/ksh\s*/g, "").replace(/[^a-z0-9.]+/g, " ");
const headings = (md.match(/^#{2,3} .+$/gm) || []).map((h) => h.replace(/^#+ /, ""));

const lines = fs.readFileSync(csv, "utf8").replace(/^﻿/, "").trim().split(/\r?\n/);
const split = (l) => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).slice(0, -1).map((c) => c.replace(/,$/, "").replace(/^"|"$/g, ""));
const head = split(lines.shift()).map((h) => h.toLowerCase());
const col = (m) => head.findIndex((h) => h.endsWith(m) && !/previous/.test(h));
const [ii, pi, ci] = [col("impressions"), col("position"), col("clicks")];
const queries = lines.map(split).map((r) => ({ q: r[0], imp: Number(r[ii]) || 0, pos: Number(r[pi]) || 0, clicks: Number(r[ci]) || 0 }));

const STOP = new Set("a an the in of for to and or is are what which how best buy price prices kenya nairobi with on at near me my i do does can vs".split(" "));
const words = (q) => q.toLowerCase().replace(/[^a-z0-9.]+/g, " ").trim().split(" ").filter((w) => w && !STOP.has(w));
const coverage = (q) => {
  const ws = words(q);
  if (!ws.length) return 1;
  return ws.filter((w) => text.includes(` ${w} `) || text.includes(` ${w.replace(/s$/, "")} `)).length / ws.length;
};
const isQuestion = (q) => /^(how|what|which|where|is|are|can|does|do|why|when|should|will)\b/i.test(q) || /\?$/.test(q);
const where = (x) => {
  if (isQuestion(x.q)) return "new FAQ entry (question → 1–3 sentence answer)";
  if (x.cov < 0.5 && words(x.q).length >= 3) return "new H2 section";
  if (x.cov < 1) return "tweak an existing sentence to include the missing words";
  return "already covered: strengthen (put it in a heading or the first paragraph)";
};
const rows = queries.map((x) => ({ ...x, cov: coverage(x.q) }));
const missing = rows.filter((x) => x.imp > 0 && x.cov < 1).sort((a, b) => b.imp - a.imp).slice(0, 30);
const gold = rows.filter((x) => x.pos >= 10 && x.pos <= 30).sort((a, b) => b.imp - a.imp).slice(0, 30);

console.log(`Page: ${SITE}${path}\nSections now: ${headings.join(" · ")}\n`);
console.log("1. Queries with impressions the page doesn't fully mention\n");
for (const x of missing) console.log(`  "${x.q}"  ${x.imp} impr, pos ${x.pos.toFixed(1)}, ${Math.round(x.cov * 100)}% of words on page → ${where(x)}`);
if (!missing.length) console.log("  none");
console.log("\n2. Positions 10–30 (closest to page 1)\n");
for (const x of gold) console.log(`  "${x.q}"  ${x.imp} impr, pos ${x.pos.toFixed(1)} → ${where(x)}`);
if (!gold.length) console.log("  none");

const qs = [...new Map([...missing, ...gold].filter((x) => isQuestion(x.q)).map((x) => [x.q, x])).values()].slice(0, 5);
const secs = [...new Map([...missing, ...gold].filter((x) => !isQuestion(x.q) && x.cov < 0.5 && words(x.q).length >= 3).map((x) => [x.q, x])).values()].slice(0, 3);
if (qs.length || secs.length) {
  const block = { [path]: {
    sections: secs.map((x) => ({ heading: x.q.replace(/^\w/, (m) => m.toUpperCase()), body: "TODO: write 2–4 sentences that answer this, with numbers from the page where possible." })),
    faq: qs.map((x) => ({ question: x.q.replace(/^\w/, (m) => m.toUpperCase()).replace(/\??$/, "?"), answer: "TODO" })),
  } };
  console.log("\nStarter block for docs/seo/live-site/additions.json (replace every TODO, then run page-additions.mjs):\n");
  console.log(JSON.stringify(block, null, 2));
}
