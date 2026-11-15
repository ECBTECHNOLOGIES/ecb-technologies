const { chromium, devices } = require("playwright");
(async () => {
  const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  for (const [label, opts] of [["mobile", devices["Moto G4"]], ["desktop", { viewport: { width: 1350, height: 940 } }]]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    const reqs = [];
    page.on("response", async (r) => {
      try {
        const h = r.headers(); const b = await r.body().catch(() => Buffer.alloc(0));
        reqs.push({ url: r.url(), type: r.request().resourceType(), status: r.status(), bytes: b.length,
          cache: h["cache-control"] || "", cf: h["cf-cache-status"] || "", enc: h["content-encoding"] || "" });
      } catch {}
    });
    const t0 = Date.now();
    await page.goto(process.argv[2] || "https://www.ecbtechkenya.com/", { waitUntil: "load", timeout: 90000 });
    const loadMs = Date.now() - t0;
    await page.waitForTimeout(3000);
    const lcp = await page.evaluate(() => new Promise((res) => {
      new PerformanceObserver((l) => { const e = l.getEntries().pop(); res({ t: Math.round(e.startTime), el: e.element ? e.element.tagName + "." + (e.element.className || "") + " " + (e.url || "").slice(-60) : "" }); }).observe({ type: "largest-contentful-paint", buffered: true });
      setTimeout(() => res(null), 3000);
    }));
    const by = {}; let total = 0;
    for (const r of reqs) { by[r.type] = (by[r.type] || 0) + r.bytes; total += r.bytes; }
    console.log(`\n== ${label}: load ${loadMs}ms, requests ${reqs.length}, ${(total/1024).toFixed(0)} KB, LCP ${JSON.stringify(lcp)}`);
    console.log("by type KB:", Object.fromEntries(Object.entries(by).map(([k, v]) => [k, Math.round(v / 1024)])));
    console.log("largest:"); reqs.sort((a, b) => b.bytes - a.bytes).slice(0, 12).forEach((r) => console.log(`  ${Math.round(r.bytes/1024)}KB ${r.type} ${r.status} cf=${r.cf} enc=${r.enc} cache="${r.cache.slice(0,40)}" ${r.url.slice(0,110)}`));
    const third = [...new Set(reqs.map((r) => new URL(r.url).host))]; console.log("hosts:", third.join(", "));
    const noCache = reqs.filter((r) => /ecbtechkenya/.test(r.url) && ["image","script","stylesheet","font"].includes(r.type) && !/max-age=[1-9]/.test(r.cache));
    console.log("own static files without long browser cache:", noCache.length, "of", reqs.filter((r) => /ecbtechkenya/.test(r.url) && ["image","script","stylesheet","font"].includes(r.type)).length);
    await ctx.close();
  }
  await browser.close();
})();
