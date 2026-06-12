import axios from "axios";
import { unstable_cache } from "next/cache";

// Server-only WooCommerce REST API client.
// WC_CONSUMER_KEY / WC_CONSUMER_SECRET must stay server-side, so only import
// this file in Server Components, Route Handlers, or Server Actions.

const baseURL = `${process.env.NEXT_PUBLIC_WP_URL}/wp-json/wc/v3`;

const api = axios.create({ baseURL });

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

// Read-only catalog data is cached for an hour and served stale-while-revalidate
// in the background, so storefront pages stay fast even under heavy WooCommerce load.
const CATALOG_CACHE_OPTIONS = { revalidate: 3600, tags: ["products"] };
const CATEGORY_CACHE_OPTIONS = { revalidate: 3600, tags: ["categories"] };

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const getProducts = unstable_cache(
  async (params = {}) => {
    const { data } = await api.get("/products", { params });
    return data;
  },
  ["wc-products"],
  CATALOG_CACHE_OPTIONS
);

// Like getProducts, but also returns pagination info from response headers.
export const getProductsWithCount = unstable_cache(
  async (params = {}) => {
    const response = await api.get("/products", { params });
    return {
      products: response.data,
      total: Number(response.headers["x-wp-total"] ?? 0),
      totalPages: Number(response.headers["x-wp-totalpages"] ?? 0),
    };
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
    const { data } = await api.get("/products", { params: { slug } });
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
