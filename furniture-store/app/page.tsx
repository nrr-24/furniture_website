'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '../data/LanguageContext';
import { useAuth } from '../data/AuthContext';
import { useCart } from '../data/CartContext';
import { FurnitureItem, FALLBACK_IMAGE } from '../data/furnitureData';
import { useFurniture } from '../data/FurnitureContext';
import FurnitureManager from '../components/FurnitureManager';
import Footer from '../components/layout/Footer';

const HERO_BANNERS = [
  {
    id: 'beez',
    titleEn: 'BEEZ COLLECTION',
    titleAr: 'مجموعة بيز',
    image: 'https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/16x9_0000_002.jpg',
    mobileImage: 'https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/9x16_0003_007.jpg',
    link: '/shop'
  }
];

const HERO_HOTSPOTS = [
  {
    id: 'cnc',
    top: '45%',
    left: '75%',
    titleEn: 'Advanced CNC Precision',
    titleAr: 'دقة CNC المتقدمة',
    textEn: 'Fully automated machinery ensures 100% accuracy in every cut, carve, and finish.',
    textAr: 'آلات آلية بالكامل تضمن دقة 100٪ في كل قطع ونحت وتشطيب.',
    image: 'https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0003_030.jpg'
  },
  {
    id: 'materials',
    top: '20%',
    left: '50%',
    titleEn: 'Premium Sourcing',
    titleAr: 'مصادر مواد فاخرة',
    textEn: 'Sustainable woods tested to withstand the Gulf\'s unique climate.',
    textAr: 'خشب مستدام تم اختباره لتحمل مناخ الخليج الفريد.',
    image: 'https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0024_009.jpg'
  },
  {
    id: 'kuwait',
    top: '25%',
    left: '88%',
    titleEn: 'Made in Kuwait',
    titleAr: 'صُنع في الكويت',
    textEn: 'A national brand committed to local excellence and superior support.',
    textAr: 'علامة وطنية تلتزم بالتميز المحلي ودعم أفضل لعملائنا.',
  }
];




/**
 * Column-based responsive image grid for the homepage hero's right aside.
 * Pattern adapted from https://www.w3schools.com/howto/howto_css_image_grid_responsive.asp —
 * each outer array is a column; nested items stack top-to-bottom, with per-item
 * flex weights below producing varied sizing.
 */
const HERO_GRID_COLUMNS: { src: string }[][] = [
  [
    { src: 'https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0028_005.jpg' },
    { src: 'https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/4x5_0002_014.jpg' },
  ],
  [
    { src: 'https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/9x16_0003_007.jpg' },
    { src: 'https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/16x9_0001_001.jpg' },
    { src: 'https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0025_008.jpg' },
  ],
  [
    { src: 'https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/4x5_0004_012.jpg' },
    { src: 'https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/16x9_0000_002.jpg' },
  ],
];

export default function HomePage() {
  const { t, isRtl } = useLanguage();
  const { isAdmin, isCustomer } = useAuth();
  const { addToCart } = useCart();
  const { items, initialized } = useFurniture();
  const [showManager, setShowManager] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);

  const currentHero = HERO_BANNERS[0]; // Easily swap index or find by ID

  const sliderRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic for slider
  useEffect(() => {
    if (!sliderRef.current) return;
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        // If we are at the end, scroll to beginning safely, else scroll by one item width
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          sliderRef.current.scrollBy({ left: 350, behavior: 'smooth' });
        }
      }
    }, 2000); // Trigger every 2s
    return () => clearInterval(interval);
  }, []);

  if (!initialized) return null;

  return (
    <main className="app-content" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. Hero Section (The First Impression) */}
      <section className="hero-viewport home-hero">
        {/* Background Layer with entrance animation */}
        <div className="hero-bg-static">
          <picture>
            <img src={currentHero.image} alt="" />
          </picture>
        </div>

        {/* Hotspots for Desktop */}
        <div className="hero-hotspots-container">
          {HERO_HOTSPOTS.map((spot) => (
            <div
              key={spot.id}
              className="hero-hotspot"
              style={{ top: spot.top, left: spot.left }}
            >
              <div className="hotspot-trigger">
                <div className="hotspot-dot" />
                <div className="hotspot-pulse" />
              </div>
              <div className="hotspot-tooltip">
                <div className="tooltip-content">
                  {spot.image && (
                    <div className="tooltip-img">
                      <img src={spot.image} alt="" />
                    </div>
                  )}
                  <div className="tooltip-text">
                    <h4>{isRtl ? spot.titleAr : spot.titleEn}</h4>
                    <p>{isRtl ? spot.textAr : spot.textEn}</p>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        <div className="home-hero-content">
          {/* Left Side: Copy, Gallery, Actions */}
          <div className="split-left">

            <h1 style={{ fontWeight: 800, fontSize: 'clamp(2.5rem, 8vw, 4rem)', letterSpacing: 'normal', lineHeight: 1.1, textAlign: 'left' }}>
              <span style={{ fontWeight: 800 }}>
                {isRtl ? 'سمارت وود:' : 'Smartwood:'}
              </span>
              <br />
              <span>
                {isRtl ? 'حيث الطبيعة تلتقي بالدقة.' : 'Nature Meets Precision.'}
              </span>
            </h1>

            <div className="hero-main-content-fade-in">
              <p className="smartwood-description" style={{ textAlign: 'left', lineHeight: 1.6, marginInline: '0' }}>
                {isRtl
                  ? 'إعادة تعريف مفهوم النجارة الفاخرة في الكويت. تصاميم داخلية تعبر عن قصتك.'
                  : 'Redefining luxury woodworking in Kuwait. Bespoke interiors that tell your story.'}
              </p>

              <div className="hero-main-actions" style={{ marginBottom: '40px' }}>
                <Link href="/shop" className="hero-primary-btn" style={{ textDecoration: 'none' }}>
                  {isRtl ? 'استكشف الفن' : 'Explore the Art'}
                </Link>
                <Link href="/contact" className="hero-secondary-btn" style={{ textDecoration: 'none' }}>
                  {isRtl ? 'تواصل معنا' : 'Connect with Us'}
                </Link>
              </div>

              {/* Persistent Feature Box - Dynamic First Product */}
              {items && items.length > 0 && (
                <Link href={`/shop/product/${items[0].id}`} className="hero-feature-box" style={{ textDecoration: 'none' }}>
                  <div className="feature-box-content">
                    <div className="feature-box-img">
                      <img src={items[0].image || FALLBACK_IMAGE} alt={isRtl ? items[0].nameAr : items[0].name} />
                    </div>
                    <div className="feature-box-text">
                      <h4>{isRtl ? items[0].nameAr : items[0].name}</h4>
                      <p style={{ wordSpacing: '0.15em' }}>{isRtl ? items[0].descriptionAr : items[0].description}</p>
                    </div>
                  </div>
                </Link>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 2. Horizontal Scroll Gallery (The New Slider) */}
      <section className="horizontal-slider-section">
        <div className="slider-header">
          <span className="section-kicker">{isRtl ? 'تصاميمنا المذهلة' : 'Our Stunning Designs'}</span>
          <h2 className="section-title">{isRtl ? 'معرض الصور' : 'Gallery Experience'}</h2>
        </div>
        <div className="slider-track" ref={sliderRef} style={{ scrollBehavior: 'smooth' }}>
          {[
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/16x9_0001_001.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0028_005.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/4x5_0002_014.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0025_008.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/9x16_0003_007.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0007_026.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/4x5_0004_012.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/16x9_0000_002.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0029_004.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0031_002.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0032_001.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/4x5_0000_016.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/4x5_0003_013.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/4x5_0005_011.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/4x5_0006_010.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/4x5_0012_004.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/4x5_0013_003.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/9x16_0000_010.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/9x16_0001_009.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/9x16_0002_008.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/9x16_0004_006.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/9x16_0006_004.jpg", link: "/shop" },
            { src: "https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/9x16_0007_003.jpg", link: "/shop" }
          ].map((item, i) => (
            <div key={i} className="slider-item">
              <Link href={item.link} style={{ display: 'block', width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 10 }} aria-label="View product" />
              <img src={item.src} alt="" loading="lazy" />
              <div className="slider-overlay" />
            </div>
          ))}
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
