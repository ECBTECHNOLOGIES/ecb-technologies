// Local runner: shows a login page; after the owner logs in to the ECB admin,
// adds SEO to every product still missing it, one product per fresh page.
// The password is passed straight to the admin login form and never stored or logged.
const http = require("http");
const fs = require("fs");
const { chromium } = require("playwright");

const [,, SEO_JSON, CRAWL_JSONL, LOG_FILE, PORT = "8765"] = process.argv;
const BASE = "https://www.ecbtechkenya.com";
const items = JSON.parse(fs.readFileSync(SEO_JSON, "utf8"));
const oldSlug = Object.fromEntries(
  fs.readFileSync(CRAWL_JSONL, "utf8").trim().split("\n").map((l) => JSON.parse(l)).map((r) => [r.id, r.slug])
);

const ONLY = process.env.ECB_ONLY ? new Set(process.env.ECB_ONLY.split(",")) : null;
const state = { phase: "waiting for login", message: "", changed: 0, skipped: 0, failed: 0, done: 0, total: items.length, recent: [] };
let browser, context, running = false;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const note = (line) => { state.recent.unshift(line); state.recent = state.recent.slice(0, 60); };
const record = (obj) => fs.appendFileSync(LOG_FILE, JSON.stringify({ ...obj, at: new Date().toISOString() }) + "\n");

async function ensureBrowser() {
  if (browser) return;
  browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  context = await browser.newContext();
}

async function login(email, password) {
  await ensureBrowser();
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await Promise.all([
      page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 }).catch(() => {}),
      page.click('button[type="submit"], input[type="submit"]').catch(() => page.press('input[name="password"]', "Enter")),
    ]);
    await page.waitForTimeout(2000);
    await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded", timeout: 60000 });
    return !page.url().includes("/login");
  } finally {
    await page.close();
  }
}

async function publicHasSeo(id) {
  // true = already done (has description, or its old address moved because it was saved)
  const slug = oldSlug[id];
  if (!slug) return false;
  try {
    const res = await context.request.get(`${BASE}/item/${slug}`, { timeout: 60000, failOnStatusCode: false });
    if (res.status() === 404) return true;
    const html = await res.text();
    const m = html.match(/name="description"\s+content="([^"]*)"/);
    return Boolean(m && m[1].trim());
  } catch {
    return false;
  }
}

async function processItem(item) {
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}/admin/products/edit/${item.id}`, { waitUntil: "load", timeout: 90000 });
    if (page.url().includes("/login")) throw new Error("LOGGED_OUT");
    await page.waitForTimeout(800);
    return await page.evaluate(async (item) => {
      const $ = window.jQuery;
      const form = document.getElementById("geniusform");
      if (!form || !$ || !form.action.endsWith(`/admin/products/edit/${item.id}`)) return { result: "FAILED: edit page not as expected" };
      const seo = document.getElementById("allowProductSEO");
      const desc = document.querySelector('textarea[name="meta_description"]');
      const metatags = $("#metatags");
      if (!seo || !desc || !metatags.length) return { result: "FAILED: SEO fields not found" };
      const priceInput = document.querySelector('input[name="price"]');
      const livePrice = Math.round(Number(priceInput && priceInput.value));
      if (item.price && livePrice !== item.price) return { result: `price changed (${livePrice})` };
      if (!seo.checked) seo.click();
      metatags.tagit("removeAll");
      item.tags.forEach((t) => metatags.tagit("createTag", t.replace(/,/g, " ")));
      desc.value = item.description;

      // Product tags: add ours, keep any the shop already has.
      const tagBox = $("#tags");
      if (tagBox.length && item.product_tags) {
        const have = new Set(tagBox.tagit("assignedTags").map((t) => t.toLowerCase()));
        item.product_tags.forEach((t) => { if (!have.has(t.toLowerCase())) tagBox.tagit("createTag", t); });
      }

      // Price intro at the top of the description; replaces our own earlier intro if present.
      if (item.intro_html) {
        const details = document.querySelector('textarea[name="details"]');
        const editor = Array.from(document.querySelectorAll(".nicEdit-main")).find(
          (el) => el.closest("div") && details && el.parentElement && el.parentElement.nextElementSibling === details
        ) || document.querySelector(".nicEdit-main");
        if (!details || !editor) return { result: "FAILED: description editor not found" };
        const holder = document.createElement("div");
        holder.innerHTML = editor.innerHTML;
        holder.querySelectorAll("h2.ecb-price-intro").forEach((h) => {
          if (h.nextElementSibling && h.nextElementSibling.tagName === "P") h.nextElementSibling.remove();
          h.remove();
        });
        const html = item.intro_html + holder.innerHTML;
        editor.innerHTML = html;
        details.value = html;
      }
      if (metatags.tagit("assignedTags").length !== item.tags.length) return { result: "FAILED: tags did not apply" };
      const response = await new Promise((resolve) => {
        const timer = setTimeout(() => resolve({ ok: false, text: "no response from save" }), 60000);
        $(document).ajaxComplete((e, xhr, settings) => {
          if ((settings.url || "").includes(`/admin/products/edit/${item.id}`)) {
            clearTimeout(timer);
            resolve({ ok: xhr.status === 200 && !/"errors"/.test(xhr.responseText), text: String(xhr.responseText).slice(0, 150) });
          }
        });
        $(form).trigger("submit");
      });
      return { result: response.ok ? "SEO added" : `FAILED: ${response.text}` };
    }, item);
  } finally {
    await page.close();
  }
}

async function run() {
  running = true;
  state.phase = "running";
  let consecutiveFails = 0;
  for (const item of items) {
    const label = `#${item.id} ${item.name}`;
    try {
      if (ONLY && !ONLY.has(item.id)) {
        state.skipped++; state.done++;
        continue;
      } else {
        const { result } = await processItem(item);
        record({ id: item.id, result });
        if (result === "SEO added") { state.changed++; consecutiveFails = 0; note(`✅ ${esc(label)}`); }
        else if (result.startsWith("price changed")) { state.skipped++; note(`⚠️ ${esc(label)}: ${esc(result)}`); }
        else { state.failed++; consecutiveFails++; note(`❌ ${esc(label)}: ${esc(result)}`); }
      }
    } catch (error) {
      if (error.message === "LOGGED_OUT") {
        state.phase = "waiting for login";
        state.message = "The admin session ended. Please log in again; the run will continue where it stopped.";
        running = false;
        return;
      }
      state.failed++; consecutiveFails++;
      record({ id: item.id, result: `FAILED: ${error.message}` });
      note(`❌ ${esc(label)}: ${esc(error.message)}`);
    }
    state.done++;
    if (consecutiveFails >= 8) {
      state.phase = "stopped";
      state.message = "Stopped after 8 failures in a row. Nothing more was changed.";
      running = false;
      return;
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  state.phase = "finished";
  running = false;
}

const page = (body) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ECB product SEO</title><style>
body{font:16px/1.5 -apple-system,BlinkMacSystemFont,sans-serif;color:#1d1d1f;background:#f5f5f7;margin:0;padding:24px}
.card{max-width:560px;margin:0 auto;background:#fff;border-radius:18px;padding:24px}
h1{font-size:24px;margin:0 0 8px}input{width:100%;box-sizing:border-box;font-size:17px;padding:11px 14px;margin:6px 0 14px;border:1px solid #d2d2d7;border-radius:12px}
button{background:#0066cc;color:#fff;border:0;border-radius:999px;padding:11px 22px;font-size:17px}
.muted{color:#6e6e73;font-size:14px}.bar{height:8px;background:#e8e8ed;border-radius:8px;overflow:hidden;margin:12px 0}
.bar div{height:100%;background:#0066cc}.log{font-size:13px;max-height:50vh;overflow:auto;margin-top:12px}
</style></head><body><div class="card">${body}</div></body></html>`;

function loginPage(msg = "") {
  return page(`<h1>Log in to the ECB admin</h1>
<p class="muted">Your details go straight to www.ecbtechkenya.com/admin/login. They are not saved or shown to anyone.</p>
${msg ? `<p style="color:#d70015">${esc(msg)}</p>` : ""}
<form method="post" action="/login"><label>Admin email<input name="email" type="email" autocomplete="username" required></label>
<label>Password<input name="password" type="password" autocomplete="current-password" required></label>
<button type="submit">Log in and start</button></form>`);
}

function statusPage() {
  const pct = Math.round((state.done / state.total) * 100);
  return page(`<meta http-equiv="refresh" content="5"><h1>Adding product SEO</h1>
<p><b>${esc(state.phase)}</b> ${esc(state.message)}</p>
<div class="bar"><div style="width:${pct}%"></div></div>
<p>${state.done} of ${state.total} checked · <b>${state.changed} added</b> · ${state.skipped} already done · ${state.failed} failed</p>
<p class="muted">You can leave this page; the run continues on its own.</p>
<div class="log">${state.recent.join("<br>")}</div>`);
}

// Headless mode: log in with ECB_EMAIL / ECB_PASSWORD from the environment and
// run straight away, printing progress (no web page needed).
if (process.env.ECB_EMAIL && process.env.ECB_PASSWORD) {
  (async () => {
    const ok = await login(process.env.ECB_EMAIL, process.env.ECB_PASSWORD).catch((e) => { console.log("login error", e.message); return false; });
    delete process.env.ECB_PASSWORD;
    console.log(ok ? "LOGIN OK" : "LOGIN FAILED");
    if (!ok) process.exit(2);
    const ticker = setInterval(() => console.log(`progress ${state.done}/${state.total} added=${state.changed} skipped=${state.skipped} failed=${state.failed} ${state.phase}`), 30000);
    await run();
    clearInterval(ticker);
    console.log(`END ${state.phase} ${state.message} added=${state.changed} skipped=${state.skipped} failed=${state.failed}`);
    await browser.close();
    process.exit(0);
  })();
} else http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/login") {
    let body = "";
    req.on("data", (c) => { body += c; if (body.length > 10000) req.destroy(); });
    req.on("end", async () => {
      const form = new URLSearchParams(body);
      let ok = false;
      try { ok = await login(form.get("email") || "", form.get("password") || ""); } catch { ok = false; }
      body = null;
      if (!ok) { res.writeHead(200, { "Content-Type": "text/html" }); return res.end(loginPage("Login didn't work. Please check the email and password.")); }
      state.message = "";
      if (!running) run();
      res.writeHead(303, { Location: "/" }); res.end();
    });
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html", "Cache-Control": "no-store" });
  res.end(state.phase === "waiting for login" ? loginPage(state.message) : statusPage());
}).listen(Number(PORT), "0.0.0.0", () => console.log("listening", PORT));
