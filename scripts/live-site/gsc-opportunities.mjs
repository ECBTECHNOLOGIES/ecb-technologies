// What to fix next, from a Search Console export.
//
//   node scripts/live-site/gsc-opportunities.mjs <Pages.csv> [Queries.csv]
//
// Export: Search Console → Performance → Search results → last 3 months →
// Export → CSV. Unzip; use "Pages.csv" (and optionally "Queries.csv").
// For the "losing traffic" list, first click "Compare" → "Compare last 3
// months to previous period", then export: the CSV then has two columns per
// metric, and the script reads both.
//
// Prints four lists:
//   1. Low CTR for their position: rewrite the title and meta description.
//   2. Page 2 (positions 11-20): refresh and add internal links.
//   3. Losing clicks against the previous period (needs a compare export).
//   4. Queries with impressions but no page targeting them (needs Queries.csv):
//      candidates for an FAQ entry or a new page.
import fs from "node:fs";
import { INTENTS, classify } from "./gsc-intents.mjs";

const [pagesCsv, queriesCsv] = process.argv.slice(2);
if (!pagesCsv) {
  console.error("usage: node scripts/live-site/gsc-opportunities.mjs <Pages.csv> [Queries.csv]");
  process.exit(2);
}

function readCsv(path) {
  const lines = fs.readFileSync(path, "utf8").replace(/^﻿/, "").trim().split(/\r?\n/);
  const split = (line) => line.match(/("([^"]|"")*"|[^,]*)(,|$)/g).slice(0, -1).map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"'));
  const head = split(lines.shift()).map((h) => h.trim());
  return { head, rows: lines.map(split) };
}
const num = (v) => Number(String(v || "").replace(/[%,]/g, "")) || 0;
// Columns: "Clicks", or "Last 3 months Clicks" / "Previous 3 months Clicks".
function cols(head, metric) {
  const all = head.map((h, i) => [h, i]).filter(([h]) => h.toLowerCase().endsWith(metric));
  const cur = all.find(([h]) => !/previous/i.test(h)) || all[0];
  const prev = all.find(([h]) => /previous/i.test(h));
  return { cur: cur ? cur[1] : -1, prev: prev ? prev[1] : -1 };
}
// Typical organic CTR by position (rough, desktop + mobile).
const EXPECTED = [0, 0.28, 0.16, 0.11, 0.08, 0.06, 0.05, 0.04, 0.035, 0.03, 0.025];
const expected = (pos) => (pos < 1 ? 0.28 : pos <= 10 ? EXPECTED[Math.round(pos)] : 0.01);

const P = readCsv(pagesCsv);
const c = { clicks: cols(P.head, "clicks"), imp: cols(P.head, "impressions"), ctr: cols(P.head, "ctr"), pos: cols(P.head, "position") };
const pages = P.rows.map((r) => ({
  url: r[0],
  clicks: num(r[c.clicks.cur]),
  imp: num(r[c.imp.cur]),
  ctr: num(r[c.ctr.cur]) / 100,
  pos: num(r[c.pos.cur]),
  prevClicks: c.clicks.prev >= 0 ? num(r[c.clicks.prev]) : null,
}));
const short = (u) => u.replace(/^https:\/\/www\.ecbtechkenya\.com/, "") || "/";

console.log(`\n1. Low CTR for their position (rewrite title + meta description)\n`);
const lowCtr = pages
  .filter((p) => p.imp >= 100 && p.pos > 0 && p.pos <= 10 && p.ctr < expected(p.pos) / 2)
  .map((p) => ({ ...p, missed: Math.round(p.imp * expected(p.pos) - p.clicks) }))
  .sort((a, b) => b.missed - a.missed)
  .slice(0, 25);
for (const p of lowCtr) console.log(`  ${short(p.url)}  pos ${p.pos.toFixed(1)}, ${p.imp} impressions, CTR ${(p.ctr * 100).toFixed(1)}% (typical ${(expected(p.pos) * 100).toFixed(0)}%), ~${p.missed} clicks missed`);
if (!lowCtr.length) console.log("  none");

console.log(`\n2. Page 2 (positions 11-20, 50+ impressions): refresh content, add internal links\n`);
const page2 = pages.filter((p) => p.pos > 10 && p.pos <= 20 && p.imp >= 50).sort((a, b) => b.imp - a.imp).slice(0, 25);
for (const p of page2) console.log(`  ${short(p.url)}  pos ${p.pos.toFixed(1)}, ${p.imp} impressions`);
if (!page2.length) console.log("  none");

console.log(`\n3. Losing clicks against the previous period\n`);
if (pages[0] && pages[0].prevClicks === null) console.log("  (export with Compare turned on to see this list)");
else {
  const losing = pages.filter((p) => p.prevClicks >= 10 && p.clicks < p.prevClicks * 0.7).sort((a, b) => b.prevClicks - b.clicks - (a.prevClicks - a.clicks)).slice(0, 25);
  for (const p of losing) console.log(`  ${short(p.url)}  ${p.prevClicks} → ${p.clicks} clicks`);
  if (!losing.length) console.log("  none");
}

if (queriesCsv) {
  console.log(`\n4. Questions people search that could become FAQ entries or pages\n`);
  const Q = readCsv(queriesCsv);
  const q = { imp: cols(Q.head, "impressions"), pos: cols(Q.head, "position") };
  const questions = Q.rows
    .map((r) => ({ q: r[0], imp: num(r[q.imp.cur]), pos: num(r[q.pos.cur]) }))
    .filter((x) => /^(how|what|which|where|is|are|can|does|do|why|when|best)\b/i.test(x.q) && x.imp >= 10)
    .sort((a, b) => b.imp - a.imp)
    .slice(0, 30);
  for (const x of questions) console.log(`  "${x.q}"  ${x.imp} impressions, pos ${x.pos.toFixed(1)}`);
  if (!questions.length) console.log("  none");
}

if (queriesCsv) {
  console.log(`\n5. Queries by intent (regex filters in gsc-intents.mjs)\n`);
  const Q = readCsv(queriesCsv);
  const q = { imp: cols(Q.head, "impressions"), clicks: cols(Q.head, "clicks"), pos: cols(Q.head, "position") };
  const agg = {};
  let unmatched = 0;
  for (const r of Q.rows) {
    const ids = classify(r[0]);
    if (!ids.length) unmatched++;
    for (const id of ids) {
      const a = (agg[id] = agg[id] || { n: 0, imp: 0, clicks: 0, posw: 0, top: [] });
      const imp = num(r[q.imp.cur]);
      a.n++; a.imp += imp; a.clicks += num(r[q.clicks.cur]); a.posw += num(r[q.pos.cur]) * imp; a.top.push([r[0], imp]);
    }
  }
  for (const x of INTENTS.filter((i) => agg[i.id]).sort((a, b) => agg[b.id].imp - agg[a.id].imp)) {
    const a = agg[x.id];
    console.log(`  ${x.label.padEnd(42)} ${String(a.n).padStart(5)} queries ${String(a.imp).padStart(7)} impr ${String(a.clicks).padStart(5)} clicks  pos ${(a.imp ? a.posw / a.imp : 0).toFixed(1)}  e.g. "${a.top.sort((m, n) => n[1] - m[1])[0][0]}"`);
  }
  console.log(`  (${unmatched} queries matched no intent)`);
}
