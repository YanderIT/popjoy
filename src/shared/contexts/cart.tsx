'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';

import { CartItem, CartState, CartContextValue } from '@/shared/types/cart';

const CART_STORAGE_KEY = 'popjoy_cart';

const CartContext = createContext<CartContextValue>({} as CartContextValue);

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          const parsed: CartState = JSON.parse(saved);
          setItems(parsed.items || []);
        }
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      const cartState: CartState = {
        items,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
    }
  }, [items, isLoading]);

  const addItem = useCallback(
    (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.skuId === item.skuId);

        if (existingIndex >= 0) {
          // Update quantity for existing item
          const updated = [...prev];
          const newQuantity = updated[existingIndex].quantity + quantity;

          // Check stock
          if (newQuantity > item.stock) {
            toast.error('Insufficient stock');
            return prev;
          }

          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQuantity,
          };
          return updated;
        }

        // Check stock for new item
        if (quantity > item.stock) {
          toast.error('Insufficient stock');
          return prev;
        }

        // Add new item
        return [...prev, { ...item, quantity }];
      });
    },
    []
  );

  const removeItem = useCallback((skuId: string) => {
    setItems((prev) => prev.filter((item) => item.skuId !== skuId));
  }, []);

  const updateQuantity = useCallback((skuId: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((item) => item.skuId !== skuId));
      return;
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.skuId === skuId);
      if (existingIndex < 0) return prev;

      const item = prev[existingIndex];

      // Check stock
      if (quantity > item.stock) {
        toast.error('Insufficient stock');
        return prev;
      }

      const updated = [...prev];
      updated[existingIndex] = { ...item, quantity };
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemCount = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getSubtotal = useCallback(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  const getCurrency = useCallback(() => {
    return items[0]?.currency || 'USD';
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isLoading,
      isDrawerOpen,
      setDrawerOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemCount,
      getSubtotal,
      getCurrency,
    }),
    [
      items,
      isLoading,
      isDrawerOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemCount,
      getSubtotal,
      getCurrency,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
