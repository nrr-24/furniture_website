'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FurnitureItem, DEFAULT_ITEMS } from './furnitureData';

interface FurnitureContextType {
  items: FurnitureItem[];
  initialized: boolean;
  addItem: (item: Omit<FurnitureItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<FurnitureItem>) => void;
  deleteItem: (id: string) => void;
}

const FurnitureContext = createContext<FurnitureContextType | undefined>(undefined);

export function FurnitureProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('smartwood_furniture');
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      setItems(DEFAULT_ITEMS);
      localStorage.setItem('smartwood_furniture', JSON.stringify(DEFAULT_ITEMS));
    }
    setInitialized(true);
  }, []);

  const saveItems = (newItems: FurnitureItem[]) => {
    setItems(newItems);
    localStorage.setItem('smartwood_furniture', JSON.stringify(newItems));
  };

  const addItem = (item: Omit<FurnitureItem, 'id'>) => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    saveItems([...items, newItem]);
  };

  const updateItem = (id: string, updates: Partial<FurnitureItem>) => {
    saveItems(items.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteItem = (id: string) => {
    saveItems(items.filter(i => i.id !== id));
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
