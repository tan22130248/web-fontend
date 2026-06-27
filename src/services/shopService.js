import http from "../utils/http";

function unwrapData(response, fallback) {
  if (response && typeof response === "object" && Object.prototype.hasOwnProperty.call(response, "data")) {
    return response.data ?? fallback;
  }

  return response ?? fallback;
}

function unpackList(response) {
  const data = unwrapData(response, []);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;

  return [];
}

function normalizeShop(shop) {
  if (!shop || Array.isArray(shop)) return null;
  if (typeof shop === "object" && Object.keys(shop).length === 0) return null;

  return {
    ...shop,
    id: shop.id ?? shop.shopId ?? shop.userId,
    name: shop.name || shop.shopName || shop.fullName || shop.username || "Cua hang",
    imageUrl: shop.imageUrl || shop.avatarUrl || shop.shopAvatarUrl || shop.coverUrl,
    category: shop.category || shop.address || shop.description || shop.tier,
    rating: Number(shop.rating ?? shop.averageRating ?? shop.reputationScore ?? 5),
    badge: shop.badge || (shop.verified ? "Verified" : ""),
  };
}

function normalizeShopList(response) {
  return unpackList(response).map(normalizeShop).filter(Boolean);
}

async function getAllShops() {
  const requests = [
    () => http.get("/api/shops", { page: 0, size: 100 }),
    () => http.get("/api/shops/search", { q: "%" }),
    () => http.get("/api/shops/search"),
    () => http.get("/api/shops/search", { q: "" }),
    () => http.get("/api/shops/search", { keyword: "" }),
  ];

  for (const request of requests) {
    try {
      const shops = normalizeShopList(await request());
      if (shops.length > 0) return shops;
    } catch (_err) {
      // Try the next known backend shape.
    }
  }

  return [];
}

const shopService = {
  getShopById: (id) => http.get(`/api/shops/${id}`),

  getMyShop: () => http.get("/api/shops/my"),

  getMyShopPoints: () => http.get("/api/shops/my/points"),

  createShop: (shopData) => http.post("/api/shops", shopData),

  updateShop: (shopData) => http.put("/api/shops", shopData),
};

async function getAll() {
  return getAllShops();
}

async function getFeatured() {
  const response = await http.get("/api/shops/featured");
  return normalizeShopList(response);
}

async function getWeekly() {
  const response = await http.get("/api/shops/featured/week");
  return normalizeShop(unwrapData(response, null));
}

async function getNewlyVerified() {
  const response = await http.get("/api/shops/newly-verified");
  return normalizeShopList(response);
}

async function searchShops(keyword) {
  const response = await http.get("/api/shops/search", { q: keyword });
  return normalizeShopList(response);
}

async function getById(shopId) {
  const response = await http.get(`/api/shops/${shopId}`);
  return normalizeShop(unwrapData(response, null));
}

async function getProducts(shopId, page = 0, size = 12) {
  const response = await http.get("/api/products", { shop: shopId, page, size });
  return response?.content || response || [];
}

export default {
  getAll,
  getFeatured,
  getWeekly,
  getNewlyVerified,
  searchShops,
  getById,
  getProducts,
};

export { shopService };
