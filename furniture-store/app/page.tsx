'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../data/LanguageContext';
import { useAuth } from '../data/AuthContext';
import { useCart } from '../data/CartContext';
import { FurnitureItem } from '../data/furnitureData';
import { useFurniture } from '../data/FurnitureContext';
import FurnitureManager from '../components/FurnitureManager';
import Footer from '../components/layout/Footer';

export default function HomePage() {
  const { t, isRtl } = useLanguage();
  const { isAdmin, isCustomer } = useAuth();
  const { addToCart } = useCart();
  const { items, initialized } = useFurniture();
  const [showManager, setShowManager] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);

  const heroPart1 = isRtl ? 'سمارت وود:' : 'Smartwood:';
  const heroPart2 = isRtl ? 'حيث الطبيعة تلتقي بالدقة.' : 'Nature Meets Precision.';
  const heroTotal = heroPart1.length + heroPart2.length;
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    setTyped(0);
    const id = setInterval(() => {
      setTyped(c => {
        if (c + 1 >= heroTotal) {
          clearInterval(id);
          return heroTotal;
        }
        return c + 1;
      });
    }, 70);
    return () => clearInterval(id);
  }, [heroTotal]);

  if (!initialized) return null;

  const shown1 = heroPart1.slice(0, Math.min(typed, heroPart1.length));
  const shown2 = heroPart2.slice(0, Math.max(0, typed - heroPart1.length));
  const part1Done = typed >= heroPart1.length;
  const typing = typed < heroTotal;

  return (
    <main className="app-content" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. Hero Section (The First Impression) */}
      <section className="lumiere-split hero-viewport home-hero">
        {/* Left Side: Copy, Gallery, Actions */}
        <div className="split-left" style={{ justifyContent: 'center', alignItems: 'flex-start', textAlign: 'left' }}>

          <h1 style={{ fontSize: 'clamp(2.5rem, 4.5vw, 4.8rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 24px', lineHeight: 1, textAlign: 'left', minHeight: '2.2em' }}>
            <span style={{ fontWeight: 800 }}>
              {shown1}
              {!part1Done && typing && <span className="type-cursor" aria-hidden="true" />}
            </span>
            {part1Done && <br />}
            {part1Done && (
              <span>
                {shown2}
                {typing && <span className="type-cursor" aria-hidden="true" />}
              </span>
            )}
          </h1>

          <p className="smartwood-description animate-fade-up" style={{ fontSize: '1.1rem', marginBottom: '36px', maxWidth: '540px', animationDelay: '0.5s', textAlign: 'left', lineHeight: 1.55 }}>
            {isRtl
              ? 'إعادة تعريف مفهوم النجارة الفاخرة في الكويت. نمزج بين الحرفية المتبكرة والتكنولوجيا المتقدمة لنبتكر تصاميم داخلية تعبر عن قصتك.'
              : 'Redefining luxury woodworking in Kuwait. We blend master craftsmanship with advanced technology to create bespoke interiors that tell your story.'}
          </p>

          <div className="hero-main-actions d-flex gap-3 animate-fade-up" style={{ animationDelay: '0.7s', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
            <Link href="/shop" className="hero-primary-btn" style={{ textDecoration: 'none' }}>
              {isRtl ? 'استكشف الفن' : 'Explore the Art'}
            </Link>
            <Link href="/contact" className="hero-secondary-btn" style={{ textDecoration: 'none' }}>
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
              className="reveal-inner-img desktop-hero-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            />
            <img
              src="/images/home/hero-mobile.png"
              alt={isRtl ? 'داخلية سمارت وود' : 'Smartwood interior'}
              className="mobile-hero-img"
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

      {/* 3. More Perspectives — Editorial 3-Column Layout */}
      <section className="home-perspectives">
        <div className="home-perspectives-header">
          <h2 className="section-title home-perspectives-title">
            {isRtl ? 'وجهات نظر أخرى' : 'More Perspectives'}
          </h2>
        </div>

        <div className="home-perspectives-grid">
          {/* Column 1 (LEFT, offset DOWN): card top, image bottom — warm wood tones */}
          <Link href="/shop" className="perspective-col perspective-col-down perspective-wood">
            <div className="perspective-card">
              <h3>{isRtl ? 'الخشب الدافئ' : 'Warm Wood Craft'}</h3>
              <p>
                {isRtl
                  ? 'مساحات يجتمع فيها الجوز المصنوع يدوياً والتفاصيل الدقيقة. قطع تحمل دفء الطبيعة إلى كل زاوية.'
                  : 'Spaces where hand-finished walnut meets subtle joinery. Warm, tactile pieces made to anchor your living rooms and libraries.'}
              </p>
              <span className="perspective-cta">
                {isRtl ? 'استكشف المساحات' : 'Explore Living Spaces'}
                <i className={isRtl ? 'bi bi-arrow-left' : 'bi bi-arrow-right'}></i>
              </span>
            </div>
            <div className="perspective-img">
              <img src="/images/home/perspective-1-wood.png" alt={isRtl ? 'مساحة معيشة خشبية' : 'Warm wood living space'} />
            </div>
          </Link>

          {/* Column 2 (MIDDLE, stays UP): image top, card bottom — cream focal */}
          <Link href="/shop" className="perspective-col perspective-col-up perspective-cream">
            <div className="perspective-img">
              <img src="/images/home/perspective-2-beige.png" alt={isRtl ? 'تصميم أنيق' : 'Timeless elegance'} />
            </div>
            <div className="perspective-card">
              <h3>{isRtl ? 'تبحث عن أناقة خالدة؟' : 'Looking for Timeless Elegance?'}</h3>
              <p>
                {isRtl
                  ? 'اكتشف مجموعتنا الكاملة — تصاميم مصنوعة لتضفي الجمال والوظيفة على أي مساحة.'
                  : 'Explore our full range of furniture, crafted to bring beauty and functionality to any space.'}
              </p>
              <span className="perspective-cta">
                {isRtl ? 'استكشف المجموعات' : 'Explore Collections'}
                <i className={isRtl ? 'bi bi-arrow-left' : 'bi bi-arrow-right'}></i>
              </span>
            </div>
          </Link>

          {/* Column 3 (RIGHT, offset DOWN): card top, image bottom — cool slate */}
          <Link href="/about" className="perspective-col perspective-col-down perspective-slate">
            <div className="perspective-card">
              <h3>{isRtl ? 'دقة بلا حدود' : 'Precision, Refined'}</h3>
              <p>
                {isRtl
                  ? 'آلات CNC المتقدمة تلتقي بتفاصيل دقيقة. كل حافة، كل مفصلة، محسوبة بدقّة الميليمتر.'
                  : 'Advanced CNC machinery meets obsessive detail. Every edge, every fitting, engineered to the millimeter.'}
              </p>
              <span className="perspective-cta">
                {isRtl ? 'اكتشف الحرفية' : 'See the Craftsmanship'}
                <i className={isRtl ? 'bi bi-arrow-left' : 'bi bi-arrow-right'}></i>
              </span>
            </div>
            <div className="perspective-img">
              <img src="/images/home/perspective-3-slate.png" alt={isRtl ? 'دقة الحرفية' : 'Precision craft'} />
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Full-bleed Craftsmanship Feature */}
      <section className="home-feature">
        <img className="home-feature-img" src="/images/home/feature-wide.png" alt={isRtl ? 'حرفية سمارت وود' : 'Smartwood craftsmanship'} />
        <div className="home-feature-overlay" />
        <div className="home-feature-content">
          <span className="section-kicker home-feature-kicker">
            {isRtl ? 'من التصميم إلى التنفيذ' : 'From Concept to Completion'}
          </span>
          <h2 className="home-feature-title">
            {isRtl ? (
              <>حرفيّة<br />تُصنع بالدقّة<span className="home-feature-dot">.</span></>
            ) : (
              <>Craftsmanship,<br />Engineered to Last<span className="home-feature-dot">.</span></>
            )}
          </h2>
          <p className="home-feature-text">
            {isRtl
              ? 'آلات CNC المتقدمة، نظام Odoo الذكي، وأيدي حرفيين كويتيين — كل قطعة رحلة من التصميم الرقمي إلى التركيب النهائي في منزلك.'
              : 'Advanced CNC machinery, the Odoo workflow system, and master Kuwaiti craftsmen — every piece is a journey from digital design to final installation in your home.'}
          </p>
          <Link href="/about" className="home-feature-btn">
            {isRtl ? 'اكتشف الحرفية' : 'See the Craftsmanship'}
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </section>

      <Footer />

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
