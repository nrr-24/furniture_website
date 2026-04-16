'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

  return (
    <main className="app-content" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. Hero Section (The First Impression) */}
      <section className="lumiere-split hero-viewport">
        {/* Left Side: Copy, Gallery, Actions */}
        <div className="split-left" style={{ justifyContent: 'center', alignItems: 'flex-start', textAlign: isRtl ? 'right' : 'left' }}>

          <h1 className="smartwood-title" style={{ fontSize: 'clamp(2.5rem, 4vw, 4.5rem)', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: '24px', lineHeight: 1.1 }}>
            <span className="text-showup" style={{ fontWeight: 800, animationDelay: '0.05s' }}>{isRtl ? 'سمارت وود:' : 'Smartwood:'}</span>
            <br />
            <span className="text-reveal" style={{ animationDelay: '0.2s' }}>
              <span className="text-slidein" style={{ animationDelay: '0.2s' }}>{isRtl ? 'حيث الطبيعة تلتقي بالدقة.' : 'Nature Meets Precision.'}</span>
            </span>
          </h1>

          <p className="smartwood-description animate-fade-up" style={{ fontSize: '1.2rem', color: 'var(--text-soft)', marginBottom: '40px', maxWidth: '600px', animationDelay: '0.5s' }}>
            {isRtl
              ? 'إعادة تعريف مفهوم النجارة الفاخرة في الكويت. نمزج بين الحرفية المتبكرة والتكنولوجيا المتقدمة لنبتكر تصاميم داخلية تعبر عن قصتك.'
              : 'Redefining luxury woodworking in Kuwait. We blend master craftsmanship with advanced technology to create bespoke interiors that tell your story.'}
          </p>

          <div className="hero-main-actions d-flex gap-3 animate-fade-up" style={{ animationDelay: '0.7s' }}>
            <Link href="/shop" className="hero-primary-btn" style={{ padding: '16px 40px', background: 'var(--text-main)', color: 'var(--bg-main)', borderRadius: '12px', textDecoration: 'none' }}>
              {isRtl ? 'استكشف الفن' : 'Explore the Art'}
            </Link>
            <Link href="/contact" className="hero-secondary-btn" style={{ padding: '16px 40px', borderRadius: '12px', textDecoration: 'none' }}>
              {isRtl ? 'تواصل معنا' : 'Connect with Us'}
            </Link>
          </div>

        </div>

        {/* Right Side: Vast Edge Image */}
        <div className="split-right">
          <div className="split-right-img-container reveal-container">
            <img
              src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/BEEZ.jpg"
              alt={isRtl ? 'أثاث فاخر' : 'Luxury Furniture'}
              className="reveal-inner-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, rgba(0,0,0,0.3) 0%, transparent 100%)' }}></div>

            <div style={{ position: 'absolute', bottom: 'clamp(20px, 4vw, 40px)', left: 'clamp(20px, 4vw, 40px)', right: 'clamp(20px, 4vw, 40px)', color: 'rgba(255,255,255,0.9)' }}>
              <span style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>01 /</span>
              <h3 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 300, margin: 0 }}>{isRtl ? 'مجموعة بيز' : 'BEEZ COLLECTION'}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Exploding Scroll Gallery (The New Grid) */}
      <section className="exploding-gallery-container">
        <div className="sticky-wrapper">
          <ul className="exploding-grid">
            <li style={{ '--x1': 2, '--x2': 6, '--y1': 1, '--y2': 4 } as React.CSSProperties}>
              <img src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/16x9_0001_001.jpg" alt="" />
            </li>
            <li style={{ '--x1': 6, '--x2': 8, '--y1': 2, '--y2': 4 } as React.CSSProperties}>
              <img src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0028_005.jpg" alt="" />
            </li>
            <li style={{ '--x1': 1, '--x2': 4, '--y1': 4, '--y2': 7 } as React.CSSProperties}>
              <img src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/4x5_0002_014.jpg" alt="" />
            </li>
            <li style={{ '--x1': 4, '--x2': 7, '--y1': 4, '--y2': 7 } as React.CSSProperties}>
              <img src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0025_008.jpg" alt="" />
            </li>
            <li style={{ '--x1': 7, '--x2': 9, '--y1': 4, '--y2': 6 } as React.CSSProperties}>
              <img src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/9x16_0003_007.jpg" alt="" />
            </li>
            <li style={{ '--x1': 2, '--x2': 4, '--y1': 7, '--y2': 9 } as React.CSSProperties}>
              <img src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0007_026.jpg" alt="" />
            </li>
            <li style={{ '--x1': 4, '--x2': 7, '--y1': 7, '--y2': 10 } as React.CSSProperties}>
              <img src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/4x5_0004_012.jpg" alt="" />
            </li>
            <li style={{ '--x1': 7, '--x2': 10, '--y1': 6, '--y2': 9 } as React.CSSProperties}>
              <img src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/16x9_0000_002.jpg" alt="" />
            </li>

            {/* Extra images for increased density */}
            <li style={{ '--x1': 1, '--x2': 2, '--y1': 1, '--y2': 4 } as React.CSSProperties}>
              <img src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/9x16_0004_006.jpg" alt="" />
            </li>
            <li style={{ '--x1': 6, '--x2': 10, '--y1': 1, '--y2': 2 } as React.CSSProperties}>
              <img src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0004_029.jpg" alt="" />
            </li>
            <li style={{ '--x1': 8, '--x2': 10, '--y1': 2, '--y2': 6 } as React.CSSProperties}>
              <img src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/9x16_0006_004.jpg" alt="" />
            </li>
            <li style={{ '--x1': 1, '--x2': 2, '--y1': 7, '--y2': 10 } as React.CSSProperties}>
              <img src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/4x5_0006_010.jpg" alt="" />
            </li>
            <li style={{ '--x1': 2, '--x2': 4, '--y1': 9, '--y2': 10 } as React.CSSProperties}>
              <img src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0026_007.jpg" alt="" />
            </li>
            <li style={{ '--x1': 7, '--x2': 10, '--y1': 9, '--y2': 10 } as React.CSSProperties}>
              <img src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0009_024.jpg" alt="" />
            </li>
            <li style={{ '--x1': 1, '--x2': 2, '--y1': 4, '--y2': 7 } as React.CSSProperties}>
              <img src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/4x5_0003_013.jpg" alt="" />
            </li>
          </ul>
        </div>
      </section>

      <style jsx>{`
        .glider-track::-webkit-scrollbar { display: none; }
        .glider-track { -ms-overflow-style: none; scrollbar-width: none; }
        .glider-item:hover .glider-overlay { opacity: 1; }
        .glider-item { transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1); }
        .glider-item:hover { transform: scale(1.02); }
      `}</style>
    </main>
  );
}
