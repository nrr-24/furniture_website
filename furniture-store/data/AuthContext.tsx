'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Role = 'admin' | 'customer';

interface AuthContextProps {
  role: Role;
  setRole: (role: Role) => void;
  isAdmin: boolean;
  isCustomer: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>('customer');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('smartwood_role');
    if (saved && (saved === 'admin' || saved === 'customer')) {
      setRoleState(saved as Role);
    }
    setInitialized(true);
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    localStorage.setItem('smartwood_role', newRole);
  };

  if (!initialized) return null;

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        isAdmin: role === 'admin',
        isCustomer: role === 'customer',
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
