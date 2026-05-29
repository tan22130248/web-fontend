import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import productService from '../../services/productService';

const formatPrice = (val) => {
  if (val == null) return '0đ';
  return Number(val).toLocaleString('vi-VN') + 'đ';
};

const conditionLabel = (status) => {
  const map = {
    like_new: 'MỚI 99%', good: 'MỚI 95%', fair: 'MỚI 90%',
    used: 'ĐÃ QUA SỬ DỤNG',
  };
  return map[status] || status?.toUpperCase() || 'N/A';
};

function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-[#EDE9DA] via-[#F5F2E8] to-[#EDE9DA] bg-[length:200%_100%] rounded-xl ${className}`}
      style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
    />
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 flex gap-4">
          <div className="flex flex-col gap-3 w-16 sm:w-20 shrink-0">
            {[1, 2, 3].map(i => <Skeleton key={i} className="aspect-square !rounded-lg" />)}
          </div>
          <Skeleton className="flex-1 aspect-[4/5] !rounded-2xl" />
        </div>
        {/* Info skeletons */}
        <div className="lg:col-span-5 space-y-5">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  /* ── state ── */
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [shopProducts, setShopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeImg, setActiveImg] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [imgZoom, setImgZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [prod, vars] = await Promise.all([
          productService.getById(id),
          productService.getVariants(id),
        ]);

        if (cancelled) return;
        setProduct(prod);
        setVariants(vars || []);
        setActiveImg(prod.imageUrl || (prod.images && prod.images[0]) || '');
        setSelectedVariant(null);
        setQuantity(1);

        const relatedPromises = [];
        if (prod.categoryId) {
          relatedPromises.push(
            productService.getByCategory(prod.categoryId, 0, 8)
              .then(res => {
                if (!cancelled) {
                  const items = (res?.content || []).filter(p => p.id !== id);
                  setSimilarProducts(items.slice(0, 4));
                }
              }).catch(() => {})
          );
        }
        if (prod.shopId) {
          relatedPromises.push(
            productService.getByShop(prod.shopId, 0, 6)
              .then(res => {
                if (!cancelled) {
                  const items = (res?.content || []).filter(p => p.id !== id);
                  setShopProducts(items.slice(0, 4));
                }
              }).catch(() => {})
          );
        }
        await Promise.allSettled(relatedPromises);
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || 'Không thể tải sản phẩm');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  const finalPrice = useMemo(() => {
    if (!product) return 0;
    const base = Number(product.price) || 0;
    const modifier = selectedVariant ? (Number(selectedVariant.priceModifier) || 0) : 0;
    return base + modifier;
  }, [product, selectedVariant]);

  const maxStock = useMemo(() => {
    if (selectedVariant) return selectedVariant.stockQty || selectedVariant.stock || 1;
    return product?.stock || 1;
  }, [product, selectedVariant]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: finalPrice,
      imageUrl: product.imageUrl || (product.images && product.images[0]) || '',
      selectedVariant: selectedVariant
        ? `${selectedVariant.size || ''} ${selectedVariant.color || ''}`.trim()
        : 'default',
      variantId: selectedVariant?.id || null,
      quantity,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const sizeOptions = useMemo(() => [...new Set(variants.map(v => v.size).filter(Boolean))], [variants]);
  const colorOptions = useMemo(() => [...new Set(variants.map(v => v.color).filter(Boolean))], [variants]);


  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF4] text-[#4A3B32] font-sans antialiased">
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        <Header />
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FCFBF4] text-[#4A3B32] font-sans antialiased">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-6">🛍️</div>
          <h2 className="text-2xl font-bold text-[#4A3B32] mb-3">Không tìm thấy sản phẩm</h2>
          <p className="text-sm text-gray-500 mb-8">{error || 'Sản phẩm này có thể đã bị ẩn hoặc không tồn tại.'}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-[#E87745] hover:bg-[#d66534] text-white font-bold text-sm px-8 py-3 rounded-xl transition-colors"
          >
            Quay lại cửa hàng
          </button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.imageUrl].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FCFBF4] text-[#4A3B32] font-sans antialiased">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-7 flex gap-4">
            <div className="flex flex-col gap-3 w-16 sm:w-20 shrink-0">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImg(img)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:opacity-90 ${activeImg === img ? 'border-[#A14A24] shadow-md' : 'border-transparent'}`}
                >
                  <img src={img} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div
              className="flex-1 aspect-[4/5] bg-white rounded-2xl overflow-hidden shadow-sm border border-[#F0ECE0] relative cursor-crosshair"
              onMouseEnter={() => setImgZoom(true)}
              onMouseLeave={() => setImgZoom(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={activeImg}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300"
                style={imgZoom ? {
                  transform: 'scale(1.8)',
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                } : {}}
              />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="flex flex-wrap gap-2">
              {product.categoryName && (
                <span className="text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-md bg-[#E3ECCb] text-[#556B2F] uppercase">
                  {product.categoryName}
                </span>
              )}
              {product.conditionStatus && (
                <span className="text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-md bg-orange-100 text-orange-700 uppercase">
                  {conditionLabel(product.conditionStatus)}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#4A3B32] leading-tight">{product.name}</h1>
              <div className="flex items-baseline space-x-3 mt-2">
                <span className="text-2xl sm:text-3xl font-black text-[#A14A24]">{formatPrice(finalPrice)}</span>
                {selectedVariant && Number(selectedVariant.priceModifier) !== 0 && (
                  <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400">
                <span>👁 {product.viewCount || 0} lượt xem</span>
                <span>📦 Đã bán {product.soldCount || 0}</span>
                <span>📦 Còn {maxStock} sản phẩm</span>
              </div>
            </div>

            {(sizeOptions.length > 0 || colorOptions.length > 0) && (
              <div className="space-y-4 bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl p-4">
                {sizeOptions.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-[#4A3B32] mb-2 block">Kích cỡ</label>
                    <div className="flex flex-wrap gap-2">
                      {sizeOptions.map(size => {
                        const isSelected = selectedVariant?.size === size;
                        return (
                          <button
                            key={size}
                            onClick={() => {
                              const v = variants.find(vr => vr.size === size && (selectedVariant?.color ? vr.color === selectedVariant.color : true))
                                || variants.find(vr => vr.size === size);
                              setSelectedVariant(v);
                              if (v?.imageUrl) setActiveImg(v.imageUrl);
                              setQuantity(1);
                            }}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isSelected
                              ? 'bg-[#A14A24] text-white shadow-sm'
                              : 'bg-white border border-[#EBE7D9] text-[#4A3B32] hover:border-[#A14A24]'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {colorOptions.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-[#4A3B32] mb-2 block">Màu sắc</label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map(color => {
                        const isSelected = selectedVariant?.color === color;
                        return (
                          <button
                            key={color}
                            onClick={() => {
                              const v = variants.find(vr => vr.color === color && (selectedVariant?.size ? vr.size === selectedVariant.size : true))
                                || variants.find(vr => vr.color === color);
                              setSelectedVariant(v);
                              if (v?.imageUrl) setActiveImg(v.imageUrl);
                              setQuantity(1);
                            }}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isSelected
                              ? 'bg-[#A14A24] text-white shadow-sm'
                              : 'bg-white border border-[#EBE7D9] text-[#4A3B32] hover:border-[#A14A24]'
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-4">
              <label className="text-xs font-bold text-[#4A3B32]">Số lượng</label>
              <div className="flex items-center border border-[#EBE7D9] rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-[#FAF8F0] transition-colors font-bold"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="w-12 text-center text-sm font-bold text-[#4A3B32]">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(maxStock, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-[#FAF8F0] transition-colors font-bold"
                  disabled={quantity >= maxStock}
                >
                  +
                </button>
              </div>
              <span className="text-[11px] text-gray-400">{maxStock} sản phẩm có sẵn</span>
            </div>

            <div className="bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl p-4 flex items-start justify-between">
              <div className="flex space-x-3">
                {product.shopAvatarUrl ? (
                  <img src={product.shopAvatarUrl} alt="avatar shop" className="w-11 h-11 rounded-full object-cover border border-[#EBE7D9]" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-orange-200 flex items-center justify-center font-bold text-sm text-orange-800">
                    {(product.shopName || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-[#4A3B32]">{product.shopName || 'Cửa hàng'}</h4>
                  <div className="flex items-center text-[11px] text-emerald-600 font-medium mt-1">
                    <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Đã xác thực
                  </div>
                </div>
              </div>
              <Link to={`/products?shop=${product.shopId}`} className="text-xs font-bold text-[#A14A24] hover:underline shrink-0">
                Xem tiệm
              </Link>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full bg-[#E87745] hover:bg-[#d66534] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                <span>Thêm vào giỏ</span>
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full bg-[#FCD8B8] hover:bg-[#f3cbab] text-[#A14A24] font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]"
              >
                Mua ngay
              </button>
            </div>

            <div className="flex items-center justify-around text-xs text-gray-500 pt-2 border-t border-[#EBE7D9]/60">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Giao hàng toàn quốc
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.212 8H17" />
                </svg>
                7 ngày đổi trả
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-16 items-start">

          <div className="lg:col-span-8 space-y-12">
            <section className="bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm">
              <h2 className="text-lg font-bold text-[#4A3B32] border-b-2 border-[#A14A24] w-fit pb-1 mb-4">Mô tả sản phẩm</h2>
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                {product.description ? (
                  <p className="whitespace-pre-line">{product.description}</p>
                ) : (
                  <p className="text-gray-400 italic">Chưa có mô tả cho sản phẩm này.</p>
                )}
                <ul className="space-y-2 pt-3 border-t border-gray-100">
                  {product.brand && (
                    <li className="flex">
                      <span className="w-28 text-gray-400">Thương hiệu:</span>
                      <span className="font-medium text-[#4A3B32]">{product.brand}</span>
                    </li>
                  )}
                  {product.conditionStatus && (
                    <li className="flex">
                      <span className="w-28 text-gray-400">Tình trạng:</span>
                      <span className="font-medium text-[#4A3B32]">{conditionLabel(product.conditionStatus)}</span>
                    </li>
                  )}
                  {product.categoryName && (
                    <li className="flex">
                      <span className="w-28 text-gray-400">Danh mục:</span>
                      <span className="font-medium text-[#4A3B32]">{product.categoryName}</span>
                    </li>
                  )}
                </ul>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-[#4A3B32]">Đánh giá & Bình luận</h2>
                <button className="text-xs font-bold text-[#A14A24] flex items-center hover:underline">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Viết đánh giá
                </button>
              </div>
              <div className="text-center py-10">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-sm text-gray-400">Chưa có đánh giá nào cho sản phẩm này.</p>
                <p className="text-xs text-gray-300 mt-1">Hãy là người đầu tiên đánh giá!</p>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#EBF5E6] border border-[#D5E8CD] p-5 rounded-2xl">
              <div className="text-[#556B2F] mb-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-base text-[#2E4213]">Lựa chọn Bền vững</h3>
              <p className="text-xs text-[#556B2F] mt-1 leading-relaxed">
                Mua đồ cũ giúp giảm thiểu 15kg rác thải carbon so với việc mua một sản phẩm mới tương đương. Cảm ơn bạn đã bảo vệ môi trường!
              </p>
            </div>

            {shopProducts.length > 0 && (
              <div className="bg-[#FAF8F2] border border-[#EBE7D9] p-5 rounded-2xl space-y-4">
                <h3 className="font-bold text-sm text-[#4A3B32]">Gợi ý từ {product.shopName || 'Tiệm'}</h3>
                <div className="space-y-3">
                  {shopProducts.map((rec) => (
                    <Link
                      key={rec.id}
                      to={`/products/${rec.id}`}
                      className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-[#F0ECE0] cursor-pointer hover:shadow-sm transition-shadow"
                    >
                      <img
                        src={rec.imageUrl || (rec.images && rec.images[0]) || ''}
                        alt={rec.name}
                        className="w-12 h-12 object-cover rounded-lg shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs text-[#4A3B32] line-clamp-1">{rec.name}</h4>
                        <p className="font-bold text-xs text-[#A14A24] mt-0.5">{formatPrice(rec.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {similarProducts.length > 0 && (
          <section className="mt-20 pt-8 border-t border-[#EBE7D9]">
            <div className="flex justify-between items-baseline mb-6">
              <h2 className="text-xl font-bold text-[#4A3B32]">Sản phẩm tương tự</h2>
              <Link to={`/products?category=${product.categoryId}`} className="text-xs font-bold text-[#A14A24] hover:underline">
                Xem tất cả
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {similarProducts.map((prod) => (
                <Link key={prod.id} to={`/products/${prod.id}`} className="group cursor-pointer block">
                  <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-gray-100 mb-3 relative">
                    <img
                      src={prod.imageUrl || (prod.images && prod.images[0]) || ''}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {prod.conditionStatus && (
                      <span className="absolute top-2 left-2 text-[9px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded">
                        {conditionLabel(prod.conditionStatus)}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-medium text-gray-700 line-clamp-1 group-hover:text-[#A14A24] transition-colors">{prod.name}</h4>
                  <p className="font-bold text-sm text-[#A14A24] mt-0.5">{formatPrice(prod.price)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="bg-[#F5F2E6] border-t border-[#EBE7D9] mt-24 py-10 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="font-bold text-lg text-[#8C3B1A] mb-2">Tủ cũ chill</h3>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500 mb-4 font-medium">
            <a href="#about" className="hover:text-[#A14A24]">Về chúng tôi</a>
            <a href="#terms" className="hover:text-[#A14A24]">Điều khoản</a>
          </div>
          <p className="text-xs text-gray-400 mb-6">Thanh toán: Momo, ShopeePay, COD</p>
          <p className="text-[11px] text-gray-400">© 2024 Tiệm Cũ - Cho đồ cũ cuộc đời mới</p>
        </div>
      </footer>
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const { itemCount } = useCart();

  return (
    <header className="border-b border-[#EBE7D9] bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/home" className="text-xl font-bold tracking-wider text-[#A14A24] border-2 border-dashed border-[#A14A24] px-3 py-1 cursor-pointer hover:bg-[#A14A24]/5 transition-colors">
          Tủ cũ chill
        </Link>
        <nav className="hidden md:flex space-x-8 font-medium text-sm text-[#6B5A4E]">
          <Link to="/home" className="hover:text-[#A14A24] transition-colors">Khám Phá</Link>
          <Link to="/products" className="text-[#A14A24] font-semibold">Cửa Hàng</Link>
        </nav>
        <div className="flex items-center space-x-5 text-gray-600">
          <button onClick={() => navigate('/products')} className="hover:text-[#A14A24] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button onClick={() => navigate('/notifications')} className="hover:text-[#A14A24] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button onClick={() => navigate('/cart')} className="hover:text-[#A14A24] transition-colors relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#A14A24] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>
          <div
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-800 cursor-pointer hover:ring-2 hover:ring-[#A14A24]/30 transition-all"
          >
            U
          </div>
        </div>
      </div>
    </header>
  );
}