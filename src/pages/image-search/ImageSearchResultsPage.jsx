import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Heart, ArrowLeft, SlidersHorizontal, Camera, Sparkles } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

function formatPrice(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + 'đ';
}

/**
 * Image-search results page.
 *
 * Receives data via react-router location.state:
 *   { results: ImageSearchResultDto[], previewUrl: string, fileName: string }
 */
export default function ImageSearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results = [], previewUrl, fileName } = location.state || {};

  const [activeFilter, setActiveFilter] = useState('all');
  const [likedIds, setLikedIds] = useState(new Set());

  // Redirect if no results data (direct URL visit)
  if (!location.state) {
    return <Navigate to="/products" replace />;
  }

  const toggleLike = (id) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Extract unique filter chips from results
  const filterChips = useMemo(() => {
    const categoryMap = new Map();
    results.forEach((r) => {
      const cat = r.product?.categoryName;
      if (cat && !categoryMap.has(cat)) {
        categoryMap.set(cat, cat);
      }
    });
    const conditionMap = new Map();
    results.forEach((r) => {
      const cond = r.product?.conditionStatus;
      if (cond && !conditionMap.has(cond)) {
        conditionMap.set(cond, cond.replace('_', ' '));
      }
    });
    return [
      ...Array.from(categoryMap, ([key, label]) => ({ key, label, type: 'category' })),
      ...Array.from(conditionMap, ([key, label]) => ({ key, label, type: 'condition' })),
    ];
  }, [results]);

  const filteredResults = useMemo(() => {
    if (activeFilter === 'all') return results;
    return results.filter((r) => {
      return (
        r.product?.categoryName === activeFilter ||
        r.product?.conditionStatus === activeFilter
      );
    });
  }, [results, activeFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF4] font-body text-[#3f3d2e]">
      <Navbar />

      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#fdf8f2] via-[#fef6ee] to-[#fdf0e5] border-b border-[#ede5db] overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#d4711e]/[0.04] blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#b14f25]/[0.03] blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl bg-white/70 hover:bg-white border border-[#ede5db] text-sm font-semibold text-[#5a5644] hover:text-[#b14f25] transition-all duration-200 shadow-sm hover:shadow"
          >
            <ArrowLeft size={16} strokeWidth={2.2} />
            Quay lại
          </button>

          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14">
            {/* Uploaded image preview */}
            <div className="relative shrink-0 hero-float">
              <div className="w-52 h-64 md:w-60 md:h-72 rounded-3xl overflow-hidden shadow-2xl shadow-[#d4711e]/15 border-4 border-white/80 rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={fileName || 'Ảnh tìm kiếm'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#fef0e0] to-[#fde8d0] flex items-center justify-center">
                    <Camera size={48} className="text-[#d4711e]/40" />
                  </div>
                )}
              </div>
              {/* Badge */}
              <span className="absolute -bottom-2 left-4 bg-gradient-to-r from-[#d4711e] to-[#b14f25] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md tracking-wider uppercase">
                Ảnh gốc
              </span>
            </div>

            {/* Hero text */}
            <div className="flex-1 text-center md:text-left">
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-black italic leading-[1.1] gradient-text-orange"
              >
                Kết quả tìm kiếm
                <br />
                cho hình ảnh của bạn
              </h1>
              <p className="mt-4 text-sm md:text-base text-[#8c8a79] max-w-md">
                Chúng tôi tìm thấy{' '}
                <span className="font-bold text-[#b14f25]">{results.length}</span> sản phẩm
                tương đồng với hình ảnh bạn đã tải lên
              </p>

              {/* Filter chips */}
              {filterChips.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2 justify-center md:justify-start">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
                      activeFilter === 'all'
                        ? 'bg-[#b14f25] text-white border-[#b14f25] shadow-md shadow-[#b14f25]/20'
                        : 'bg-white text-[#5a5644] border-[#e2dfc7] hover:border-[#d4711e] hover:text-[#d4711e]'
                    }`}
                  >
                    <Sparkles size={12} />
                    Tất cả
                  </button>
                  {filterChips.map((chip) => (
                    <button
                      key={chip.key}
                      onClick={() =>
                        setActiveFilter(activeFilter === chip.key ? 'all' : chip.key)
                      }
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 capitalize ${
                        activeFilter === chip.key
                          ? 'bg-[#b14f25] text-white border-[#b14f25] shadow-md shadow-[#b14f25]/20'
                          : 'bg-white text-[#5a5644] border-[#e2dfc7] hover:border-[#d4711e] hover:text-[#d4711e]'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Results Section ─────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Results header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-[#3f3d2e]">Lựa chọn hàng đầu</h2>
            <p className="text-xs text-[#8c8a79] mt-0.5">
              {filteredResults.length} sản phẩm • Sắp xếp theo độ tương đồng
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b14f25] hover:underline underline-offset-2 transition"
            >
              <ArrowLeft size={14} />
              Về cửa hàng
            </Link>
            <button className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#e2dfc7] bg-white text-xs font-semibold text-[#5a5644] hover:border-[#d4711e] hover:text-[#d4711e] transition-colors">
              <SlidersHorizontal size={13} />
              Bộ lọc
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredResults.map((item, index) => (
              <ResultCard
                key={item.product?.id || index}
                item={item}
                index={index}
                isLiked={likedIds.has(item.product?.id)}
                onToggleLike={() => toggleLike(item.product?.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </main>

      <Footer />
    </div>
  );
}

/* ── Result Card ──────────────────────────────────────────────── */

function ResultCard({ item, index, isLiked, onToggleLike }) {
  const { product, similarityPercent } = item;

  const badgeColor =
    similarityPercent >= 80
      ? 'from-[#d4711e] to-[#b14f25]'
      : similarityPercent >= 60
        ? 'from-[#e49040] to-[#d4711e]'
        : 'from-[#c4b8a8] to-[#a89d91]';

  return (
    <div
      className="group rounded-2xl bg-white border border-[#f0ece0] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#d4711e]/8 hover:-translate-y-1 transition-all duration-300 card-reveal"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <Link to={`/products/${product?.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[4/5] bg-[#f5ede4] overflow-hidden">
          <img
            src={
              product?.imageUrl ||
              'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60'
            }
            alt={product?.name || 'Sản phẩm'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Similarity badge */}
          <span
            className={`absolute top-3 left-3 inline-flex items-center gap-1 bg-gradient-to-r ${badgeColor} text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-md tracking-wider uppercase badge-shimmer`}
            style={{
              backgroundImage: `linear-gradient(90deg, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 40%, rgba(255,255,255,0.3) 50%, var(--tw-gradient-to) 60%, var(--tw-gradient-from) 100%)`,
            }}
          >
            TƯƠNG ĐỒNG {similarityPercent}%
          </span>

          {/* Heart button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleLike();
            }}
            className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
              isLiked
                ? 'bg-[#c0392b] text-white scale-110'
                : 'bg-white/90 text-[#c4b8a8] hover:text-[#c0392b] hover:bg-white'
            }`}
            aria-label="Yêu thích"
          >
            <Heart
              size={16}
              strokeWidth={2.2}
              fill={isLiked ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-sm text-[#3f3d2e] line-clamp-1 group-hover:text-[#b14f25] transition-colors duration-200">
            {product?.name || 'Sản phẩm'}
          </h3>
          <p className="text-[11px] text-[#8c8a79] mt-0.5 line-clamp-1">
            {product?.conditionStatus
              ? product.conditionStatus.replace('_', ' ')
              : ''}{' '}
            {product?.categoryName ? `• ${product.categoryName}` : ''}
            {product?.shopName ? ` • ${product.shopName}` : ''}
          </p>
          <p className="mt-2 text-lg font-extrabold text-[#b14f25]">
            {formatPrice(product?.price)}
          </p>
        </div>
      </Link>
    </div>
  );
}

/* ── Empty State ──────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#fef0e0] to-[#fde8d0] flex items-center justify-center mb-6 shadow-sm">
        <Camera size={40} className="text-[#d4711e]/50" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-[#3f3d2e] mb-2">
        Không tìm thấy sản phẩm tương đồng
      </h3>
      <p className="text-sm text-[#8c8a79] max-w-sm mb-6">
        Hãy thử tải lên một bức ảnh khác với góc chụp rõ ràng hơn hoặc nền sáng hơn.
      </p>
      <Link
        to="/products"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#d4711e] to-[#b14f25] text-white font-bold text-sm shadow-lg shadow-[#d4711e]/20 hover:shadow-xl hover:from-[#c25f10] hover:to-[#963f1c] transition-all active:scale-[0.98]"
      >
        <ArrowLeft size={16} />
        Khám phá cửa hàng
      </Link>
    </div>
  );
}
