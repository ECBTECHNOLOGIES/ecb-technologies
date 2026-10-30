import axios from "axios";

// Connection status page for the deployment, readable by a non-technical
// owner: are the required settings present, and does WooCommerce answer?
// Reports only yes/no and public hostnames - never key or secret values.
// /api/ is disallowed in robots.txt, so this is not indexed.

export const dynamic = "force-dynamic";

const has = (name) => Boolean(process.env[name]?.trim());

function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

export async function GET() {
  const wpUrl = process.env.NEXT_PUBLIC_WP_URL?.trim() ?? "";
  const settings = {
    NEXT_PUBLIC_WP_URL: wpUrl ? `set (${hostOf(wpUrl) ?? "not a valid URL"})` : "MISSING",
    WC_CONSUMER_KEY: has("WC_CONSUMER_KEY") ? "set" : "MISSING",
    WC_CONSUMER_SECRET: has("WC_CONSUMER_SECRET") ? "set" : "MISSING",
    PAYSTACK_SECRET_KEY: has("PAYSTACK_SECRET_KEY") ? "set" : "MISSING",
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: has("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY") ? "set" : "MISSING",
  };

  let woocommerce = "not checked (NEXT_PUBLIC_WP_URL missing)";
  if (wpUrl && hostOf(wpUrl)) {
    try {
      const response = await axios.get(`${wpUrl}/wp-json/wc/v3/products`, {
        params: {
          per_page: 1,
          _fields: "id",
          consumer_key: process.env.WC_CONSUMER_KEY,
          consumer_secret: process.env.WC_CONSUMER_SECRET,
        },
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
        timeout: 15000,
        validateStatus: () => true,
      });
      const total = response.headers["x-wp-total"];
      if (response.status === 200 && Array.isArray(response.data)) {
        woocommerce = `OK - ${total ?? "?"} published products`;
      } else if (response.status === 401 || response.status === 403) {
        woocommerce = `REACHED BUT KEYS REJECTED (HTTP ${response.status}) - create a new REST API key with Read/Write access`;
      } else if (response.status === 404) {
        woocommerce = "REACHED BUT NO WOOCOMMERCE API (HTTP 404) - NEXT_PUBLIC_WP_URL may point to the wrong site";
      } else {
        woocommerce = `UNEXPECTED RESPONSE (HTTP ${response.status})`;
      }
    } catch (error) {
      woocommerce = `UNREACHABLE (${error.code ?? error.message}) - the WordPress server did not answer`;
    }
  }

  const ok = Object.values(settings).every((v) => v !== "MISSING") && woocommerce.startsWith("OK");

  return Response.json(
    { status: ok ? "ALL GOOD" : "NEEDS ATTENTION", settings, woocommerce, checkedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } }
  );
}
