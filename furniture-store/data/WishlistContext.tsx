'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface WishlistContextProps {
  wishlist: string[];                 // product IDs
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextProps | undefined>(undefined);

const LS_KEY = 'smartwood_wishlist';

/**
 * Wishlist state. Logged-in users persist to the `wishlists` table via
 * /api/wishlist; guests persist to localStorage. On login the guest list is
 * merged up to the account.
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  // Guard so the persist effect doesn't clobber localStorage with [] before
  // the initial load runs.
  const [loaded, setLoaded] = useState(false);

  // Load on mount / when auth changes.
  useEffect(() => {
    const load = async () => {
      if (user) {
        // Merge any guest list into the account first.
        let guest: string[] = [];
        try { guest = JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { guest = []; }

        try {
          const res = await fetch(`/api/wishlist?userId=${user.id}`);
          const json = await res.json();
          const dbIds: string[] = json.productIds || [];

          const toAdd = guest.filter((id) => !dbIds.includes(id));
          await Promise.all(
            toAdd.map((productId) =>
              fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, productId }),
              })
            )
          );

          const merged = Array.from(new Set([...dbIds, ...guest]));
          setWishlist(merged);
          localStorage.removeItem(LS_KEY);
        } catch {
          setWishlist(guest);
        }
      } else {
        try { setWishlist(JSON.parse(localStorage.getItem(LS_KEY) || '[]')); } catch { setWishlist([]); }
      }
      setLoaded(true);
    };
    load();
  }, [user]);

  // Persist guest list to localStorage (only after the initial load).
  useEffect(() => {
    if (loaded && !user) localStorage.setItem(LS_KEY, JSON.stringify(wishlist));
  }, [wishlist, user, loaded]);

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const toggleWishlist = (productId: string) => {
    const has = wishlist.includes(productId);
    // Optimistic UI update.
    setWishlist((prev) => (has ? prev.filter((id) => id !== productId) : [...prev, productId]));

    if (user) {
      if (has) {
        fetch(`/api/wishlist?userId=${user.id}&productId=${productId}`, { method: 'DELETE' }).catch(() => {});
      } else {
        fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, productId }),
        }).catch(() => {});
      }
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isWishlisted, toggleWishlist, count: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
