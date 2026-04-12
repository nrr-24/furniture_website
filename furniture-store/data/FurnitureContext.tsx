'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FurnitureItem, mapDbRowToItem, mapItemToDbRow } from './furnitureData';
import { supabase } from '../lib/supabase';

interface FurnitureContextType {
  items: FurnitureItem[];
  initialized: boolean;
  addItem: (item: Omit<FurnitureItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<FurnitureItem>) => void;
  deleteItem: (id: string) => void;
}

const FurnitureContext = createContext<FurnitureContextType | undefined>(undefined);

export function FurnitureProvider({ 
  children, 
  initialItems = [] 
}: { 
  children: ReactNode, 
  initialItems?: FurnitureItem[] 
}) {
  const [items, setItems] = useState<FurnitureItem[]>(initialItems);
  const [initialized, setInitialized] = useState(initialItems.length > 0);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Supabase fetch error:', error.message);
          setItems([]);
        } else {
          setItems((data || []).map(mapDbRowToItem));
        }
      } catch (error) {
        console.error('Failed to load products from Supabase:', error);
        setItems([]);
      } finally {
        setInitialized(true);
      }
    };
    loadProducts();
  }, []);

  const addItem = async (item: Omit<FurnitureItem, 'id'>) => {
    const dbRow = mapItemToDbRow(item);

    const { data, error } = await supabase
      .from('products')
      .insert([dbRow])
      .select();

    if (error) {
      console.error('Supabase insert error:', error.message);
      return;
    }

    if (data && data.length > 0) {
      setItems(prev => [...prev, mapDbRowToItem(data[0])]);
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
    if (updates.category !== undefined) dbUpdates.category = updates.category;

    // Optimistic update
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));

    const { error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Supabase update error:', error.message);
    }
  };

  const deleteItem = async (id: string) => {
    // Optimistic update
    setItems(prev => prev.filter(i => i.id !== id));

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error.message);
    }
  };

  return (
    <FurnitureContext.Provider value={{ items, initialized, addItem, updateItem, deleteItem }}>
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
