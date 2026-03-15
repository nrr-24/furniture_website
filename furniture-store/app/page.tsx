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
    <div dir={isRtl ? 'rtl' : 'ltr'} className="monolithic-island">
      <div className="lumiere-split">
        
        {/* Left Side: Copy, Gallery, Actions */}
        <div className="split-left">
          
          <div className="mini-gallery-strip">
            <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=300&q=80" alt="Detail 1" />
            <img src="https://images.unsplash.com/photo-1617104424032-b9bd6972d0e4?auto=format&fit=crop&w=300&q=80" alt="Detail 2" />
            <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=300&q=80" alt="Detail 3" />
          </div>

          <h1 className="smartwood-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: '16px' }}>
            {isRtl ? 'ملاذك الداخلي' : 'RIAD LUMIÈRE'}
            <br />
            <span style={{ fontWeight: 600 }}>{isRtl ? 'ماراكش' : 'MARRAKECH'}</span>
          </h1>
          
          <p className="smartwood-description" style={{ fontSize: '1.2rem', color: 'var(--text-soft)', marginBottom: '40px', maxWidth: '400px' }}>
            {isRtl ? 'ملاذك في قلب ماراكش' : 'Your Sanctuary in the Heart of Marrakech'}
          </p>
          
          <div className="hero-main-actions d-flex gap-3 mt-auto mb-auto">
            <a href="/shop" className="hero-primary-btn" style={{ padding: '16px 40px', background: 'rgba(255,255,255,0.7)', color: 'black', borderRadius: '12px' }}>
              {isRtl ? 'احجز إقامتك' : 'BOOK YOUR STAY'}
            </a>
          </div>

          <div style={{ marginTop: 'auto', opacity: 0.5, fontSize: '0.8rem', letterSpacing: '0.2em' }}>
            SCROLL DOWN
          </div>
        </div>

        {/* Right Side: Vast Edge Image */}
        <div className="split-right">
          <div className="split-right-img-container">
            <img 
              src="https://images.unsplash.com/photo-1538053457494-df720eb9db6f?auto=format&fit=crop&w=1200&q=80" 
              alt={isRtl ? 'الملاذ' : 'The Sanctuary'} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, rgba(0,0,0,0.3) 0%, transparent 100%)' }}></div>
            
            {/* Corner Text overlay inside the image */}
            <div style={{ position: 'absolute', bottom: '40px', left: '40px', color: 'rgba(255,255,255,0.9)' }}>
              <span style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>01 /</span>
              <h3 style={{ fontSize: '2rem', fontWeight: 300, margin: 0 }}>AUTHENTIC<br/>MOROCCAN</h3>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
