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
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      
      {/* 1. Hero Section (The First Impression) */}
      <section className="lumiere-split" style={{ flex: 1 }}>
        {/* Left Side: Copy, Gallery, Actions */}
        <div className="split-left" style={{ justifyContent: 'center', alignItems: 'flex-start', textAlign: isRtl ? 'right' : 'left' }}>

          <h1 className="smartwood-title" style={{ fontSize: 'clamp(2.5rem, 4vw, 4.5rem)', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: '24px', lineHeight: 1.1 }}>
            <span style={{ fontWeight: 800 }}>{isRtl ? 'سمارت وود:' : 'Smartwood:'}</span>
            <br />
            {isRtl ? 'حيث تلتقي أناقة الطبيعة بأحدث تقنيات الدقة.' : 'Where Nature’s Elegance Meets Cutting-Edge Precision.'}
          </h1>

          <p className="smartwood-description" style={{ fontSize: '1.2rem', color: 'var(--text-soft)', marginBottom: '40px', maxWidth: '600px' }}>
            {isRtl 
              ? 'إعادة تعريف مفهوم النجارة الفاخرة في الكويت. نمزج بين الحرفية المتقنة والتكنولوجيا المتقدمة لنبتكر تصاميم داخلية تعبر عن قصتك.' 
              : 'Redefining luxury woodworking in Kuwait. We blend master craftsmanship with advanced technology to create bespoke interiors that tell your story.'}
          </p>

          <div className="hero-main-actions d-flex gap-3">
            <a href="/shop" className="hero-primary-btn" style={{ padding: '16px 40px', background: 'var(--text-main)', color: 'var(--bg-main)', borderRadius: '12px' }}>
              {isRtl ? 'استكشف مجموعتنا' : 'Explore Our Collection'}
            </a>
            <a href="#contact" className="hero-secondary-btn" style={{ padding: '16px 40px', borderRadius: '12px' }}>
              {isRtl ? 'اطلب استشارة' : 'Request a Consultation'}
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

            <div style={{ position: 'absolute', bottom: '40px', left: '40px', color: 'rgba(255,255,255,0.9)' }}>
              <span style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>01 /</span>
              <h3 style={{ fontSize: '2rem', fontWeight: 300, margin: 0 }}>{isRtl ? 'تميز لا يضاهى' : 'BESPOKE LUXURY'}</h3>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
