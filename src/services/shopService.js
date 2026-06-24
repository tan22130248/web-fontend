import http from "../utils/http";

const shopService = {
  getShopById: (id) => http.get(`/api/shops/${id}`),

  getMyShop: () => http.get("/api/shops/my"),

  createShop: (shopData) => http.post("/api/shops", shopData),

  updateShop: (shopData) => http.put("/api/shops", shopData),
};

const API_BASE = "http://localhost:8080/api/shops";

async function getFeatured() {
  const res = await fetch(`${API_BASE}/featured`);
  if (!res.ok) throw new Error("Failed to fetch featured shops");
  const json = await res.json();
  return json.data || [];
}

async function getWeekly() {
  const res = await fetch(`${API_BASE}/featured/week`);
  if (!res.ok) throw new Error("Failed to fetch weekly shop");
  const json = await res.json();
  return json.data || null;
}

async function getNewlyVerified() {
  const res = await fetch(`${API_BASE}/newly-verified`);
  if (!res.ok) throw new Error("Failed to fetch newly verified shops");
  const json = await res.json();
  return json.data || [];
}

// Fetch single shop - backend may return raw DTO or wrapped {data:...}
async function getById(shopId) {
  const res = await fetch(`${API_BASE}/${shopId}`);
  if (!res.ok) throw new Error("Failed to fetch shop");
  const json = await res.json();
  return json.data || json;
}

// Fetch products for a shop (proxy to /api/products?shop=...)
async function getProducts(shopId, page = 0, size = 12) {
  const url = new URL("http://localhost:8080/api/products");
  url.searchParams.set("shop", shopId);
  url.searchParams.set("page", page);
  url.searchParams.set("size", size);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch shop products");
  const json = await res.json();
  // Spring Page returns object with 'content'
  return json.content || json || [];
}

export default {
  getFeatured,
  getWeekly,
  getNewlyVerified,
  getById,
  getProducts,
};

export { shopService };
