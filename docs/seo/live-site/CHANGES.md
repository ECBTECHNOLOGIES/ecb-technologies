# Changes applied to the live site (www.ecbtechkenya.com)

## 2026-11-14/15: product SEO (GeniusCart admin)
- All 677 products: meta description with price + location, 6 meta tags
  (price in Kenya, Nairobi, Nairobi CBD, price band), product tags (price
  band, brand, use case), and a "price in Kenya" intro at the top of the
  description. Tools: `scripts/live-site/`.
- 600 product addresses changed on their first save (a GeniusCart
  behaviour). Old-to-new redirects are in `cloudflare-redirects.csv`
  (Cloudflare Bulk Redirects); the owner still needs to upload them.

## 2026-11-15: speed and discoverability
- Admin uploads, with the originals in `original-images/`:
  - 6 category images: about 1.7–2 MB each, now 11–20 KB each.
  - 3 "Best Month Offer" banners: 400–500 KB each, now about 65 KB each.
  - Breadcrumb banner: 803 KB, now 68 KB.
  - Homepage weight: 13.8 MB, now 3.3 MB.
- Banner links fixed. They pointed to a 404 on ecb.lumina.co.ke and now go
  to Gaming laptops, Laptops and the Samsung search on the shop.
- Cloudflare (via API):
  - Worker `ecb-sitemap` (`cloudflare-worker-sitemap.js`) with routes for
    `/sitemap.xml`, `/robots.txt` and `/assets/images/brands/*` on both
    the bare domain and www. The sitemap lists 696 URLs and rebuilds every
    6 hours. robots.txt now has the `Sitemap:` line. Missing brand logos
    return an empty cached 404 instead of a 62 KB page.
  - Early Hints, Speed Brain and Cloudflare Fonts turned on. HTTP/3 was
    already on. Rocket Loader left off.
  - Cache rule: `/assets/images/` (except brands) cached at the edge and in
    browsers for 30 days.
- Hosting: the original nameservers were `*.server-217-20-120-93.da.direct`,
  which is DirectAdmin, not cPanel. The control panel is likely at
  `https://<server>:2222`.

## Still open
- Upload `cloudflare-redirects.csv` to Bulk Redirects. The current token
  lacks the lists/redirect-rules permissions.
- Theme code: the page is hidden until it has fully loaded, about 1.2 MB of
  render-blocking CSS, and jQuery UI. Fixing these needs hosting (file)
  access.
- Roll the Cloudflare API token. It and its R2 keys were pasted in chat.
