// Fills "Allow Product SEO", Meta Tags and Meta Description on every ECB
// product whose SEO is still empty, using the admin panel's own Edit page and
// its own Save button, so the site handles every other field exactly as when
// a person saves by hand.
//
// How to run: log in at https://www.ecbtechkenya.com/admin, open the browser
// console (F12 → Console), paste this whole script, press Enter.
//
// Safety:
// - Products that already have SEO (box ticked, tags or description present)
//   are skipped, never overwritten.
// - Each product is checked to be the right one before anything is changed.
// - LIMIT controls how many products are changed in one run (1 = test).
// - One product at a time, with a pause between, so the shop stays fast.
// - A log can be downloaded at the end.
(async () => {
  // Works in batches: after BATCH products it stops so the page can be reloaded,
  // which frees the browser's memory. Finished products are remembered in this
  // browser, so pasting the script again continues where the last batch ended.
  const BATCH = 50;
  const LIMIT = Infinity;
  const DATA_URL =
    "https://raw.githubusercontent.com/ECBTECHNOLOGIES/ecb-technologies/main/docs/seo/live-site/product-seo-remaining.json";
  const KEY = "ecbSeoDone";
  const doneIds = new Set((() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  })());
  const remember = (id) => {
    doneIds.add(id);
    try { localStorage.setItem(KEY, JSON.stringify([...doneIds])); } catch {}
  };
  const PAUSE_MS = 1500;

  if (!location.href.startsWith("https://www.ecbtechkenya.com/admin")) {
    alert("Open the ECB admin panel (www.ecbtechkenya.com/admin) and run this there.");
    return;
  }

  const panel = document.createElement("div");
  panel.style.cssText =
    "position:fixed;z-index:999999;right:16px;bottom:16px;width:380px;max-height:60vh;overflow:auto;" +
    "background:#fff;color:#1d1d1f;border:1px solid #d2d2d7;border-radius:14px;padding:14px;" +
    "font:13px/1.45 -apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.15)";
  document.body.appendChild(panel);
  const lines = [];
  const show = (status, line) => {
    if (line) lines.unshift(line);
    panel.innerHTML =
      `<b>ECB product SEO</b><br>${status}<hr style="border:0;border-top:1px solid #eee">` +
      lines.slice(0, 40).join("<br>");
  };

  show("Loading product list… You can close the developer tools now; this box shows progress.");
  const items = (await (await fetch(DATA_URL, { cache: "no-store" })).json()).filter((i) => !doneIds.has(i.id));
  if (!items.length) {
    show("<b>All products are done.</b> Nothing left to add.");
    return;
  }
  if (!confirm(`${items.length} products still need SEO. Start the next batch of up to ${BATCH}?`)) {
    panel.remove();
    return;
  }
  let loaded = 0;

  // A fresh hidden frame per product, removed afterwards, so memory is freed
  // as the run goes (one long-lived frame grew until Chrome paused it).
  let frame = null;
  const freshFrame = () => {
    if (frame) {
      frame.src = "about:blank";
      frame.remove();
    }
    frame = document.createElement("iframe");
    frame.style.cssText = "position:fixed;left:-9999px;top:0;width:1200px;height:900px;border:0";
    document.body.appendChild(frame);
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const load = (url) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("page did not load")), 60000);
      frame.onload = () => {
        clearTimeout(timer);
        resolve();
      };
      frame.src = url;
    });

  const log = [];
  let changed = 0, skipped = 0, failed = 0;

  for (const item of items) {
    if (changed >= LIMIT) break;
    if (loaded >= BATCH) break;
    loaded++;
    const tag = `#${item.id} ${item.name}`;
    try {
      freshFrame();
      await load(`/admin/products/edit/${item.id}`);
      await sleep(800); // let the page's editors and tag boxes initialise
      const w = frame.contentWindow, d = frame.contentDocument, $ = w.jQuery;
      const form = d.getElementById("geniusform");
      if (!form || !$ || !form.action.endsWith(`/admin/products/edit/${item.id}`)) {
        throw new Error("edit page not as expected (logged out?)");
      }

      const seo = d.getElementById("allowProductSEO");
      const desc = d.querySelector('textarea[name="meta_description"]');
      const metatags = $("#metatags");
      if (!seo || !desc || !metatags.length) throw new Error("SEO fields not found");

      const existing = metatags.tagit("assignedTags");
      if (seo.checked || desc.value.trim() || existing.length) {
        skipped++;
        remember(item.id);
        log.push({ id: item.id, name: item.name, result: "skipped (already has SEO)" });
        show(`Changed ${changed} · skipped ${skipped} · failed ${failed}`, `⏭ ${tag}`);
        continue;
      }

      seo.click();
      item.tags.forEach((t) => metatags.tagit("createTag", t.replace(/,/g, " ")));
      desc.value = item.description;
      if (metatags.tagit("assignedTags").length !== item.tags.length) {
        throw new Error("tags did not apply");
      }

      const response = await new Promise((resolve) => {
        const timer = setTimeout(() => resolve({ ok: false, text: "no response from save" }), 60000);
        $(d).ajaxComplete((event, xhr, settings) => {
          if ((settings.url || "").includes(`/admin/products/edit/${item.id}`)) {
            clearTimeout(timer);
            resolve({ ok: xhr.status === 200 && !/"errors"/.test(xhr.responseText), text: xhr.responseText });
          }
        });
        $(form).trigger("submit");
      });
      if (!response.ok) throw new Error(`save failed: ${String(response.text).slice(0, 120)}`);

      changed++;
      remember(item.id);
      log.push({ id: item.id, name: item.name, result: "SEO added", description: item.description });
      show(`Changed ${changed} · skipped ${skipped} · failed ${failed}`, `✅ ${tag}`);
    } catch (error) {
      failed++;
      log.push({ id: item.id, name: item.name, result: `FAILED: ${error.message}` });
      show(`Changed ${changed} · skipped ${skipped} · failed ${failed}`, `❌ ${tag}: ${error.message}`);
      if (failed >= 5 && changed === 0) {
        show(`Stopped: ${failed} failures before any success. Nothing more was changed.`);
        break;
      }
    }
    await sleep(PAUSE_MS);
  }

  if (frame) frame.remove();
  const csv = ["id,name,result"]
    .concat(log.map((r) => [r.id, `"${String(r.name).replace(/"/g, '""')}"`, `"${r.result}"`].join(",")))
    .join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = "ecb-product-seo-log.csv";
  link.textContent = "Download log";
  const left = items.length - loaded;
  show(
    left > 0
      ? `<b>Batch done.</b> Added ${changed} · skipped ${skipped} · failed ${failed}. ` +
          `<b>${left} left.</b> Reload this page (Cmd/Ctrl + R), then paste the script again for the next batch.<br>`
      : `<b>All done!</b> Added ${changed} · skipped ${skipped} · failed ${failed} in this last batch.<br>`
  );
  panel.appendChild(link);
  window.ecbSeoLog = log;
  console.table(log);
})();
