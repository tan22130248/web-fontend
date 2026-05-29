import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      const activeUser = JSON.parse(localStorage.getItem('user'));
      const key = activeUser ? `cart_user_${activeUser.id || activeUser.email}` : 'cart_guest';
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);

      const legacySaved = localStorage.getItem('cart');
      if (legacySaved) {
        localStorage.setItem(key, legacySaved);
        localStorage.removeItem('cart');
        return JSON.parse(legacySaved);
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const key = user ? `cart_user_${user.id || user.email}` : 'cart_guest';
    try {
      const saved = localStorage.getItem(key);
      const userItems = saved ? JSON.parse(saved) : [];

      if (user) {
        const guestSaved = localStorage.getItem('cart_guest');
        const guestItems = guestSaved ? JSON.parse(guestSaved) : [];
        if (guestItems.length > 0) {
          const merged = [...userItems];
          guestItems.forEach((gItem) => {
            const existingIndex = merged.findIndex(
              (item) => item.productId === gItem.productId && item.selectedVariant === gItem.selectedVariant
            );
            if (existingIndex > -1) {
              merged[existingIndex].quantity += gItem.quantity;
            } else {
              merged.push(gItem);
            }
          });
          setItems(merged);
          localStorage.removeItem('cart_guest');
          return;
        }
      }
      
      setItems(userItems);
    } catch (e) {
      console.error("Error loading cart for user", e);
    }
  }, [user]);

  useEffect(() => {
    const key = user ? `cart_user_${user.id || user.email}` : 'cart_guest';
    localStorage.setItem(key, JSON.stringify(items));
  }, [items, user]);

  const addItem = (newItem) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.productId === newItem.productId && item.selectedVariant === newItem.selectedVariant
      );
      
      if (existingItemIndex > -1) {
        return prevItems.map((item, idx) => 
          idx === existingItemIndex 
            ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
            : item
        );
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
