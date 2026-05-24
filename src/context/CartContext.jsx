import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (newItem) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.productId === newItem.productId && item.selectedVariant === newItem.selectedVariant
      );
      
      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += (newItem.quantity || 1);
        return newItems;
      }
      return [...prevItems, { ...newItem, quantity: newItem.quantity || 1 }];
    });
  };

  const removeItem = (productId, selectedVariant) => {
    setItems((prevItems) => 
      prevItems.filter(item => !(item.productId === productId && item.selectedVariant === selectedVariant))
    );
  };

  const updateQty = (productId, selectedVariant, newQty) => {
    if (newQty < 1) return;
    setItems((prevItems) => 
      prevItems.map(item => 
        (item.productId === productId && item.selectedVariant === selectedVariant)
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, itemCount, setItems }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
