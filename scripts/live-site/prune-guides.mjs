// Prune guide pages that earn no impressions (programmatic SEO step 8).
//
//   node scripts/live-site/prune-guides.mjs <Pages.csv> [--apply] [--days 90]
//
// <Pages.csv>: Search Console → Performance → Search results → set the date
// range to the last 3 months → "Pages" tab → Export → CSV (the file named
// "Pages.csv" inside the download).
//
// A guide page is a pruning candidate when it has been live for at least
// --days days (first-publication dates come from /guides/pages.json) and has
// 0 impressions in the export. Candidates are listed; with --apply they are
// written to the KV key "guides-pruned": the Worker then serves them with
// noindex and drops them from the sitemap and llms.txt, but keeps them for
// visitors and internal links. To undo, run with an empty CSV or edit the key.
//
// Runs with the environment's saved Cloudflare token (the proxy adds it).
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const SITE = "https://www.ecbtechkenya.com";
const ACCOUNT = "3f36c314d659d48ad634e5b5b17830c7";
const KV = "afab40b84f974ada97e6f8c469cab40c";
const args = process.argv.slice(2);
const csvPath = args.find((a) => !a.startsWith("--"));
const apply = args.includes("--apply");
const days = Number((args[args.indexOf("--days") + 1] || "").match(/^\d+$/) ? args[args.indexOf("--days") + 1] : 90);
if (!csvPath) {
  console.error("usage: node scripts/live-site/prune-guides.mjs <Pages.csv> [--apply] [--days 90]");
  process.exit(2);
}

const curl = (args2) => execFileSync("curl", ["-s", ...args2], { maxBuffer: 64 << 20 }).toString();

// Search Console CSV: first column is the page URL, then Clicks, Impressions…
const rows = fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/);
const head = rows.shift().split(",").map((h) => h.trim().toLowerCase());
const iImp = head.findIndex((h) => h.startsWith("impressions"));
if (iImp < 0) throw new Error(`no Impressions column in ${csvPath} (got: ${head.join(", ")})`);
const impressions = {};
for (const line of rows) {
  const cells = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"'));
  impressions[cells[0].replace(/\/$/, "")] = Number(cells[iImp]) || 0;
}

const data = JSON.parse(curl(["-A", "Mozilla/5.0 (ECB prune)", `${SITE}/guides/pages.json`]));
const firstSeen = data.first_published || {};
const now = Date.now();
const candidates = [];
const keep = [];
for (const p of data.pages) {
  const since = firstSeen[p.url];
  const age = since ? Math.floor((now - Date.parse(since)) / 86400000) : null;
  const imp = impressions[p.url] ?? 0;
  if (age === null || age < days) keep.push([p.url, `too new (${age ?? "?"} days)`, imp]);
  else if (imp === 0) candidates.push([p.url, `${age} days, 0 impressions`, imp]);
  else keep.push([p.url, `${imp} impressions`, imp]);
}
console.log(`${data.pages.length} guide pages; ${candidates.length} candidates (live ≥ ${days} days, 0 impressions)`);
for (const [u, why] of candidates) console.log("  PRUNE", u.replace(SITE, ""), "-", why);
const winners = keep.filter((k) => k[2] > 0).sort((a, b) => b[2] - a[2]).slice(0, 10);
if (winners.length) {
  console.log("Top guide pages by impressions (double down on these page types):");
  for (const [u, , imp] of winners) console.log(" ", imp, u.replace(SITE, ""));
}
if (apply) {
  const list = JSON.stringify(candidates.map((c) => c[0]));
  const res = curl(["-X", "PUT", `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/storage/kv/namespaces/${KV}/values/guides-pruned`, "--data", list]);
  console.log("written guides-pruned:", JSON.parse(res).success);
} else if (candidates.length) {
  console.log("Dry run. Add --apply to noindex these pages.");
}
