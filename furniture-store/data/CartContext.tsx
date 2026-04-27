'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;              // composite line key: `${productId}::${color}::${type}`
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedColor?: string | null;
  selectedType?: string | null;
}

export function makeCartLineId(productId: string, color?: string | null, type?: string | null): string {
  return `${productId}::${color ?? ''}::${type ?? ''}`;
}

interface CartContextProps {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

// Match a cart_items row by variant identity (product_id + selected_color + selected_type).
// Handles NULL-vs-string correctly via .is(null) / .eq().
function applyVariantMatch(
  q: any,
  selectedColor?: string | null,
  selectedType?: string | null
) {
  q = selectedColor ? q.eq('selected_color', selectedColor) : q.is('selected_color', null);
  q = selectedType ? q.eq('selected_type', selectedType) : q.is('selected_type', null);
  return q;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const skipSync = useRef(false);

  // 1. Initial Load: Local or DB
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('cart_items')
          .select('quantity, selected_color, selected_type, products(*)')
          .eq('user_id', user.id);

        if (data && !error) {
          const dbItems: CartItem[] = (data as any[])
            .filter((row: any) => row.products !== null) // Skip orphaned items
            .map((row: any) => ({
              id: makeCartLineId(row.products.id, row.selected_color, row.selected_type),
              productId: row.products.id,
              name: row.products.name,
              price: row.products.price,
              image: row.products.image_url,
              quantity: row.quantity,
              selectedColor: row.selected_color ?? null,
              selectedType: row.selected_type ?? null,
            }));

          // Merge with any guest cart in localStorage
          const saved = localStorage.getItem('smartwood_cart');
          if (saved) {
            try {
              const localItems: CartItem[] = JSON.parse(saved);
              const merged = [...dbItems];
              for (const li of localItems) {
                const existing = merged.find(mi => mi.id === li.id);
                if (existing) {
                  existing.quantity += li.quantity;
                } else {
                  merged.push(li);
                }
              }

              // Persist local additions to DB (variant-aware find-or-insert)
              for (const li of localItems) {
                const baseQuery = supabase.from('cart_items').select('id, quantity')
                  .eq('user_id', user.id)
                  .eq('product_id', li.productId);
                const { data: existingRow } = await applyVariantMatch(baseQuery, li.selectedColor, li.selectedType).maybeSingle();

                if (existingRow) {
                  await supabase.from('cart_items')
                    .update({ quantity: existingRow.quantity + li.quantity })
                    .eq('id', existingRow.id);
                } else {
                  await supabase.from('cart_items').insert({
                    user_id: user.id,
                    product_id: li.productId,
                    quantity: li.quantity,
                    selected_color: li.selectedColor ?? null,
                    selected_type: li.selectedType ?? null,
                  });
                }
              }

              setCart(merged);
              localStorage.removeItem('smartwood_cart');
            } catch (err) {
              console.error('Cart merge error:', err);
              setCart(dbItems);
            }
          } else {
            setCart(dbItems);
          }
        }
      } else {
        const saved = localStorage.getItem('smartwood_cart');
        if (saved) {
          try {
            const parsed: CartItem[] = JSON.parse(saved);
            // Backfill composite id for carts written before this change
            const normalized = parsed.map(i => ({
              ...i,
              productId: i.productId ?? i.id,
              id: i.id && i.id.includes('::') ? i.id : makeCartLineId(i.productId ?? i.id, i.selectedColor, i.selectedType),
            }));
            setCart(normalized);
          } catch {
            setCart([]);
          }
        }
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

  const addToCart = async (item: Omit<CartItem, 'quantity' | 'id'>) => {
    const color = item.selectedColor ?? null;
    const type = item.selectedType ?? null;
    const lineId = makeCartLineId(item.productId, color, type);

    if (user) {
      const baseQuery = supabase.from('cart_items').select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', item.productId);
      const { data: existingRow, error: selErr } = await applyVariantMatch(baseQuery, color, type).maybeSingle();
      if (selErr) console.error('Cart select error:', selErr.message, selErr);

      if (existingRow) {
        const { error } = await supabase.from('cart_items')
          .update({ quantity: existingRow.quantity + 1 })
          .eq('id', existingRow.id);
        if (error) console.error('Cart update error:', error.message, error);
      } else {
        const { error } = await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: item.productId,
          quantity: 1,
          selected_color: color,
          selected_type: type,
        });
        if (error) console.error('Cart insert error:', error.message, error);
      }
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.id === lineId);
      if (existing) {
        return prev.map((i) => (i.id === lineId ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, id: lineId, quantity: 1, selectedColor: color, selectedType: type }];
    });
  };

  const removeFromCart = async (id: string) => {
    const entry = cart.find(i => i.id === id);
    if (user && entry) {
      const baseQuery = supabase.from('cart_items').delete()
        .eq('user_id', user.id)
        .eq('product_id', entry.productId);
      const { error } = await applyVariantMatch(baseQuery, entry.selectedColor, entry.selectedType);
      if (error) console.error('Cart remove error:', error.message, error);
    }
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(id);

    const entry = cart.find(i => i.id === id);
    if (user && entry) {
      const baseQuery = supabase.from('cart_items').update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', entry.productId);
      const { error } = await applyVariantMatch(baseQuery, entry.selectedColor, entry.selectedType);
      if (error) console.error('Cart qty update error:', error.message, error);
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
