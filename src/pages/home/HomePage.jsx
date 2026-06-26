import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  Search,
  Bell,
  Package,
  ShoppingCart,
  User,
  Store,
  LogOut,
  Camera,
} from "lucide-react";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import Footer from "../../components/common/Footer";
import ImageSearchModal from "../../components/common/ImageSearchModal";
import Swal from "sweetalert2";

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
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState("all");

  const [showDropdown, setShowDropdown] = useState(false);
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && (user?.role === "admin" || user?.role === "ADMIN")) {
      navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    Swal.fire({
      title: "Đăng xuất",
      text: "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
      background: "#fdf8f2",
      color: "#3f3d2e",
      buttonsStyling: false,
      customClass: {
        popup: "rounded-2xl border border-[#ede5db] p-6",
        confirmButton:
          "bg-[#d4711e] hover:bg-[#c25f10] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition active:scale-[0.98] outline-none border-none mx-2 cursor-pointer",
        cancelButton:
          "bg-[#a89d91] hover:bg-[#96897c] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition active:scale-[0.98] outline-none border-none mx-2 cursor-pointer",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        toast.success("Đăng xuất thành công!");
        navigate("/home");
      }
    });
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const categoryPromise = categoryService.getAll();
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

        const [categoryRes, ...otherPages] = await Promise.all([
          categoryPromise,
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
    return [...productsByCategory]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 3);
  }, [productsByCategory]);

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
      <header className="sticky top-0 z-30 border-b border-[#e2dfc7] bg-[#f4f4dc]/95 backdrop-blur">
        <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/home"
            className="text-4 font-display text-3xl font-bold italic text-[#b14f25]"
          >
            Tủ cũ chill
          </Link>

          <nav className="hidden items-center gap-8 text-[15px] font-medium text-[#5a5644] md:flex md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link to="/home" className="hover:text-[#b14f25]">
              Khám phá
            </Link>
            <Link to="/products" className="hover:text-[#b14f25]">
              Cửa hàng
            </Link>
            <a href="#trending" className="hover:text-[#b14f25]">
              Xu hướng
            </a>
          </nav>

          <div className="flex items-center gap-5 text-[#b14f25]">
            <button
              onClick={() => navigate("/products")}
              className="hover:opacity-80 transition flex items-center justify-center"
              aria-label="Tìm kiếm"
              title="Tìm kiếm"
            >
              <Search size={20} strokeWidth={2.2} />
            </button>
            <button
              onClick={() => setIsImageSearchOpen(true)}
              className="hover:opacity-80 transition flex items-center justify-center"
              aria-label="Tìm bằng ảnh"
              title="Tìm kiếm bằng hình ảnh"
            >
              <Camera size={20} strokeWidth={2.2} />
            </button>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/notifications")}
                  className="hover:opacity-80 transition flex items-center justify-center"
                  aria-label="Thông báo"
                  title="Thông báo"
                >
                  <Bell size={20} strokeWidth={2.2} />
                </button>
                <button
                  onClick={() =>
                    navigate(
                      user?.role === "seller" ? "/seller/orders" : "/orders",
                    )
                  }
                  className="hover:opacity-80 transition flex items-center justify-center"
                  aria-label="Đơn hàng"
                  title="Đơn hàng"
                >
                  <Package size={20} strokeWidth={2.2} />
                </button>
                <div
                  className="relative cursor-pointer flex items-center hover:opacity-80 transition"
                  onClick={() => navigate("/cart")}
                  title="Giỏ hàng"
                >
                  <ShoppingCart size={20} strokeWidth={2.2} />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2.5 bg-[#b14f25] text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
                      {itemCount}
                    </span>
                  )}
                </div>
                <div className="relative" ref={dropdownRef}>
                  <div
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-8 h-8 rounded-full bg-[#5c3d3d] overflow-hidden cursor-pointer ml-1 border border-[#b14f25]/30 hover:scale-105 hover:border-[#b14f25] transition"
                    title={user?.username || user?.email || "Tài khoản"}
                  >
                    <img
                      src="https://i.pravatar.cc/32?img=47"
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {showDropdown && (
                    <div
                      className="absolute top-[110%] right-0 bg-white rounded-xl shadow-lg border border-[#e2dfc7] py-2 min-w-[170px] z-50 flex flex-col"
                      style={{
                        boxShadow: "0 4px 15px rgba(122, 53, 22, 0.12)",
                      }}
                    >
                      <div className="px-4 py-2 border-b border-[#f5ede4] mb-1">
                        <p className="text-[13px] font-bold text-[#3f3d2e] m-0 overflow-hidden text-overflow-ellipsis white-space-nowrap">
                          {user?.username || user?.email || "Người dùng"}
                        </p>
                        <p className="text-[10px] text-[#a89d91] m-[2px_0_0_0] uppercase font-semibold">
                          {user?.role === "seller" ? "Người bán" : "Người mua"}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate("/profile");
                        }}
                        className="px-4 py-2 bg-transparent border-none text-[#4A3B32] hover:text-[#b14f25] hover:bg-[#fcfaf2] text-left text-[13px] font-medium cursor-pointer flex items-center gap-2.5 w-full transition-colors"
                      >
                        <User size={16} strokeWidth={2} />
                        <span>Trang cá nhân</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate(
                            user?.role === "seller"
                              ? "/seller/orders"
                              : "/orders",
                          );
                        }}
                        className="px-4 py-2 bg-transparent border-none text-[#4A3B32] hover:text-[#b14f25] hover:bg-[#fcfaf2] text-left text-[13px] font-medium cursor-pointer flex items-center gap-2.5 w-full transition-colors"
                      >
                        <Package size={16} strokeWidth={2} />
                        <span>Đơn mua của tôi</span>
                      </button>

                      {user?.role === "seller" && (
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            navigate("/seller/dashboard");
                          }}
                          className="px-4 py-2 bg-transparent border-none text-[#4A3B32] hover:text-[#b14f25] hover:bg-[#fcfaf2] text-left text-[13px] font-medium cursor-pointer flex items-center gap-2.5 w-full transition-colors"
                        >
                          <Store size={16} strokeWidth={2} />
                          <span>Kênh bán hàng</span>
                        </button>
                      )}

                      <div className="h-[1px] bg-[#f5ede4] my-1" />

                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          handleLogout();
                        }}
                        className="px-4 py-2 bg-transparent border-none text-[#c0392b] hover:bg-[#fcfaf2] text-left text-[13px] font-bold cursor-pointer flex items-center gap-2.5 w-full transition-colors"
                      >
                        <LogOut size={16} strokeWidth={2} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div
                  className="relative cursor-pointer flex items-center mr-2 hover:opacity-80 transition"
                  onClick={() => navigate("/cart")}
                  title="Giỏ hàng"
                >
                  <ShoppingCart size={20} strokeWidth={2.2} />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2.5 bg-[#b14f25] text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
                      {itemCount}
                    </span>
                  )}
                </div>
                <Link
                  to="/auth?mode=login"
                  className="rounded-xl border border-[#b14f25] px-4 py-1.5 text-sm font-semibold text-[#b14f25] hover:bg-[#b14f25] hover:text-white transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="rounded-xl bg-[#b14f25] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#963f1c] transition"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

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

      <ImageSearchModal
        isOpen={isImageSearchOpen}
        onClose={() => setIsImageSearchOpen(false)}
      />
    </div>
  );
}
