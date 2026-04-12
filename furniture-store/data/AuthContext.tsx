'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export type Role = 'admin' | 'customer';

export interface User {
  id: string;
  email: string;
  role: Role;
  full_name?: string;
  phone_number?: string;
}

interface AuthContextProps {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  isAdmin: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('smartwood_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user session");
      }
    }
    setInitialized(true);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('smartwood_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartwood_user');
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return false;

    try {
      // Map frontend camelCase to DB snake_case if needed, 
      // but here we align them or use direct mapping
      const dbUpdates: any = {};
      if (updates.full_name !== undefined) dbUpdates.full_name = updates.full_name;
      if (updates.phone_number !== undefined) dbUpdates.phone_number = updates.phone_number;

      const { data, error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('smartwood_user', JSON.stringify(updatedUser));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update user profile:', err);
      return false;
    }
  };

  if (!initialized) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAdmin: user?.role === 'admin',
        isCustomer: user?.role === 'customer' || !user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
