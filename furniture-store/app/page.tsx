'use client';

import React, { useState } from 'react';
import { useLanguage } from '../data/LanguageContext';
import { useAuth } from '../data/AuthContext';
import { useCart } from '../data/CartContext';
import { FurnitureItem } from '../data/furnitureData';
import { useFurniture } from '../data/FurnitureContext';
import FurnitureManager from '../components/FurnitureManager';

export default function HomePage() {
  const { t, isRtl } = useLanguage();
  const { isAdmin, isCustomer } = useAuth();
  const { addToCart } = useCart();
  const { items, initialized } = useFurniture();
  const [showManager, setShowManager] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);

  if (!initialized) return null;

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const categories = Object.keys(groupedItems);

  const handleScrollToCategory = (categoryId: string) => {
    const el = document.getElementById(`category-${categoryId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} className="lumiere-split" style={{ flex: 1, minHeight: 0 }}>
        {/* Left Side: Copy, Gallery, Actions */}
        <div className="split-left">
          
          <div className="mini-gallery-strip">
            <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80" alt="Detail 1" />
            <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=300&q=80" alt="Detail 2" />
            <img src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=300&q=80" alt="Detail 3" />
          </div>

          <h1 className="smartwood-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: '16px' }}>
            <span style={{ fontWeight: 600 }}>{isRtl ? 'سمارت وود' : 'SMARTWOOD'}</span>
          </h1>
          
          <p className="smartwood-description" style={{ fontSize: '1.2rem', color: 'var(--text-soft)', marginBottom: '40px', maxWidth: '400px' }}>
            {isRtl ? 'حيث تلتقي الحرفية بالأناقة العصرية' : 'Where Craftsmanship Meets Modern Elegance'}
          </p>
          
          <div className="hero-main-actions d-flex gap-3 mt-auto mb-auto">
            <a href="/shop" className="hero-primary-btn" style={{ padding: '16px 40px', background: 'rgba(255,255,255,0.7)', color: 'black', borderRadius: '12px' }}>
              {isRtl ? 'احجز إقامتك' : 'BOOK YOUR STAY'}
            </a>
          </div>

        </div>

        {/* Right Side: Vast Edge Image */}
        <div className="split-right">
          <div className="split-right-img-container">
            <img 
              src="https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80" 
              alt={isRtl ? 'أثاث فاخر' : 'Luxury Furniture'} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, rgba(0,0,0,0.3) 0%, transparent 100%)' }}></div>
            
            {/* Corner Text overlay inside the image */}
            <div style={{ position: 'absolute', bottom: '40px', left: '40px', color: 'rgba(255,255,255,0.9)' }}>
              <span style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>01 /</span>
              <h3 style={{ fontSize: '2rem', fontWeight: 300, margin: 0 }}>BESPOKE<br/>COLLECTION</h3>
            </div>
          </div>
        </div>

    </main>
  );
}
