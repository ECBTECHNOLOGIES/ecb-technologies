// Keyword map export + audit.
//
//   node scripts/live-site/keyword-map.mjs            # audit live pages, write CSV + report
//
// Reads docs/seo/live-site/keyword-map.js, fetches every target URL and checks
// that the cluster's main keyword is in the title, H1, meta description and
// the opening text. Flags cannibalization (another mapped page whose title
// also carries the same main keyword). Writes:
//   docs/seo/keyword-map/keyword-map.csv   (Semrush template columns + checks)
//   docs/seo/keyword-map/README.md         (summary, how to review)
// Volume and KD% stay empty: fill them from Keyword Planner or Semrush.
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { KEYWORD_MAP, MAP_UPDATED, REVIEW_BY } from "../../docs/seo/live-site/keyword-map.js";

const SITE = "https://www.ecbtechkenya.com";
const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../docs/seo/keyword-map");
const STOP = new Set(["in", "for", "the", "of", "a", "and", "to"]);

const norm = (t) =>
  String(t || "")
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/&/g, " and ")
    .replace(/(\d),(\d{3})/g, "$1$2")
    .replace(/(\d+)k\b/g, (m, n) => `${n}000`)
    .replace(/(\d+)\s*gb/g, "$1gb")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const tokens = (kw) => norm(kw).split(" ").filter((w) => w && !STOP.has(w)).map((w) => w.replace(/s$/, ""));
// Every significant word of the keyword appears (plural-insensitive).
const has = (text, kw) => {
  const t = ` ${norm(text).split(" ").map((w) => w.replace(/s$/, "")).join(" ")} `;
  return tokens(kw).every((w) => t.includes(` ${w} `));
};
const strip = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");

// curl (not fetch): it honours the HTTPS proxy settings of the environment.
function get(url) {
  const out = execFileSync("curl", ["-s", "-A", "Mozilla/5.0 (ECB keyword map)", "-w", "\n%{http_code}", SITE + url], { maxBuffer: 64 << 20 }).toString();
  const i = out.lastIndexOf("\n");
  return { status: +out.slice(i + 1), body: out.slice(0, i) };
}

async function page(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = get(url);
      if (r.status >= 300 && r.status < 400) return { status: r.status };
      if (r.status !== 200) continue;
      const h = r.body;
      const title = (h.match(/<title>([^<]*)/) || [])[1] || "";
      const desc = (h.match(/<meta name="description"\s+content="([^"]*)/) || [])[1] || "";
      const h1 = strip((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || "");
      const main = h.split(/<h1[^>]*>/)[1] || "";
      const intro = strip(main).slice(0, 1200);
      return { status: r.status, title, desc, h1, intro };
    } catch {}
  }
  return { status: 0 };
}

const rows = [];
for (const m of KEYWORD_MAP) {
  const r = { ...m, checks: {}, suggested: m.status };
  if (m.url) {
    const p = await page(m.url);
    r.live = p;
    if (p.status !== 200) {
      // Pages the map says to create are not live yet: that is expected.
      r.suggested = m.status === "To create" ? "To create" : "Broken";
    } else if (m.intent === "navigational") {
      r.suggested = m.status; // brand / hub pages: not scored on keyword placement
    } else {
      r.checks = { title: has(p.title, m.primary), h1: has(p.h1, m.primary), description: has(p.desc, m.primary), intro: has(p.intro, m.primary) };
      const n = Object.values(r.checks).filter(Boolean).length;
      r.suggested = r.checks.title && r.checks.h1 && n >= 3 ? "Mapped" : "To optimize";
    }
  }
  rows.push(r);
}
// Cannibalization: another mapped page whose title carries this row's primary keyword.
for (const r of rows) {
  if (!r.url || !r.live || r.live.status !== 200) continue;
  // Another page competes when its title carries this keyword, it targets the
  // same intent (or it is the homepage), and its own keyword is not simply a
  // more specific version of this one ("HP laptops price" vs "laptop prices").
  // Specificity ignores place and price words ("kenya", "nairobi", "price").
  const core = (kw) => tokens(kw).filter((w) => !["kenya", "nairobi", "price"].includes(w));
  const mine = new Set(core(r.primary));
  r.competing = rows
    .filter((o) => o.url && o.url !== r.url && o.live && o.live.status === 200 && has(o.live.title, r.primary))
    .filter((o) => o.intent === r.intent || o.url === "/")
    .filter((o) => !(r.reviewed || []).includes(o.url)) // pairs checked by hand (see the row's note)
    .filter((o) => { const t = new Set(core(o.primary)); return !([...mine].every((w) => t.has(w)) && t.size > mine.size); })
    .map((o) => o.url);
}

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const head = ["Pillar page", "Subpage", "Primary keyword", "Keyword cluster", "AI prompts", "Intent", "Volume", "KD %", "Target URL", "Status", "Audit: title/H1/desc/intro", "Competing pages", "Notes", "Last updated", "Next review"];
const lines = [head.map(csvCell).join(",")];
for (const r of rows) {
  const c = r.checks;
  const audit = r.url ? (r.live && r.live.status === 200 ? ["title", "h1", "description", "intro"].map((k) => `${k}:${c[k] ? "yes" : "NO"}`).join(" ") : `HTTP ${r.live && r.live.status}`) : "";
  lines.push([r.pillar, r.page, r.primary, r.cluster.join("; "), r.prompts.join(" | "), r.intent, "", "", r.url ? SITE + r.url : "", r.suggested, audit, (r.competing || []).join(" "), r.note, MAP_UPDATED, REVIEW_BY].map(csvCell).join(","));
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "keyword-map.csv"), lines.join("\n") + "\n");

const count = (s) => rows.filter((r) => r.suggested === s).length;
const md = [
  "# ECB Technologies keyword map",
  "",
  `Updated ${MAP_UPDATED}. Next review by ${REVIEW_BY} (every 3 months, or sooner after adding, merging or removing important pages).`,
  "",
  `- **${rows.length} keyword clusters**, each assigned to one page.`,
  `- Status: ${count("Mapped")} mapped, ${count("To optimize")} to optimize, ${count("To create")} to create, ${count("Not targeted")} not targeted, ${count("Broken")} broken.`,
  "- Volume and KD% are empty on purpose. Fill them from Google Keyword Planner (Kenya) or Semrush; nothing here is estimated.",
  "",
  "Files:",
  "- `keyword-map.csv`: the map, with the Semrush template columns plus the audit. Import it into Google Sheets.",
  "- `docs/seo/live-site/keyword-map.js`: the source.",
  "",
  "## How to use it",
  "",
  "1. **To optimize:** put the primary keyword naturally in the title, H1, meta description and first paragraph. Use cluster terms in subheadings and answer the AI prompts in the text.",
  "2. **To create:** see the note for what is missing (usually stock or real content). Do not publish thin pages.",
  "3. **Internal links:** use the target page's primary keyword, or a cluster variation, as anchor text.",
  "4. **Every 3 months:**",
  "   - Rerun `node scripts/live-site/keyword-map.mjs`.",
  "   - In Search Console (Performance → Queries → Pages), check whether two pages get impressions for one cluster. If so, pick one page and change the other.",
  "   - Add new clusters for new stock.",
  "",
  "## Clusters that need work",
  "",
  ...rows.filter((r) => !["Mapped", "Not targeted"].includes(r.suggested)).map((r) => `- **${r.page}** (${r.primary}): ${r.suggested}${r.url ? ` ${SITE + r.url}` : ""}${r.note ? `. ${r.note}` : ""}`),
  "",
  "## Cannibalization",
  "",
  ...(rows.some((r) => (r.competing || []).length) ? rows.filter((r) => (r.competing || []).length).map((r) => `- "${r.primary}" (${r.url}) also in the title of: ${r.competing.join(", ")}`) : ["- None: no other mapped page carries a cluster's main keyword in its title."]),
  "",
];
fs.writeFileSync(path.join(OUT, "README.md"), md.join("\n"));
console.log(`clusters ${rows.length} | mapped ${count("Mapped")} | to optimize ${count("To optimize")} | to create ${count("To create")} | broken ${count("Broken")}`);
for (const r of rows.filter((x) => x.suggested === "To optimize" || x.suggested === "Broken")) console.log(" ", r.suggested, r.url, r.primary, JSON.stringify(r.checks), r.live && r.live.title);
for (const r of rows.filter((x) => (x.competing || []).length)) console.log("  CANNIBAL", r.url, r.primary, "<-", r.competing.join(" "));
