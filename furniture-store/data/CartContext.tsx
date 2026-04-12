'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextProps {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const skipSync = useRef(false);

  // 1. Initial Load: Local or DB
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        // Fetch from DB
        const { data, error } = await supabase
          .from('cart_items')
          .select('quantity, products(*)')
          .eq('user_id', user.id);
        
        if (data && !error) {
          const dbItems: CartItem[] = (data as any[]).map((row: any) => ({
            id: row.products.id,
            name: row.products.name,
            price: row.products.price,
            image: row.products.image_url,
            quantity: row.quantity
          }));

          // Merge with Local Storage if guest items exist
          const saved = localStorage.getItem('smartwood_cart');
          if (saved) {
            const localItems: CartItem[] = JSON.parse(saved);
            const merged = [...dbItems];
            localItems.forEach(li => {
              const existing = merged.find(mi => mi.id === li.id);
              if (existing) {
                existing.quantity += li.quantity;
              } else {
                merged.push(li);
              }
            });
            
            // Persist the merge to DB
            for (const item of localItems) {
               await supabase.from('cart_items').upsert({
                 user_id: user.id,
                 product_id: item.id,
                 quantity: item.quantity // simplified merge logic
               }, { onConflict: 'user_id,product_id' });
            }
            
            setCart(merged);
            localStorage.removeItem('smartwood_cart');
          } else {
            setCart(dbItems);
          }
        }
      } else {
        // Load from Local Storage (Guest)
        const saved = localStorage.getItem('smartwood_cart');
        if (saved) setCart(JSON.parse(saved));
      }
      setInitialized(true);
    };

    loadCart();
  }, [user]);

  // 2. Local Storage Sync (Guests only)
  useEffect(() => {
    if (initialized && !user) {
      localStorage.setItem('smartwood_cart', JSON.stringify(cart));
    }
  }, [cart, initialized, user]);

  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    if (user) {
      const existing = cart.find(i => i.id === item.id);
      const newQty = existing ? existing.quantity + 1 : 1;
      
      const { error } = await supabase.from('cart_items').upsert({
        user_id: user.id,
        product_id: item.id,
        quantity: newQty
      }, { onConflict: 'user_id,product_id' });

      if (error) console.error('Failed to sync cart to DB:', error);
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = async (id: string) => {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', id);
    }
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(id);
    
    if (user) {
      await supabase.from('cart_items').update({ quantity }).eq('user_id', user.id).eq('product_id', id);
    }
    
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = async () => {
    if (user) {
       await supabase.from('cart_items').delete().eq('user_id', user.id);
    }
    setCart([]);
  };

  const [isCartOpen, setIsCartOpen] = useState(false);

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems, isCartOpen, setIsCartOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
