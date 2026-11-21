// Push docs/seo/live-site/additions.json (extra sections and FAQ entries for
// guide pages) to the site, without a deploy.
//
//   node scripts/live-site/page-additions.mjs           # dry run: what changes
//   node scripts/live-site/page-additions.mjs --apply   # write KV "guides-additions"
//
// Keys starting with "_" are notes and are not sent. Pages update within about
// 5 minutes (cached copies within an hour). Then ask for a recrawl: Search
// Console → URL inspection → Request indexing, for each changed page. With the
// INDEXNOW_TOKEN environment variable set, --apply also pings IndexNow (Bing).
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const SITE = "https://www.ecbtechkenya.com";
const ACCOUNT = "3f36c314d659d48ad634e5b5b17830c7";
const KV = "afab40b84f974ada97e6f8c469cab40c";
const kvUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/storage/kv/namespaces/${KV}/values/guides-additions`;
const curl = (a) => execFileSync("curl", ["-s", ...a], { maxBuffer: 64 << 20 }).toString();

const file = new URL("../../docs/seo/live-site/additions.json", import.meta.url);
const all = JSON.parse(fs.readFileSync(file, "utf8"));
const next = {};
const problems = [];
for (const [path, v] of Object.entries(all)) {
  if (path.startsWith("_")) continue;
  if (!/^\/[a-z0-9/-]+$/.test(path)) problems.push(`${path}: not a page path`);
  for (const s of v.sections || []) if (!s.heading || !s.body) problems.push(`${path}: section needs heading and body`);
  for (const q of v.faq || []) {
    if (!q.question || !q.answer) problems.push(`${path}: FAQ needs question and answer`);
    if (/TODO/i.test(q.answer || "")) problems.push(`${path}: FAQ answer still says TODO`);
  }
  next[path] = { sections: v.sections || [], faq: v.faq || [] };
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
let cur = {};
try {
  cur = JSON.parse(curl([kvUrl]));
  if (cur.errors) cur = {};
} catch {}
const changed = Object.keys({ ...cur, ...next }).filter((p) => JSON.stringify(cur[p] || null) !== JSON.stringify(next[p] || null));
console.log(changed.length ? `Changed pages:\n${changed.map((p) => `  ${p}`).join("\n")}` : "No changes.");
if (!process.argv.includes("--apply") || !changed.length) process.exit(0);
const res = JSON.parse(curl(["-X", "PUT", kvUrl, "--data", JSON.stringify(next)]));
console.log("written:", res.success);
const token = process.env.INDEXNOW_TOKEN;
if (res.success && token) {
  const urls = changed.map((p) => SITE + p);
  console.log(curl(["-X", "POST", "-H", "Content-Type: application/json", "--data", JSON.stringify(urls), `${SITE}/ecb-indexnow?token=${token}`]));
}
console.log("Next: Search Console → URL inspection → Request indexing for each changed page (after ~5 minutes).");
