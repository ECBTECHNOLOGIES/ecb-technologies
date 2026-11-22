// On-page SEO checklist (Brian Dean's, Chapter 4) on every guide page.
//
//   node scripts/live-site/onpage-check.mjs [--all]
//
// Reads /guides/pages.json (title, description, H1, intro, sections and the
// primary keyword of every published guide) and checks:
//   title  ≤ 60 characters, keyword front-loaded (its main words in the
//          first half of the title), and a modifier (best, guide, price, vs…)
//   url    short (≤ 60 characters after the domain, ≤ 8 words)
//   intro  keyword (its main words) in the first 100 words
//   h1     contains the keyword's main words
//   h2     at least one H2 uses a keyword word (a variation)
//   links  internal links near the top (related pages) and ≥ 5 overall
//   meta   description 70–158 characters
// Prints the pages that fail, with the reason. --all also lists passes.
import { execFileSync } from "node:child_process";

const SITE = "https://www.ecbtechkenya.com";
const data = JSON.parse(execFileSync("curl", ["-s", "-A", "Mozilla/5.0 (ECB onpage)", `${SITE}/guides/pages.json?t=${Date.now()}`], { maxBuffer: 64 << 20 }).toString());
const STOP = new Set("a an the in of for to and or is are with on at do i my what which how does vs kenya nairobi best price prices".split(" "));
// "25k" = "KSh 25,000"; "16GB" = "16 GB".
const norm = (t) => String(t).toLowerCase().replace(/(\d+),(\d{3})/g, "$1$2").replace(/\b(\d+)k\b/g, "$1000").replace(/(\d)(gb|tb)\b/g, "$1 $2");
const words = (t) => norm(t).replace(/ksh\s*/g, "").replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter((w) => w && !STOP.has(w));
const has = (text, w) => {
  const t = ` ${norm(text).replace(/[^a-z0-9]+/g, " ")} `;
  const stem = w.replace(/s$/, "");
  return t.includes(` ${w} `) || t.includes(` ${stem} `) || t.includes(` ${stem}s `);
};
const covers = (text, kw, share = 0.75) => {
  const ws = words(kw);
  return !ws.length || ws.filter((w) => has(text, w)).length / ws.length >= share;
};
const MODIFIER = /\b(best|guide|checklist|explained|vs|price|prices|top|review|compared|alternatives|worth|how)\b/i;

let fails = 0;
const counts = {};
for (const p of data.pages) {
  const kw = p.seo.primary_keyword || "";
  const title = p.seo.title;
  const path = p.url.replace(SITE, "");
  const first100 = String(p.content.introduction).split(/\s+/).slice(0, 100).join(" ");
  const h2s = p.content.sections.map((s) => s.heading);
  const problems = [];
  if (title.length > 60) problems.push(`title ${title.length} chars`);
  if (!covers(title.slice(0, Math.max(30, Math.ceil(title.length / 2)) + 10), kw, 0.6)) problems.push("keyword not front-loaded in title");
  if (!MODIFIER.test(title)) problems.push("no modifier in title");
  if (path.length > 60 || path.split(/[-/]/).filter(Boolean).length > 8) problems.push(`long URL (${path.length} chars)`);
  if (!covers(first100, kw)) problems.push("keyword not in first 100 words");
  if (!covers(p.content.h1, kw, 0.6)) problems.push("keyword not in H1");
  if (!h2s.some((h) => words(kw).some((w) => has(h, w)))) problems.push("no H2 uses a keyword word");
  if (!p.related_pages.length) problems.push("no related links near the top");
  if (p.internal_links.length < 5) problems.push(`${p.internal_links.length} internal links`);
  const d = p.seo.meta_description.length;
  if (d < 70 || d > 158) problems.push(`description ${d} chars`);
  for (const x of problems) counts[x.replace(/\d+/g, "N")] = (counts[x.replace(/\d+/g, "N")] || 0) + 1;
  if (problems.length) {
    fails++;
    console.log(`✗ ${path}  [${kw}]\n    ${problems.join("; ")}`);
  } else if (process.argv.includes("--all")) console.log(`✓ ${path}`);
}
console.log(`\n${data.pages.length} pages, ${fails} with issues.`);
for (const [k, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`  ${n} × ${k}`);
