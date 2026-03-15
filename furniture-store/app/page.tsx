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
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-main)' }}>
      <main style={{ flex: 1, padding: '20px' }}>
        <div className="container">
          {/* Central Island Hero */}
          <div className="monolithic-island position-relative">
            <div className="row align-items-stretch">
              {/* Left Column (Text & CTAs) */}
              <div className="col-lg-5 d-flex flex-column justify-content-center" style={{ paddingRight: isRtl ? '15px' : '40px', paddingLeft: isRtl ? '40px' : '15px' }}>
                <span className="section-kicker mb-3" style={{ fontSize: '1rem', letterSpacing: '2px', color: 'var(--text-main)', opacity: 0.8 }}>
                  {isRtl ? 'تصميم حصري' : 'EXCLUSIVE DESIGN'}
                </span>
                <h1 className="smartwood-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '20px', lineHeight: 1.1 }}>
                  {isRtl ? 'ملاذك الداخلي' : 'Your Indoor Sanctuary'}
                </h1>
                <p className="smartwood-description" style={{ fontSize: '1.1rem', marginBottom: '40px', color: 'var(--text-soft)' }}>
                  {isRtl ? 'اكتشف مجموعتنا المختارة بعناية من القطع المصممة لتحقيق الانسجام والفخامة في منزلك.' : 'Explore our curated selection of pieces designed to bring harmony and luxury to your home.'}
                </p>
                <div className="hero-main-actions d-flex gap-3">
                  <a href="/shop" className="hero-primary-btn" style={{ minHeight: '48px', padding: '0 24px', borderRadius: '8px' }}>
                    {t('exploreCollections')}
                  </a>
                  <a href="/about" className="hero-secondary-btn" style={{ minHeight: '48px', padding: '0 24px', borderRadius: '8px', border: '1px solid var(--text-main)' }}>
                    {t('ourCraft')}
                  </a>
                </div>
              </div>
              
              {/* Right Floating Image inside Island */}
              <div className="col-lg-7 mt-5 mt-lg-0">
                <div style={{ height: '100%', minHeight: '500px', borderRadius: '24px', overflow: 'hidden', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                  <img 
                    src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80" 
                    alt={isRtl ? 'غرفة معيشة فاخرة' : 'Luxury Living Room'} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, rgba(13,26,99,0.2) 0%, transparent 100%)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Basic Contact / Social Footer */}
      <footer style={{ background: 'var(--bg-panel)', padding: '40px 0', borderTop: '1px solid var(--line-soft)', marginTop: 'auto' }}>
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div style={{ color: 'var(--text-soft)' }}>
            &copy; {new Date().getFullYear()} {isRtl ? 'سمارت وود. جميع الحقوق محفوظة.' : 'Smartwood. All rights reserved.'}
          </div>
          <div className="d-flex gap-4">
            <a href="#" style={{ color: 'var(--text-main)', fontSize: '1.2rem' }}><i className="bi bi-instagram"></i></a>
            <a href="#" style={{ color: 'var(--text-main)', fontSize: '1.2rem' }}><i className="bi bi-twitter-x"></i></a>
            <a href="#" style={{ color: 'var(--text-main)', fontSize: '1.2rem' }}><i className="bi bi-facebook"></i></a>
            <a href="#" style={{ color: 'var(--text-main)', fontSize: '1.2rem' }}><i className="bi bi-envelope"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
