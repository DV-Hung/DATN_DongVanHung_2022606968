import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Product, Variant } from '../types';

export interface CartItem extends Product {
  quantity: number;
  variantId?: string;
  productId?: string;
  variantPrice?: number; // Price from variant
  variantImage?: string; // Image from variant
  color?: string; // Color from variant
  storage?: string; // Storage/ROM from variant
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, variant?: Variant) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product, quantity: number = 1, variant?: Variant) => {
    setCart((prevCart) => {
      // Use variantId as unique key if variant is provided, otherwise use productId
      const uniqueKey = variant?.id || product.id;
      const existingItem = prevCart.find((item) => (variant?.id ? item.variantId === variant.id : item.id === product.id));

      const newCartItem: CartItem = {
        ...product,
        quantity,
        variantId: variant?.id,
        productId: product.id,
        variantPrice: variant?.retailPrice || product.price,
        variantImage: variant?.image,
        color: variant?.color,
        storage: variant?.storage,
      };

      if (existingItem) {
        return prevCart.map((item) =>
          (variant?.id ? item.variantId === variant.id : item.id === product.id)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevCart, newCartItem];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, variantId?: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) =>
        variantId ? item.variantId !== variantId : item.id !== productId
      )
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          variantId ? (item.variantId === variantId ? { ...item, quantity } : item) : (item.id === productId ? { ...item, quantity } : item)
        )
      );
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => total + (item.variantPrice || item.price) * item.quantity, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
