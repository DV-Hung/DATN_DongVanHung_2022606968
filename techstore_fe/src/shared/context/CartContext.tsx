import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Product, Variant } from '../types';
import { apiClient } from '../../services/api';

export interface CartItem extends Product {
  quantity: number;
  variantId?: string;
  productId?: string;
  cartItemId?: string | number; // ID from API
  variantPrice?: number; // Price from variant
  variantImage?: string; // Image from variant
  color?: string; // Color from variant
  storage?: string; // Storage/ROM from variant
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, variant?: Variant) => Promise<void> | void;
  removeFromCart: (productId: string, variantId?: string, cartItemId?: string | number) => Promise<void> | void;
  updateQuantity: (productId: string, quantity: number, variantId?: string, cartItemId?: string | number) => Promise<void> | void;
  clearCart: () => Promise<void> | void;
  getTotalPrice: () => number;
  isLoading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get current user ID from localStorage
  const getCurrentUserId = (): number | null => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      // Decode JWT to get userId (basic decoding)
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const decoded = JSON.parse(atob(parts[1]));
      return decoded.userId ? parseInt(decoded.userId) : null;
    } catch (e) {
      console.error('Error decoding JWT token:', e);
      return null;
    }
  };

  const isUserLoggedIn = (): boolean => {
    return localStorage.getItem('authToken') !== null;
  };

  // Load cart from API if user is logged in
  useEffect(() => {
    const loggedIn = localStorage.getItem('authToken') !== null;
    if (loggedIn) {
      const userId = getCurrentUserId();
      if (userId) {
        console.log('User logged in with ID:', userId);
        loadCartFromAPI(userId);
      }
    }
  }, []); // Empty dependency array - only run once on mount

  const loadCartFromAPI = async (userId: number) => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCart(userId);
      const cartData: any[] = response.data?.data || [];

      console.log('Loading cart from API:', cartData); // Debug log

      // Map API response to CartItem format
      const cartItems: CartItem[] = cartData.map((item: any) => {
        console.log('Mapping cart item:', item); // Debug each item

        return {
          // Use variantId as unique identifier
          id: item.variantId?.toString() || item.id?.toString() || Math.random().toString(),
          name: item.productName || item.variantName || 'Unknown Product',
          price: parseFloat(item.price) || 0,
          image: item.imageUrl || item.productImage || item.variantImage || '/placeholder.jpg',
          brand: item.brandName || '',
          description: item.description || '',
          category: item.categoryName || '',
          inStock: (item.stockQuantity || 0) > 0,

          // Cart specific fields
          quantity: parseInt(item.quantity) || 1,
          variantId: item.variantId?.toString() || '',
          productId: item.productId?.toString() || '',
          cartItemId: item.id, // API CartItem ID - IMPORTANT
          variantPrice: parseFloat(item.price) || 0,
          variantImage: item.imageUrl || item.productImage || item.variantImage || '/placeholder.jpg',
          color: item.color || '',
          storage: item.storage || item.rom || '',

          // Fallback fields to satisfy Product interface
          rating: item.rating || 0,
          reviews: item.reviews || 0,
          originalPrice: item.originalPrice,
          processor: item.processor || '',
          memory: item.memory || '',
          display: item.display || '',
        };
      });

      console.log('Loaded cart items:', cartItems); // Debug final result
      setCart(cartItems);
      setError(null);
    } catch (err) {
      console.error('Error loading cart from API:', err);
      setError('Failed to load cart. Please refresh the page.');
      setCart([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = useCallback(async (product: Product, quantity: number = 1, variant?: Variant) => {
    const loggedIn = isUserLoggedIn();
    const userId = getCurrentUserId();

    if (loggedIn && userId && variant?.id) {
      // API call for logged-in users
      try {
        setIsLoading(true);
        const response = await apiClient.addToCart(userId, variant.id, quantity);

        // Map API response to CartItem
        const apiData = response.data?.data;
        const newItem: CartItem = {
          ...product,
          quantity: apiData?.quantity || quantity,
          variantId: variant.id?.toString(),
          productId: product.id,
          cartItemId: apiData?.id, // Important: use API response ID
          variantPrice: variant.retailPrice || product.price,
          variantImage: apiData?.imageUrl || variant.image,
          image: apiData?.imageUrl || variant.image || product.image,
          color: variant.color || '',
          storage: variant.storage || '',
        };

        setCart((prevCart) => {
          const existingItem = prevCart.find((item) => item.variantId === variant.id?.toString());

          if (existingItem) {
            return prevCart.map((item) =>
              item.variantId === variant.id?.toString()
                ? { ...item, quantity: item.quantity + quantity, cartItemId: apiData?.id || existingItem.cartItemId }
                : item
            );
          }

          return [...prevCart, newItem];
        });
        setError(null);
      } catch (err) {
        console.error('Error adding item to cart via API:', err);
        setError('Failed to add item to cart');
        throw err;
      } finally {
        setIsLoading(false);
      }
    } else {
      // Local state for non-logged-in users
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => (variant?.id ? item.variantId === variant.id?.toString() : item.id === product.id));

        const newCartItem: CartItem = {
          ...product,
          quantity,
          variantId: variant?.id?.toString(),
          productId: product.id,
          variantPrice: variant?.retailPrice || product.price,
          variantImage: variant?.image,
          color: variant?.color || '',
          storage: variant?.storage || '',
        };

        if (existingItem) {
          return prevCart.map((item) =>
            (variant?.id ? item.variantId === variant.id?.toString() : item.id === product.id)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }

        return [...prevCart, newCartItem];
      });
    }
  }, []);

  const removeFromCart = useCallback(async (productId: string, variantId?: string, cartItemId?: string | number) => {
    const loggedIn = isUserLoggedIn();

    if (loggedIn && cartItemId) {
      // API call for logged-in users
      try {
        setIsLoading(true);
        await apiClient.removeFromCart(cartItemId);

        // Use cartItemId to filter correctly
        setCart((prevCart) =>
          prevCart.filter((item) => item.cartItemId !== cartItemId)
        );
        setError(null);
      } catch (err) {
        console.error('Error removing item from cart via API:', err);
        setError('Failed to remove item from cart');
        throw err;
      } finally {
        setIsLoading(false);
      }
    } else {
      // Local state for non-logged-in users - use variantId as fallback
      setCart((prevCart) =>
        prevCart.filter((item) =>
          variantId ? item.variantId !== variantId : item.id !== productId
        )
      );
    }
  }, []);

  const updateQuantity = useCallback(async (productId: string, quantity: number, variantId?: string, cartItemId?: string | number) => {
    const loggedIn = isUserLoggedIn();

    if (quantity <= 0) {
      await removeFromCart(productId, variantId, cartItemId);
    } else if (loggedIn && cartItemId) {
      // API call for logged-in users
      try {
        setIsLoading(true);
        await apiClient.updateCartItem(cartItemId, quantity);

        setCart((prevCart) =>
          prevCart.map((item) =>
            item.cartItemId === cartItemId ? { ...item, quantity } : item
          )
        );
        setError(null);
      } catch (err) {
        console.error('Error updating cart item quantity via API:', err);
        setError('Failed to update cart item');
        throw err;
      } finally {
        setIsLoading(false);
      }
    } else {
      // Local state for non-logged-in users
      setCart((prevCart) =>
        prevCart.map((item) =>
          variantId ? (item.variantId === variantId ? { ...item, quantity } : item) : (item.id === productId ? { ...item, quantity } : item)
        )
      );
    }
  }, [removeFromCart]);

  const clearCart = useCallback(async () => {
    const loggedIn = isUserLoggedIn();
    const userId = getCurrentUserId();

    if (loggedIn && userId) {
      // API call for logged-in users
      try {
        setIsLoading(true);
        await apiClient.clearCart(userId);
        setCart([]);
        setError(null);
      } catch (err) {
        console.error('Error clearing cart via API:', err);
        setError('Failed to clear cart');
        throw err;
      } finally {
        setIsLoading(false);
      }
    } else {
      // Local state for non-logged-in users
      setCart([]);
    }
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
        isLoading,
        error,
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
