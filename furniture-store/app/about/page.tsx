'use client';

import Link from 'next/link';
import React, { useMemo } from 'react';
import { useLanguage } from '../../data/LanguageContext';
import { useFurniture } from '../../data/FurnitureContext';
import { FALLBACK_IMAGE } from '../../data/furnitureData';
import Footer from '../../components/layout/Footer';

/* ============================================================
 * Craftsmanship Page (SmartWood Mockup Redesign)
 *
 * Scoped under .about-2026 for pixel-perfect cream + espresso styling
 * that matches the premium visual mockup exactly:
 *   1. Hero — Walnut backdrop niche left with overlays & glass card, dark panel right with sunburst
 *   2. Excellence in Every Detail — Left hinge/joinery cards, right text + 3 icons
 *   3. Designed for Living — 3-card category grid (Walk-in Wardrobe, Dining, Bedrooms)
 *   4. Proudly Kuwaiti — Heritage banner with workshop floor & 26+ badge
 *   5. Compare Our Models — Spec comparison table with active column highlight
 *   6. SmartWood Collection — 4 product cards (Custom Station, Wardrobe, Hinge, Sensor Light)
 * ============================================================ */

export default function CraftsmanshipPage() {
  const { isRtl, language } = useLanguage();
  const { items, initialized } = useFurniture();
  const featuredProduct = useMemo(() => items[0] || null, [items]);
  const arrow = isRtl ? 'bi-arrow-left' : 'bi-arrow-right';

  return (
    <main className="app-content about-2026" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* === 1. Hero =========================================== */}
      <section className="av-hero-mockup">
        {/* Left Side: Walnut Niche Photo & Interactive Floating Badges */}
        <div className="av-hero-left">
          <img 
            src="/images/home/hero-niche.png" 
            alt={isRtl ? 'حرفية سمارت وود' : 'SmartWood Craftsmanship'} 
            className="hero-bg-img"
          />
          
          {/* Overlays (Two-line badges) */}
          <div className="hero-overlay-badge badge-wood animate-fade-in">
            <div className="badge-icon-box">
              <i className="bi bi-tree"></i>
            </div>
            <div className="badge-text-box">
              <span className="badge-small-text">{isRtl ? 'ممتاز' : 'Premium'}</span>
              <span className="badge-bold-text">{isRtl ? 'خشب ألماني' : 'German Wood'}</span>
            </div>
          </div>

          <div className="hero-overlay-badge badge-accessories animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="badge-icon-box">
              <i className="bi bi-gear"></i>
            </div>
            <div className="badge-text-box">
              <span className="badge-small-text">{isRtl ? 'ألماني ونمساوي' : 'German & Austrian'}</span>
              <span className="badge-bold-text">{isRtl ? 'إكسسوارات' : 'Accessories'}</span>
            </div>
          </div>
        </div>

        {/* Glassmorphic card — positioned absolutely inside hero section */}
        {featuredProduct && (
          <Link href={`/shop/product/${featuredProduct.id}`} className="hero-glass-card-link">
            <div className="hero-glass-card">
              <div className="hero-glass-img-container">
                <img 
                  src={featuredProduct.image || FALLBACK_IMAGE} 
                  alt={isRtl ? featuredProduct.nameAr || featuredProduct.name : featuredProduct.name} 
                  className="hero-glass-img"
                />
              </div>
              <div className="hero-glass-info">
                <span className="hero-glass-title">
                  {isRtl ? (
                    <>{featuredProduct.nameAr || featuredProduct.name}</>
                  ) : (
                    <>{featuredProduct.name}</>
                  )}
                </span>
                <div className="hero-glass-price-wrap">
                  <span className="hero-glass-price">{isRtl ? `${featuredProduct.price} د.ك` : `${featuredProduct.price} KWD`}</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Right Side: Dark Walnut Copy Panel */}
        <div className="av-hero-right">
          <div className="av-hero-right-content">
            <h1 className="av-hero-title">
              {isRtl ? (
                <>صُنع ليدوم.<br />خُلق ليلهم.</>
              ) : (
                <>Built to last.<br />Made to inspire.</>
              )}
            </h1>
            <p className="av-hero-sub">
              {isRtl
                ? 'مصنع سمارت وود هو رائد في الكويت في صناعة الأثاث الفاخر منذ أكثر من ٢٦ سنة.'
                : 'SmartWood factory has been a leader in the Kuwaiti high-end furniture for more than 26 years.'}
            </p>
          </div>

          {/* Signature — simple italic font text */}
          <span className="hero-signature-text">SmartWood</span>
        </div>
      </section>

      {/* === 2. Excellence in Every Detail ===================== */}
      <section className="av-excellence">
        <h2 className="av-excellence-title">
          {isRtl ? 'التميز في كل تفصيل' : 'Excellence in Every Detail'}
        </h2>

        <div className="av-excellence-inner">
          {/* Left Column: Visual Hardware & Joinery Cards */}
          <div className="av-excellence-cards">
          <div className="av-excel-card">
            <img 
              src="/images/home/hardware.png" 
              alt={isRtl ? 'إكسسوارات ألمانية دقيقة' : 'German Precision Hardware'} 
              className="av-excel-img"
            />
            <div className="av-excel-info">
              <h3 className="av-excel-title">
                {isRtl ? 'إكسسوارات ألمانية دقيقة' : 'Precision German Hardware'}
              </h3>
              <p className="av-excel-text">
                {isRtl
                  ? 'مصممة خصيصاً لأداء سلس واعتمادية طويلة الأمد.'
                  : 'Engineered for smooth performance and lasting reliability.'}
              </p>
            </div>
          </div>

          <div className="av-excel-card">
            <img 
              src="/images/home/perspective-1-wood.png" 
              alt={isRtl ? 'تجميع خشب احترافي' : 'Masterful Wood Joinery'} 
              className="av-excel-img"
            />
            <div className="av-excel-info">
              <h3 className="av-excel-title">
                {isRtl ? 'تجميع خشب احترافي' : 'Masterful Wood Joinery'}
              </h3>
              <p className="av-excel-text">
                {isRtl
                  ? 'مصنوعة بدقة متناهية، ومصممة لتتحمل اختبار الزمن.'
                  : 'Built with precision, designed to endure.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Copy & Core Feature Pillars */}
        <div className="av-excellence-copy">
          <p style={{ color: 'var(--text-soft)', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 16px 0' }}>
            {isRtl
              ? 'نحن نستخدم أخشاب ألمانية عالية الجودة، وأحدث الحلول، وإكسسوارات ألمانية ونمساوية فاخرة.'
              : 'We use high quality German wood, latest techniques and solutions, and premium German & Austrian accessories.'}
          </p>
          <p style={{ color: 'var(--text-soft)', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            {isRtl
              ? 'كل قطعة تُصنع بدقة متناهية في مصانعنا لتناسب ذوقك الرفيع وتدوم لأجيال.'
              : 'Every piece is crafted with precision, built to last for generations.'}
          </p>

          <div className="av-excellence-features">
            <div className="av-excel-feat">
              <i className="bi bi-tree"></i>
              <span>{isRtl ? 'خشب ألماني' : 'German Wood'}</span>
            </div>
            <div className="av-excel-feat">
              <i className="bi bi-gear"></i>
              <span>{isRtl ? 'إكسسوارات ألمانية ونمساوية' : 'German & Austrian Accessories'}</span>
            </div>
            <div className="av-excel-feat">
              <i className="bi bi-diagram-3"></i>
              <span>{isRtl ? 'أحدث التقنيات' : 'Latest Techniques'}</span>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* === 3. Designed for Living. Crafted for Life. ========= */}
      <section className="av-living">
        <h2 className="av-section-title-centered">
          {isRtl ? 'مُصمم للمعيشة. مصنوع للحياة.' : 'Designed for Living. Crafted for Life.'}
        </h2>
        
        <div className="av-living-grid">
          <Link href="/shop" className="av-living-tile">
            <img src="/images/home/living-wardrobes.png" alt={isRtl ? 'خزانة ملابس مدمجة' : 'Walk-in Wardrobe'} />
            <span className="av-living-label">{isRtl ? 'خزانة ملابس مدمجة' : 'Walk-in Wardrobe'}</span>
          </Link>

          <Link href="/shop" className="av-living-tile">
            <img src="/images/home/cat-dining.png" alt={isRtl ? 'طاولات الطعام' : 'Dining Sets'} />
            <span className="av-living-label">{isRtl ? 'طاولات الطعام' : 'Dining Sets'}</span>
          </Link>

          <Link href="/shop" className="av-living-tile">
            <img src="/images/home/living-bedrooms.png" alt={isRtl ? 'غرف النوم' : 'Bedrooms'} />
            <span className="av-living-label">{isRtl ? 'غرف النوم' : 'Bedrooms'}</span>
          </Link>
        </div>
      </section>

      {/* === 4. Proudly Kuwaiti Banner ========================= */}
      <section className="av-heritage">
        <img className="av-heritage-bg" src="/images/home/feature-wide.png" alt="" aria-hidden="true" />
        <div className="av-heritage-scrim" aria-hidden="true" />
        <div className="av-heritage-inner">
          <div className="av-heritage-copy">
            <span className="section-kicker av-heritage-kicker" style={{ color: '#fff', opacity: 0.8 }}>EST. 1998</span>
            <h2 className="av-heritage-title">
              {isRtl ? (<>كويتيون بفخر.<br />ملهمون عالمياً.</>) : (<>Proudly Kuwaiti.<br />Globally Inspired.</>)}
            </h2>
            <p className="av-heritage-body">
              {isRtl
                ? 'مصنع سمارت وود هو مصنع كويتي رائد يلتزم بأعلى معايير الحرفية والجودة العالمية.'
                : 'SmartWood factory has been a leader in the Kuwaiti high-end furniture for more than 26 years.'}
            </p>
            <Link href="/contact" className="av-link-arrow av-link-arrow-light" style={{ color: '#fff', borderColor: '#fff' }}>
              <span>{isRtl ? 'تواصل معنا' : 'Get in Touch'}</span>
              <i className={`bi ${arrow}`}></i>
            </Link>
          </div>
          <div className="av-heritage-badge" aria-hidden="true">
            <span className="av-heritage-badge-top">{isRtl ? 'سنوات من' : 'YEARS OF'}</span>
            <span className="av-heritage-badge-num">26+</span>
            <span className="av-heritage-badge-bot">{isRtl ? 'التميز' : 'EXCELLENCE'}</span>
          </div>
        </div>
      </section>

      {/* === 5. Compare Our Models ============================= */}
      <section className="av-compare">
        <h2 className="av-section-title-centered">
          {isRtl ? 'قارن بين موديلاتنا' : 'Compare Our Models'}
        </h2>
        
        <div className="av-compare-table-wrap">
          <table className="av-compare-table">
            <thead>
              <tr>
                <th style={{ background: 'var(--surface-soft)' }} />
                <th className="av-compare-col-active">{isRtl ? 'محطة مخصصة (Q12)' : 'Custom Station (Q12)'}</th>
                <th>{isRtl ? 'خزانة ملابس (Q10)' : 'Wardrobe (Q10)'}</th>
                <th>{isRtl ? 'طاولة تجميل (Q15)' : 'Vanity (Q15)'}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>{isRtl ? 'نوع الخشب' : 'Wood Finish'}</th>
                <td className="av-compare-col-active">{isRtl ? '٣ أقدام مربعة' : '3 sq ft'}</td>
                <td>{isRtl ? 'تشطيب يورجيد' : 'Eurged Finish'}</td>
                <td>{isRtl ? 'تشطيب خشبي' : 'Wood Finish'}</td>
              </tr>
              <tr>
                <th>{isRtl ? 'التغطية' : 'Coverage'}</th>
                <td className="av-compare-col-active">{isRtl ? 'فلتر HEPA' : 'HEPA Filter'}</td>
                <td>{isRtl ? 'فلتر' : 'Filter'}</td>
                <td>{isRtl ? 'محرك' : 'Motor'}</td>
              </tr>
              <tr>
                <th>{isRtl ? 'الضمان' : 'Warranty'}</th>
                <td className="av-compare-col-active">22dB</td>
                <td>40dB</td>
                <td>80dB</td>
              </tr>
              <tr>
                <th>{isRtl ? 'نوع الإكسسوارات' : 'Hardware Type'}</th>
                <td className="av-compare-col-active">{isRtl ? 'متوافق' : 'Fits'}</td>
                <td>{isRtl ? 'متوافق' : 'Fits'}</td>
                <td>{isRtl ? 'متوافق' : 'Fits'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* === 6. SmartWood Collection =========================== */}
      <section className="av-collection">
        <h2 className="av-section-title-centered">
          {isRtl ? 'مجموعة سمارت وود' : 'SmartWood Collection'}
        </h2>

        <div className="av-collection-grid">
          {items.slice(0, 4).map((product) => (
            <Link
              key={product.id}
              href={`/shop/product/${product.id}`}
              className="av-product-card"
            >
              <div className="av-product-img">
                <img
                  src={product.image || FALLBACK_IMAGE}
                  alt={isRtl ? (product.nameAr || product.name) : product.name}
                />
              </div>
              <div className="av-product-meta">
                <h3 className="av-product-name">
                  {isRtl ? (product.nameAr || product.name) : product.name}
                </h3>
                <p className="av-product-price">
                  {product.price}
                  <span>{isRtl ? ' د.ك' : ' KWD'}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
