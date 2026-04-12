'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FurnitureItem, Category, mapDbRowToItem, mapItemToDbRow, mapDbRowToCategory } from './furnitureData';
import { supabase } from '../lib/supabase';

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
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          supabase.from('products').select('*').order('sort_order', { ascending: true }),
          supabase.from('categories').select('*').order('sort_order', { ascending: true })
        ]);

        if (prodRes.error) console.error('Error fetching products:', prodRes.error);
        if (catRes.error) console.error('Error fetching categories:', catRes.error);

        if (prodRes.data) setItems(prodRes.data.map(mapDbRowToItem));
        if (catRes.data) setCategories(catRes.data.map(mapDbRowToCategory));
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setInitialized(true);
      }
    };

    // Only fetch if not already hydrated
    if (initialItems.length === 0 && initialCategories.length === 0) {
      fetchData();
    }
  }, []);

  const addItem = async (item: Omit<FurnitureItem, 'id'>) => {
    const dbRow = mapItemToDbRow(item);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    // Build partial DB row from the updates
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.nameAr !== undefined) dbUpdates.name_ar = updates.nameAr;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.descriptionAr !== undefined) dbUpdates.description_ar = updates.descriptionAr;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.image !== undefined) dbUpdates.image_url = updates.image;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
    if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

    // Optimistic update
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));

    const { data, error } = await fetch('/api/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates: dbUpdates }),
    }).then(res => res.json());

    if (error) {
      console.error('API update error:', error);
    }
  };

  const deleteItem = async (id: string) => {
    // Optimistic update
    setItems(prev => prev.filter(i => i.id !== id));

    const { error } = await fetch(`/api/products?id=${id}`, {
      method: 'DELETE',
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  };

  const addCategory = async (name: string, nameAr: string) => {
    const sort_order = categories.length;
    const { data, error } = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...dbUpdates }),
    });
  };

  const deleteCategory = async (id: string) => {
    // Also remove products from state (database will handle cascade)
    setItems(prev => prev.filter(i => i.categoryId !== id));
    setCategories(prev => prev.filter(c => c.id !== id));

    await fetch(`/api/categories?id=${id}`, {
      method: 'DELETE',
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
      headers: { 'Content-Type': 'application/json' },
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
