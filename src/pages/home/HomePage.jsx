import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import Footer from "../../components/common/Footer";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=80";

function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + "đ";
}

function getImage(product) {
  if (product?.imageUrl) return product.imageUrl;
  if (Array.isArray(product?.images) && product.images.length > 0) {
    return product.images[0]?.imageUrl || product.images[0]?.url;
  }
  return "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80";
}

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function Snowfall({ count = 60 }) {
  const flakes = useMemo(() => {
    const symbols = ["❄", "❅", "❆", "•", "✦"];
    return Array.from({ length: count }).map((_, index) => {
      const size = Math.random() * 14 + 6; // 6px - 20px
      const duration = Math.random() * 10 + 8; // 8s - 18s fall time
      const delay = Math.random() * -18; // negative so they're mid-fall on load
      const left = Math.random() * 100; // vw position
      const drift =
        Math.random() > 0.5 ? "animate-fall-right" : "animate-fall-left";
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const opacity = Math.random() * 0.5 + 0.4; // 0.4 - 0.9
      return { id: index, size, duration, delay, left, drift, symbol, opacity };
    });
  }, [count]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
      aria-hidden="true"
    >
      {flakes.map((flake) => (
        <span
          key={flake.id}
          className={`absolute top-0 ${flake.drift} select-none`}
          style={{
            left: `${flake.left}vw`,
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
            color: "#ffffff",
            textShadow: "0 0 6px rgba(255,255,255,0.85)",
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
          }}
        >
          {flake.symbol}
        </span>
      ))}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [trustedLatestProducts, setTrustedLatestProducts] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState("all");



  useEffect(() => {
    if (isAuthenticated && (user?.role === "admin" || user?.role === "ADMIN")) {
      navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const categoryPromise = categoryService.getAll();
        const trustedLatestPromise = productService.getTrustedLatest(0, 12);
        const firstProductPage = await productService.getAll(0, 48);

        const firstContent = normalizeList(firstProductPage);
        const totalPages =
          firstProductPage?.totalPages ||
          firstProductPage?.data?.totalPages ||
          1;

        const pageRequests = [];
        for (let page = 1; page < totalPages; page += 1) {
          pageRequests.push(productService.getAll(page, 48));
        }

        const [categoryRes, trustedLatestRes, ...otherPages] = await Promise.all([
          categoryPromise,
          trustedLatestPromise,
          ...pageRequests,
        ]);

        if (!mounted) return;

        const fetchedCategories = normalizeList(categoryRes).filter(
          (item) => item?.isActive !== false,
        );
        const fetchedProducts = [
          ...firstContent,
          ...otherPages.flatMap((pageData) => normalizeList(pageData)),
        ];

        setCategories(fetchedCategories);
        setProducts(fetchedProducts);
        setTrustedLatestProducts(normalizeList(trustedLatestRes));
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Không thể tải dữ liệu trang chủ",
        );
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const productsByCategory = useMemo(() => {
    if (activeCategoryId === "all") return products;
    return products.filter((item) => item.categoryId === activeCategoryId);
  }, [activeCategoryId, products]);

  const dealProducts = useMemo(() => {
    return [...productsByCategory]
      .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
      .slice(0, 8);
  }, [productsByCategory]);

  const latestProducts = useMemo(() => {
    const source =
      activeCategoryId === "all" && trustedLatestProducts.length > 0
        ? trustedLatestProducts
        : productsByCategory;

    return [...source]
      .sort((a, b) => {
        const createdDiff = new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        if (createdDiff !== 0) return createdDiff;
        return (b.shopTotalPoints || 0) - (a.shopTotalPoints || 0);
      })
      .slice(0, 3);
  }, [activeCategoryId, productsByCategory, trustedLatestProducts]);

  const categoryTabs = useMemo(() => {
    const mappedTabs = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
    }));

    return [{ id: "all", name: "Tất cả" }, ...mappedTabs];
  }, [categories]);

  return (
    <div className="min-h-screen bg-[#f4f4dc] font-body text-[#3f3d2e]">
      <Snowfall count={60} />

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[36px]">
          <img
            src={HERO_IMAGE}
            alt="Thời trang vintage"
            className="h-[500px] w-full object-cover ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/62 via-black/22 to-transparent" />

          <div className="absolute left-8 top-10 max-w-[560px] text-white sm:left-12 sm:top-14 fade-in-up">
            <span className="inline-flex rounded-full bg-[#b9ec97] px-4 py-1 text-xs font-bold text-[#2e4b21] shadow-sm">
              MỚI NHẤT TRONG TUẦN
            </span>
            <h1 className="mt-4 text-6xl font-extrabold leading-[1.04] sm:text-7xl tracking-tight">
              Thời trang
              <br />
              có gu, ví nhẹ nhàng.
            </h1>
            <p className="mt-4 max-w-[520px] text-2xl leading-snug text-white/90 font-light">
              Nơi tụ hội cộng đồng yêu đồ siêu rẻ, săn deal vintage độc bản tại
              Việt Nam.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="rounded-2xl bg-[#ff7e4d] hover:bg-[#ff642b] active:scale-95 transition-all px-9 py-4 text-lg font-bold text-white shadow-lg hover:shadow-[#ff7e4d]/30 shimmer-shine"
              >
                Khám phá ngay
              </Link>
              <a
                href="#trending"
                className="rounded-2xl bg-black/40 hover:bg-black/60 active:scale-95 transition-all px-9 py-4 text-lg font-bold text-white backdrop-blur shadow-lg"
              >
                Xem xu hướng
              </a>
            </div>
          </div>
        </section>

        <div className="mt-20 mb-6 flex flex-wrap items-center justify-center gap-2 py-2">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategoryId(tab.id)}
              className={`inline-flex items-center rounded-2xl px-5 py-2.5 text-[15px] font-semibold transition ${
                activeCategoryId === tab.id
                  ? "bg-white text-[#be4e20] shadow-sm"
                  : "text-[#5e5a49] hover:bg-white/70"
              }`}
            >
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        <section id="trending" className="mt-8 scroll-mt-20">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#b14f25]">
                Limited time
              </p>
              <h2 className="mt-1 text-5xl font-extrabold text-[#2f3628]">
                Săn deal hời
              </h2>
            </div>
            <Link
              to="/products"
              className="text-2xl font-semibold text-[#b14f25] hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dealProducts.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="group rounded-[26px] bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-[#e2dfc7]/40 hover:shadow-[0_20px_40px_rgba(177,79,37,0.08)] hover:border-[#b14f25]/10 hover:-translate-y-2 transition-all duration-300 ease-out block shimmer-shine"
              >
                <div className="relative overflow-hidden rounded-[20px]">
                  <img
                    src={getImage(product)}
                    alt={product.name}
                    className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-[#d3413f] px-3 py-1 text-xs font-bold text-white shadow-md pulse-glow">
                    Hot
                  </span>
                </div>
                <div className="px-1 py-3">
                  <p className="line-clamp-1 text-lg font-bold text-[#3f3d2e] group-hover:text-[#b14f25] transition-colors duration-200">
                    {product.name}
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-[#b14f25]">
                    {formatPrice(product.price)}
                  </p>
                  <p className="mt-1 text-xs text-[#8c8a79]">
                    {product.shopName || "Tiệm Cũ"} • Đã bán{" "}
                    {product.soldCount || 0}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-center text-6xl font-extrabold text-[#2f3628]">
            Hàng mới về
          </h2>
          <p className="mt-3 text-center text-2xl text-[#767464]">
            Cập nhật mỗi ngày từ các "Tiệm Cũ" uy tín
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {latestProducts[0] && (
              <Link
                to={`/products/${latestProducts[0].id}`}
                className="group relative lg:col-span-2 overflow-hidden rounded-[38px] block"
              >
                <img
                  src={getImage(latestProducts[0])}
                  alt={latestProducts[0].name}
                  className="h-[620px] w-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="text-5xl font-extrabold tracking-tight">
                    {latestProducts[0].name}
                  </h3>
                  <p className="mt-2 text-xl text-white/90 font-light">
                    {latestProducts[0].shopName || "Tiệm Cũ"} •{" "}
                    {formatPrice(latestProducts[0].price)}
                  </p>
                  <span className="mt-5 inline-flex rounded-full bg-white hover:bg-[#ff7e4d] hover:text-white px-6 py-2 text-lg font-bold text-[#b14f25] shadow-lg transition-all duration-300 transform group-hover:translate-x-1">
                    Xem ngay
                  </span>
                </div>
              </Link>
            )}

            <div className="grid gap-6">
              {latestProducts.slice(1).map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group relative overflow-hidden rounded-[38px] block"
                >
                  <img
                    src={getImage(product)}
                    alt={product.name}
                    className="h-[298px] w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
