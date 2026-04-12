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
    if (updates.category !== undefined) dbUpdates.category = updates.category;

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
