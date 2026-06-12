const BASE_URLS = [
  "https://www.ecbtechkenya.com",
  "https://ecbtechkenya.com",
];

const REQUEST_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "User-Agent": "Mozilla/5.0",
};

export async function GET() {
  const results = [];

  for (const baseUrl of BASE_URLS) {
    const url = `${baseUrl}/wp-json/wc/v3/products?consumer_key=${process.env.WC_CONSUMER_KEY}&consumer_secret=${process.env.WC_CONSUMER_SECRET}&per_page=1`;

    try {
      const res = await fetch(url, {
        cache: "no-store",
        headers: REQUEST_HEADERS,
      });
      const text = await res.text();

      let data = null;
      let parseError = null;
      try {
        data = JSON.parse(text);
      } catch (err) {
        parseError = err.message;
      }

      results.push({
        baseUrl,
        status: res.status,
        contentType: res.headers.get("content-type"),
        parseError,
        bodyPreview: text.slice(0, 500),
        hasProducts: Array.isArray(data),
        productCount: Array.isArray(data) ? data.length : 0,
        error: !parseError && !Array.isArray(data) ? data : null,
      });
    } catch (error) {
      results.push({ baseUrl, error: error.message });
    }
  }

  return Response.json({ results });
}
