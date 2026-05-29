import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import CartItemCard from '../../components/cart/CartItemCard';
import CartSummary from '../../components/cart/CartSummary';
import { useCart } from '../../context/CartContext';
import cartService from '../../services/cartService';

export default function CartPage() {
  const { items, updateQty, removeItem, clearCart, setItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Validate cart items when page loads
    const validateCart = async () => {
      if (items.length === 0) return;
      try {
        const productIds = [...new Set(items.map(i => i.productId))]; // Deduplicate IDs
        const response = await cartService.validateItems(productIds);
        const productsInfo = response; // Array of ProductBatchDto
        
        let hasChanges = false;
        const updatedItems = items.map(item => {
          const freshInfo = productsInfo.find(p => p.id === item.productId);
          if (freshInfo) {
            // Check if any critical field changed or if imageUrl is missing/different
            if (
              item.price !== freshInfo.price ||
              item.name !== freshInfo.name ||
              item.shopName !== freshInfo.shopName ||
              item.imageUrl !== freshInfo.imageUrl
            ) {
              hasChanges = true;
              return {
                ...item,
                price: freshInfo.price,
                name: freshInfo.name,
                shopName: freshInfo.shopName || 'Tiệm Cũ',
                imageUrl: freshInfo.imageUrl
              };
            }
          }
          return item;
        });

        if (hasChanges) {
          setItems(updatedItems);
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra giỏ hàng', error);
      }
    };
    validateCart();
  }, []); // Run once on mount to avoid infinite loops if we update items

  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Group items by shopName
  const groupedItems = items.reduce((acc, item) => {
    const shopName = item.shopName || 'Tiệm Cũ';
    if (!acc[shopName]) acc[shopName] = [];
    acc[shopName].push(item);
    return acc;
  }, {});

  // Add dummy product for testing if cart is empty (just for development experience)
  const addDummyProduct = () => {
    const { setItems } = require('../../context/CartContext');
    // We cannot access setItems directly from useCart in this scope without destructuring it above
    // This is just a placeholder action. In a real scenario user adds from product page.
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f4ee] font-body text-[#3f3d2e]">
      <Navbar />
      
      <main className="flex-1 min-h-[95vh] w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#ac4218] mb-2 tracking-tight">Giỏ hàng của bạn</h1>
          <p className="text-[#646652]">Kiểm tra các sản phẩm trước khi thanh toán.</p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-[#ede5db] flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-7xl mb-6 opacity-80">🛒</div>
            <h2 className="text-2xl font-bold text-[#3f3d2e] mb-3">Giỏ hàng trống</h2>
            <p className="text-[#646652] mb-8 max-w-md">Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm tuyệt vời của chúng tôi nhé!</p>
            <Link 
              to="/home" 
              className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-[#ac4218] to-[#fe7e4f] text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 w-full">
              {/* Toolbar */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#ede5db]">
                <span className="font-semibold text-[#3f3d2e]">Tất cả sản phẩm</span>
                <button 
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ?')) {
                      clearCart();
                    }
                  }}
                  className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                >
                  Xoá tất cả
                </button>
              </div>

              {/* Group by shop */}
              <div className="space-y-8">
                {Object.keys(groupedItems).map(shopName => (
                  <div key={shopName} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-[#ede5db]">
                    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-50">
                      <span className="text-xl">🏪</span>
                      <span className="font-bold text-lg text-[#3f3d2e]">{shopName}</span>
                      <span className="text-brand-700 bg-brand-50 text-xs px-2.5 py-1 rounded-full font-bold tracking-wide">
                        MALL
                      </span>
                    </div>
                    <div className="space-y-4">
                      {groupedItems[shopName].map((item, idx) => (
                        <CartItemCard 
                          key={`${item.productId}-${item.selectedVariant}-${idx}`} 
                          item={item} 
                          onUpdateQty={updateQty}
                          onRemove={removeItem}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="w-full lg:w-[380px] lg:shrink-0">
              <CartSummary items={items} onCheckout={handleCheckout} />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
