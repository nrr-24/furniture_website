'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FurnitureItem, Category, mapDbRowToItem, mapItemToDbRow, mapPartialItemToDbRow, mapDbRowToCategory } from './furnitureData';
import { supabase } from '../lib/supabase';
import { authHeaders } from '../lib/authClient';

interface FurnitureContextType {
  items: FurnitureItem[];
  categories: Category[];
  initialized: boolean;
  addItem: (item: Omit<FurnitureItem, 'id'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<FurnitureItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  deleteMultipleItems: (ids: string[]) => Promise<void>;
  reorderItems: (categoryId: string, newOrderedItems: FurnitureItem[]) => Promise<void>;
  
  addCategory: (name: string, nameAr: string) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (newOrderedCategories: Category[]) => Promise<void>;
}

const FurnitureContext = createContext<FurnitureContextType | undefined>(undefined);

export function FurnitureProvider({ 
  children, 
  initialItems = [],
  initialCategories = []
}: { 
  children: ReactNode, 
  initialItems?: FurnitureItem[],
  initialCategories?: Category[]
}) {
  const [items, setItems] = useState<FurnitureItem[]>(initialItems);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [initialized, setInitialized] = useState(initialItems.length > 0 || initialCategories.length > 0);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          supabase.from('products').select('*').order('sort_order', { ascending: true }),
          supabase.from('categories').select('*').order('sort_order', { ascending: true })
        ]);
        if (cancelled) return;
        if (prodRes.error) console.error('Error fetching products:', prodRes.error);
        if (catRes.error) console.error('Error fetching categories:', catRes.error);
        if (prodRes.data) setItems(prodRes.data.map(mapDbRowToItem));
        if (catRes.data) setCategories(catRes.data.map(mapDbRowToCategory));
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        if (!cancelled) setInitialized(true);
      }
    };

    // Initial fetch only if SSR didn't hydrate us — otherwise we already
    // have fresh data from the server render.
    if (initialItems.length === 0 && initialCategories.length === 0) {
      fetchData();
    } else {
      setInitialized(true);
    }

    // === Freshness layer 1: Supabase Realtime ===========================
    // Pushes INSERT/UPDATE/DELETE events from the DB straight into local
    // state, so admin changes appear in every connected browser within
    // ~1 second. Requires Realtime to be enabled on the `products` and
    // `categories` tables in the Supabase dashboard
    // (Database → Replication → enable for those tables). If it's not
    // enabled the channel just sits idle — the polling layer below covers
    // that case.
    const channel = supabase
      .channel('public:products,categories')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload: any) => {
          if (cancelled) return;
          if (payload.eventType === 'INSERT' && payload.new) {
            const item = mapDbRowToItem(payload.new);
            setItems(prev => prev.some(i => i.id === item.id) ? prev : [...prev, item]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const item = mapDbRowToItem(payload.new);
            setItems(prev => prev.map(i => i.id === item.id ? item : i));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setItems(prev => prev.filter(i => i.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        (payload: any) => {
          if (cancelled) return;
          if (payload.eventType === 'INSERT' && payload.new) {
            const cat = mapDbRowToCategory(payload.new);
            setCategories(prev => prev.some(c => c.id === cat.id) ? prev : [...prev, cat]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const cat = mapDbRowToCategory(payload.new);
            setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setCategories(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // === Freshness layer 2: refetch on tab focus ========================
    // When a user comes back to the tab after a while, immediately pull
    // the latest. Cheap, always works.
    const onVisible = () => { if (document.visibilityState === 'visible') fetchData(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', fetchData);

    // === Freshness layer 3: background polling ==========================
    // Catches the worst case (Realtime disabled + tab stayed in foreground
    // for a long time). 60s is gentle enough not to hammer Supabase.
    const interval = setInterval(fetchData, 60_000);

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', fetchData);
      clearInterval(interval);
    };
  }, []);

  const addItem = async (item: Omit<FurnitureItem, 'id'>) => {
    const dbRow = mapItemToDbRow(item);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(dbRow),
      });

      const { data, error } = await response.json();

      if (error) {
        console.error('API insert error:', error);
        return;
      }

      if (data) {
        setItems(prev => [...prev, mapDbRowToItem(data)]);
      }
    } catch (err) {
      console.error('Add item failed:', err);
    }
  };

  const updateItem = async (id: string, updates: Partial<FurnitureItem>) => {
    // Map ALL provided fields (camelCase → snake_case). Any new FurnitureItem
    // field added to ITEM_DB_COLUMNS automatically flows through here.
    const dbUpdates = mapPartialItemToDbRow(updates);

    if (Object.keys(dbUpdates).length === 0) {
      console.warn('updateItem called with no mappable fields', updates);
      return;
    }

    // Optimistic update
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));

    try {
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ id, updates: dbUpdates }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        console.error('API update error:', res.status, json.error || json);
        return;
      }
      if (json.data) {
        // Reconcile with the canonical row from DB so the UI reflects truth
        setItems(prev => prev.map(i => i.id === id ? mapDbRowToItem(json.data) : i));
      }
    } catch (err) {
      console.error('updateItem request failed:', err);
    }
  };

  const deleteItem = async (id: string) => {
    // Optimistic update
    setItems(prev => prev.filter(i => i.id !== id));

    const { error } = await fetch(`/api/products?id=${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(res => res.json());

    if (error) {
      console.error('API delete error:', error);
    }
  };

  const deleteMultipleItems = async (ids: string[]) => {
    // Optimistic update
    setItems(prev => prev.filter(i => !ids.includes(i.id)));

    const { error } = await fetch(`/api/products?ids=${ids.join(',')}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(res => res.json());

    if (error) {
      console.error('API batch delete error:', error);
    }
  };

  const reorderItems = async (categoryId: string, newOrderedItems: FurnitureItem[]) => {
    // Optimistic update locally
    const otherItems = items.filter(i => i.categoryId !== categoryId);
    const updatedOrderedItems = newOrderedItems.map((item, index) => ({ ...item, sortOrder: index }));
    setItems([...otherItems, ...updatedOrderedItems].sort((a, b) => a.sortOrder - b.sortOrder));

    const payload = updatedOrderedItems.map(item => ({
      id: item.id,
      sort_order: item.sortOrder,
      category_id: categoryId
    }));

    await fetch('/api/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    });
  };

  const addCategory = async (name: string, nameAr: string) => {
    const sort_order = categories.length;
    const { data, error } = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ name, name_ar: nameAr, sort_order }),
    }).then(res => res.json());

    if (data) setCategories(prev => [...prev, mapDbRowToCategory(data)]);
    if (error) console.error('Add category error:', error);
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.nameAr !== undefined) dbUpdates.name_ar = updates.nameAr;
    if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

    await fetch('/api/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ id, ...dbUpdates }),
    });
  };

  const deleteCategory = async (id: string) => {
    // Also remove products from state (database will handle cascade)
    setItems(prev => prev.filter(i => i.categoryId !== id));
    setCategories(prev => prev.filter(c => c.id !== id));

    await fetch(`/api/categories?id=${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
  };

  const reorderCategories = async (newOrderedCategories: Category[]) => {
    const updated = newOrderedCategories.map((cat, index) => ({ ...cat, sortOrder: index }));
    setCategories(updated);

    const payload = updated.map(cat => ({
      id: cat.id,
      sort_order: cat.sortOrder
    }));

    await fetch('/api/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    });
  };

  return (
    <FurnitureContext.Provider value={{ 
      items, categories, initialized, 
      addItem, updateItem, deleteItem, deleteMultipleItems, reorderItems,
      addCategory, updateCategory, deleteCategory, reorderCategories
    }}>
      {children}
    </FurnitureContext.Provider>
  );
}

export function useFurniture() {
  const context = useContext(FurnitureContext);
  if (context === undefined) {
    throw new Error('useFurniture must be used within a FurnitureProvider');
  }
  return context;
}
