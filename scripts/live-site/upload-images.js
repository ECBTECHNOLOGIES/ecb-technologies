// Replaces heavy images in the GeniusCart admin using the admin's own edit forms.
// Each job: GET the edit form, keep every existing value, swap only the image (and
// optionally the banner link), POST it back exactly like the form would.
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const BASE = "https://www.ecbtechkenya.com";
const IMG = process.argv[2];
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;

const JOBS = [
  { key: "cat21", edit: "/admin/category/edit/21", file: "category-laptops.jpg", field: "image" },
  { key: "cat23", edit: "/admin/category/edit/23", file: "category-pc-accessories.jpg", field: "image" },
  { key: "cat25", edit: "/admin/category/edit/25", file: "category-mobile-accessories.jpg", field: "image" },
  { key: "cat26", edit: "/admin/category/edit/26", file: "category-printers.jpg", field: "image" },
  { key: "cat28", edit: "/admin/category/edit/28", file: "category-audio-accessories.jpg", field: "image" },
  { key: "cat24", edit: "/admin/category/edit/24", file: "category-tvs.jpg", field: "image" },
  { key: "arr7", edit: "/admin/arrival/edit/7", file: "banner-gaming-laptops.jpg", field: "photo", url: `${BASE}/category/laptops/Gaming` },
  { key: "arr3", edit: "/admin/arrival/edit/3", file: "banner-laptop-deals.jpg", field: "photo", url: `${BASE}/category/laptops` },
  { key: "arr4", edit: "/admin/arrival/edit/4", file: "banner-samsung-phones.jpg", field: "photo", url: `${BASE}/category?search=samsung` },
  { key: "crumb", edit: "/admin/general-settings/breadcrumb", file: "breadcrumb-banner.jpg", field: "breadcrumb_banner" },
];

(async () => {
  const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  const page = await (await browser.newContext()).newPage();
  await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="email"]', process.env.ECB_EMAIL); await page.fill('input[name="password"]', process.env.ECB_PASSWORD);
  await Promise.all([page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 }).catch(() => {}), page.click('button[type="submit"]')]);
  for (const job of JOBS) {
    if (ONLY && !ONLY.includes(job.key)) continue;
    const html = await (await page.request.get(BASE + job.edit)).text();
    const form = html.match(/<form[^>]*action="([^"]*)"[^>]*>([\s\S]*?)<\/form>/);
    if (!form) { console.log(job.key, "FAILED: form not found"); continue; }
    const action = form[1];
    const fields = {};
    for (const m of form[2].matchAll(/<input([^>]*)>/g)) {
      const attrs = m[1]; const name = (attrs.match(/name="([^"]*)"/) || [])[1]; const type = (attrs.match(/type="([^"]*)"/) || [])[1] || "text";
      if (!name || type === "file") continue;
      if (["checkbox", "radio"].includes(type) && !/\bchecked\b/.test(attrs)) continue;
      fields[name] = ((attrs.match(/value="([^"]*)"/) || [])[1] || "").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
    }
    for (const m of form[2].matchAll(/<textarea[^>]*name="([^"]*)"[^>]*>([\s\S]*?)<\/textarea>/g)) fields[m[1]] = m[2];
    if (job.url) fields.url = job.url;
    const multipart = { ...fields, [job.field]: { name: job.file, mimeType: "image/jpeg", buffer: fs.readFileSync(path.join(IMG, job.file)) } };
    const res = await page.request.post(action, { multipart, headers: { "X-Requested-With": "XMLHttpRequest", Accept: "application/json, text/html" } });
    const text = (await res.text()).replace(/\s+/g, " ").slice(0, 200);
    console.log(job.key, res.status(), "kept fields:", Object.keys(fields).filter((k) => k !== "_token").join(","), "| response:", text);
  }
  await browser.close();
})();
