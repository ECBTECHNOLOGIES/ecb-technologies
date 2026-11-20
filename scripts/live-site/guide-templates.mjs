// Guide templates: how each performs in search, and turning one off.
//
//   node scripts/live-site/guide-templates.mjs [Pages.csv]      # report
//   node scripts/live-site/guide-templates.mjs --disable combo   # turn off
//   node scripts/live-site/guide-templates.mjs --enable combo    # turn on
//
// Templates: list, combo, alternatives, model, compare, profile, phones, local.
//
// Report: pages live per template and, with a Search Console "Pages.csv"
// export (Performance → last 3 months → Export), impressions, clicks, CTR and
// average position per template, plus how many of its pages have had no
// impressions at all. Scale the templates that earn impressions; turn off
// the ones that keep producing pages nobody sees.
//
// Turning a template off (KV key "guides-disabled"): its pages stop being
// published within about 5 minutes (they redirect to /guides and leave the
// sitemap). Turning it back on republishes them.
//
// Runs with the environment's saved Cloudflare token (the proxy adds it).
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const SITE = "https://www.ecbtechkenya.com";
const ACCOUNT = "3f36c314d659d48ad634e5b5b17830c7";
const KV = "afab40b84f974ada97e6f8c469cab40c";
const TEMPLATES = ["list", "combo", "alternatives", "model", "compare", "profile", "phones", "local"];
const curl = (a) => execFileSync("curl", ["-s", ...a], { maxBuffer: 64 << 20 }).toString();
const kvUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/storage/kv/namespaces/${KV}/values/guides-disabled`;

const args = process.argv.slice(2);
const flag = args.find((a) => a === "--disable" || a === "--enable");
if (flag) {
  const t = args[args.indexOf(flag) + 1];
  if (!TEMPLATES.includes(t)) {
    console.error(`unknown template "${t}"; one of: ${TEMPLATES.join(", ")}`);
    process.exit(2);
  }
  let cur = [];
  try {
    cur = JSON.parse(curl([kvUrl]));
    if (!Array.isArray(cur)) cur = [];
  } catch {}
  const next = flag === "--disable" ? [...new Set([...cur, t])] : cur.filter((x) => x !== t);
  const res = JSON.parse(curl(["-X", "PUT", kvUrl, "--data", JSON.stringify(next)]));
  console.log(res.success ? `turned off: ${next.join(", ") || "(none)"}` : `failed: ${JSON.stringify(res.errors)}`);
  process.exit(res.success ? 0 : 1);
}

const data = JSON.parse(curl(["-A", "Mozilla/5.0 (ECB templates)", `${SITE}/guides/pages.json`]));
const templates = data.templates || {};
const csv = args.find((a) => !a.startsWith("--"));
const perf = {};
if (csv) {
  const lines = fs.readFileSync(csv, "utf8").replace(/^﻿/, "").trim().split(/\r?\n/);
  const split = (l) => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).slice(0, -1).map((c) => c.replace(/,$/, "").replace(/^"|"$/g, ""));
  const head = split(lines.shift()).map((h) => h.toLowerCase());
  const col = (m) => head.findIndex((h) => h.endsWith(m) && !/previous/.test(h));
  const [ci, ii, pi] = [col("clicks"), col("impressions"), col("position")];
  for (const l of lines) {
    const r = split(l);
    perf[r[0].replace(/\/$/, "")] = { clicks: Number(r[ci]) || 0, imp: Number(r[ii]) || 0, pos: Number(r[pi]) || 0 };
  }
}
const rows = {};
for (const [url, t] of Object.entries(templates)) {
  const r = (rows[t] = rows[t] || { pages: 0, clicks: 0, imp: 0, posw: 0, zero: 0 });
  r.pages++;
  const p = perf[url];
  if (!p || !p.imp) r.zero++;
  if (p) {
    r.clicks += p.clicks;
    r.imp += p.imp;
    r.posw += p.pos * p.imp;
  }
}
console.log(`Turned off: ${(data.disabled_templates || []).join(", ") || "none"}\n`);
console.log("template       pages" + (csv ? "  impressions  clicks   CTR   avg pos  no impressions" : ""));
for (const t of TEMPLATES.filter((x) => rows[x]).sort((a, b) => (rows[b].imp / rows[b].pages || 0) - (rows[a].imp / rows[a].pages || 0) || rows[b].pages - rows[a].pages)) {
  const r = rows[t];
  const line = `${t.padEnd(14)}${String(r.pages).padStart(5)}`;
  if (!csv) console.log(line);
  else console.log(`${line}  ${String(r.imp).padStart(11)}  ${String(r.clicks).padStart(6)}  ${(r.imp ? (100 * r.clicks) / r.imp : 0).toFixed(1).padStart(4)}%  ${(r.imp ? r.posw / r.imp : 0).toFixed(1).padStart(7)}  ${String(r.zero).padStart(14)}`);
}
if (!csv) console.log("\nAdd a Search Console Pages.csv export to see impressions per template.");
