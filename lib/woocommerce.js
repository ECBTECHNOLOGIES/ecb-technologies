import axios from "axios";
import { unstable_cache } from "next/cache";

// Server-only WooCommerce REST API client.
// WC_CONSUMER_KEY / WC_CONSUMER_SECRET must stay server-side, so only import
// this file in Server Components, Route Handlers, or Server Actions.

const baseURL = `${process.env.NEXT_PUBLIC_WP_URL}/wp-json/wc/v3`;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "Mozilla/5.0",
  },
});

// Some hosts (including Vercel's proxy) strip the Authorization header before
// it reaches WordPress, which causes Basic Auth to fail with a 401 even though
// it works locally. Authenticate via query params instead, as recommended by
// the WooCommerce REST API docs for environments where headers aren't reliable.
api.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    consumer_key: process.env.WC_CONSUMER_KEY,
    consumer_secret: process.env.WC_CONSUMER_SECRET,
  };
  return config;
});

// WordPress's configured site URL is www.ecbtechkenya.com, so image and
// permalink URLs in API responses are absolute URLs on that host. That host
// currently returns 503s, while the apex domain serves the same content, so
// rewrite those URLs to NEXT_PUBLIC_WP_URL before returning data to pages.
const STALE_MEDIA_HOST = "https://www.ecbtechkenya.com";

api.interceptors.response.use((response) => {
  if (typeof response.data === "object" && response.data !== null) {
    response.data = JSON.parse(
      JSON.stringify(response.data).split(STALE_MEDIA_HOST).join(process.env.NEXT_PUBLIC_WP_URL)
    );
  }
  return response;
});

// Read-only catalog data is cached for 6 hours and served stale-while-revalidate
// in the background, so storefront pages stay fast and we limit how often the
// unstable WooCommerce host gets hit.
const CATALOG_CACHE_OPTIONS = { revalidate: 21600, tags: ["products"] };
const CATEGORY_CACHE_OPTIONS = { revalidate: 3600, tags: ["categories"] };

// Retries a request up to `retries` times, waiting `delayMs` between attempts.
// The WooCommerce host intermittently returns 503s, so transient failures are
// retried before giving up.
async function fetchWithRetry(requestFn, { retries = 3, delayMs = 2000 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      console.error(
        `WooCommerce request failed (attempt ${attempt}/${retries}), status: ${error.response?.status ?? "no response"}`
      );
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const getProducts = unstable_cache(
  async (params = {}) => {
    const { data } = await api.get("/products", { params: { status: "publish", ...params } });
    return data;
  },
  ["wc-products"],
  CATALOG_CACHE_OPTIONS
);

// Last successful result per param set, used as a fallback if a revalidation
// fails even after retries, so the storefront never goes blank.
const lastGoodProductsByParams = new Map();

// Like getProducts, but also returns pagination info from response headers.
export const getProductsWithCount = unstable_cache(
  async (params = {}) => {
    const finalParams = { status: "publish", ...params };
    const cacheKey = JSON.stringify(finalParams);

    try {
      const response = await fetchWithRetry(() => api.get("/products", { params: finalParams }));
      const result = {
        products: response.data,
        total: Number(response.headers["x-wp-total"] ?? 0),
        totalPages: Number(response.headers["x-wp-totalpages"] ?? 0),
      };
      lastGoodProductsByParams.set(cacheKey, result);
      return result;
    } catch (error) {
      const fallback = lastGoodProductsByParams.get(cacheKey);
      if (fallback) {
        console.error(
          "getProductsWithCount: all retries failed, serving last known good result:",
          error.message
        );
        return fallback;
      }
      throw error;
    }
  },
  ["wc-products-with-count"],
  CATALOG_CACHE_OPTIONS
);

export const getProduct = unstable_cache(
  async (id) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },
  ["wc-product"],
  CATALOG_CACHE_OPTIONS
);

export const getProductBySlug = unstable_cache(
  async (slug) => {
    const { data } = await api.get("/products", { params: { slug, status: "publish" } });
    return data[0] ?? null;
  },
  ["wc-product-by-slug"],
  CATALOG_CACHE_OPTIONS
);

export const getProductVariations = unstable_cache(
  async (productId) => {
    const { data } = await api.get(`/products/${productId}/variations`);
    return data;
  },
  ["wc-product-variations"],
  CATALOG_CACHE_OPTIONS
);

export async function getFeaturedProducts(perPage = 8) {
  return getProducts({ featured: true, per_page: perPage, status: "publish" });
}

export async function getOnSaleProducts(perPage = 8) {
  return getProducts({ on_sale: true, per_page: perPage, status: "publish" });
}

export async function searchProducts(query, params = {}) {
  return getProducts({ search: query, ...params });
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const getCategories = unstable_cache(
  async (params = {}) => {
    const { data } = await api.get("/products/categories", {
      params: { per_page: 100, hide_empty: true, ...params },
    });
    return data;
  },
  ["wc-categories"],
  CATEGORY_CACHE_OPTIONS
);

export const getCategory = unstable_cache(
  async (id) => {
    const { data } = await api.get(`/products/categories/${id}`);
    return data;
  },
  ["wc-category"],
  CATEGORY_CACHE_OPTIONS
);

export const getCategoryBySlug = unstable_cache(
  async (slug) => {
    const { data } = await api.get("/products/categories", { params: { slug } });
    return data[0] ?? null;
  },
  ["wc-category-by-slug"],
  CATEGORY_CACHE_OPTIONS
);

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
// Order/customer data is per-request and never cached.

export async function createOrder(orderData) {
  const { data } = await api.post("/orders", orderData);
  return data;
}

export async function getOrder(id) {
  const { data } = await api.get(`/orders/${id}`);
  return data;
}

export async function getOrders(params = {}) {
  const { data } = await api.get("/orders", { params });
  return data;
}

export async function updateOrder(id, orderData) {
  const { data } = await api.put(`/orders/${id}`, orderData);
  return data;
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export async function createCustomer(customerData) {
  const { data } = await api.post("/customers", customerData);
  return data;
}

export async function getCustomer(id) {
  const { data } = await api.get(`/customers/${id}`);
  return data;
}

export async function getCustomerByEmail(email) {
  const { data } = await api.get("/customers", { params: { email } });
  return data[0] ?? null;
}

export async function updateCustomer(id, customerData) {
  const { data } = await api.put(`/customers/${id}`, customerData);
  return data;
}
