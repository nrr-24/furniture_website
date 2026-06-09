'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../data/LanguageContext';
import { FurnitureItem, FALLBACK_IMAGE } from '../data/furnitureData';
import { useFurniture } from '../data/FurnitureContext';
import { HOME_ASSETS, LIVING_TILES } from '../data/homeAssets';
import Footer from '../components/layout/Footer';

/* ============================================================
 * Homepage (Smartwood 2026 redesign)
 *
 * Sections, top→bottom:
 *   1. Hero — split editorial layout (image right, copy left)
 *   2. Feature strip — 4 inline icon+label items
 *   3. Excellence in Every Detail — 2-col with hardware closeup
 *   4. Designed for Living — 4-card category grid
 *   5. Proudly Kuwaiti — heritage banner with 26+ badge
 *   6. German Quality — 4-up feature row
 *   7. Quote card — "we craft legacy" pull quote (mobile-first surface)
 *   8. SmartWood Collection — 4 product cards from Supabase
 *   9. Mini benefit chips — Custom / Craftsmanship / Sustainable / Support
 *  10. Compare Our Models — desktop-only spec table
 *
 * Strings are inlined as `isRtl ? ar : en` for parity with the rest of
 * the codebase (centralized keys also exist in LanguageContext).
 * All image references live in data/homeAssets.ts — that's the single
 * place to swap placeholder photography for the real Smartwood shots.
 * ============================================================ */

// Pillar icons for the 4-up feature strip + "German Quality" row.
// Using Bootstrap Icons since the project already loads the font.
const FEATURE_PILLARS = [
  { key: 'years', icon: 'bi-patch-check', enLabel: '26+ Years of Excellence', arLabel: 'أكثر من 26 سنة من التميز' },
  { key: 'wood', icon: 'bi-tree', enLabel: 'German Wood', arLabel: 'خشب ألماني' },
  { key: 'accessories', icon: 'bi-bounding-box', enLabel: 'German & Austrian Accessories', arLabel: 'إكسسوارات ألمانية ونمساوية' },
  { key: 'techniques', icon: 'bi-diagram-3', enLabel: 'Latest Techniques', arLabel: 'أحدث التقنيات' },
];

const QUALITY_FEATURES = [
  {
    key: 'wood',
    icon: 'bi-tree',
    enTitle: 'Premium German Wood',
    arTitle: 'خشب ألماني فاخر',
    enText: 'Sourced for durability and natural beauty.',
    arText: 'مصدره مختار من أجل المتانة والجمال الطبيعي.',
  },
  {
    key: 'accessories',
    icon: 'bi-bounding-box',
    enTitle: 'German & Austrian Accessories',
    arTitle: 'إكسسوارات ألمانية ونمساوية',
    enText: 'Precision hardware for smooth performance.',
    arText: 'أجهزة دقيقة لأداء سلس.',
  },
  {
    key: 'techniques',
    icon: 'bi-diagram-3',
    enTitle: 'Advanced Techniques',
    arTitle: 'تقنيات متقدمة',
    enText: 'Latest technology for perfect finishes.',
    arText: 'أحدث التقنيات لتشطيب مثالي.',
  },
  {
    key: 'lasting',
    icon: 'bi-gear',
    enTitle: 'Built to Last',
    arTitle: 'بُني ليدوم',
    enText: 'Furniture that stands the test of time.',
    arText: 'أثاث يصمد أمام اختبار الزمن.',
  },
];

const MINI_BENEFITS = [
  { key: 'custom', icon: 'bi-pencil', enTitle: 'Custom Designs', arTitle: 'تصاميم مخصصة', enSub: 'Tailored to your space', arSub: 'مُصممة لمساحتك' },
  { key: 'craft', icon: 'bi-hammer', enTitle: 'Expert Craftsmanship', arTitle: 'حرفية متمرسة', enSub: 'Attention to every detail', arSub: 'اهتمام بكل تفصيل' },
  { key: 'sustain', icon: 'bi-leaf', enTitle: 'Sustainable Choice', arTitle: 'خيار مستدام', enSub: 'Responsibly sourced', arSub: 'مصدرها مسؤول' },
  { key: 'support', icon: 'bi-headset', enTitle: 'After Sales Support', arTitle: 'دعم ما بعد البيع', enSub: 'We care, always', arSub: 'نهتم بكم دائماً' },
];

// Compare-table specs are not (yet) modeled in the Supabase products table,
// so each visible column gets a stub block of attributes keyed by index.
// Phase 7 (or a follow-up DB migration) can replace this with real fields.
const COMPARE_SPECS = [
  { enKey: 'Wood Finish', arKey: 'نوع الخشب', vals: ['Walnut', 'Oak', 'Maple'] },
  { enKey: 'Coverage', arKey: 'التغطية', vals: ['Full', 'Standard', 'Standard'] },
  { enKey: 'Warranty', arKey: 'الضمان', vals: ['10 years', '5 years', '5 years'] },
  { enKey: 'Hardware', arKey: 'الإكسسوارات', vals: ['Blum', 'Hettich', 'Hettich'] },
];

export default function HomePage() {
  const { isRtl } = useLanguage();
  const { items, initialized } = useFurniture();

  if (!initialized) return null;

  // Top 4 items for the Collection grid; first 3 also feed the Compare table.
  const featuredItems: FurnitureItem[] = items.slice(0, 4);
  const compareItems: FurnitureItem[] = items.slice(0, 3);

  const arrow = isRtl ? 'bi-arrow-left' : 'bi-arrow-right';

  return (
    <main className="app-content home-2026" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* === 1. Hero =========================================== */}
      <section className="sw-hero">
        <div className="sw-hero-copy">
          <h1 className="sw-hero-title">
            {isRtl ? (
              <>
                صُنع ليدوم.
                <br />
                خُلق ليلهم.
              </>
            ) : (
              <>
                Built to last.
                <br />
                Made to inspire.
              </>
            )}
          </h1>
          <p className="sw-hero-body">
            {isRtl
              ? 'مصنع سمارت وود هو رائد في الكويت في صناعة الأثاث الفاخر منذ أكثر من 26 سنة.'
              : 'SmartWood factory has been a leader in the kuwaiti high-end furniture for more than 26 years.'}
          </p>
          <Link href="/about" className="sw-btn-outline">
            <span>{isRtl ? 'اكتشف الحرفية' : 'Discover Craftsmanship'}</span>
            <i className={`bi ${arrow}`}></i>
          </Link>
        </div>

        <div className="sw-hero-media" aria-hidden="true">
          <img src={HOME_ASSETS.hero.src} alt="" />
        </div>
      </section>

      {/* === 2. Feature strip ================================== */}
      <section className="sw-feature-strip">
        {FEATURE_PILLARS.map((p, idx) => (
          <div key={p.key} className="sw-feature-cell">
            <i className={`bi ${p.icon}`}></i>
            <span>{isRtl ? p.arLabel : p.enLabel}</span>
            {idx < FEATURE_PILLARS.length - 1 && <span className="sw-feature-divider" aria-hidden="true" />}
          </div>
        ))}
      </section>

      {/* === 3. Excellence in Every Detail ===================== */}
      <section className="sw-excellence">
        <div className="sw-excellence-copy">
          <span className="section-kicker">{isRtl ? 'وعدنا' : 'OUR PROMISE'}</span>
          <h2 className="sw-section-title">
            {isRtl ? 'تميّز في كل تفصيل' : (<>Excellence in<br />Every Detail</>)}
          </h2>
          <p className="sw-body">
            {isRtl
              ? 'نستخدم الخشب الألماني عالي الجودة وأحدث التقنيات والحلول، وإكسسوارات ألمانية ونمساوية فاخرة.'
              : 'We use high quality German wood, latest techniques and solutions, and premium German & Austrian accessories.'}
          </p>
          <p className="sw-body">
            {isRtl
              ? 'كل قطعة مصنوعة بدقة، مبنية لتدوم لأجيال.'
              : 'Every piece is crafted with precision, built to last for generations.'}
          </p>
          <Link href="/about" className="sw-link-arrow">
            <span>{isRtl ? 'اقرأ المزيد' : 'Learn More'}</span>
            <i className={`bi ${arrow}`}></i>
          </Link>
        </div>
        <div className="sw-excellence-media">
          <img src={HOME_ASSETS.hardware.src} alt={isRtl ? 'مفصلة ألمانية فاخرة' : 'Premium German hinge'} />
        </div>
      </section>

      {/* === 4. Designed for Living. Crafted for Life. ========= */}
      <section className="sw-living">
        <h2 className="sw-section-title sw-section-title-center">
          {isRtl ? 'مصمم للحياة. مصنوع للأبد.' : 'Designed for Living. Crafted for Life.'}
        </h2>
        <div className="sw-living-grid">
          {LIVING_TILES.map((c) => (
            <Link key={c.key} href={c.href} className="sw-living-tile">
              <img src={c.src} alt={isRtl ? c.arLabel : c.enLabel} />
              <span className="sw-living-label">{isRtl ? c.arLabel : c.enLabel}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* === 5. Proudly Kuwaiti banner ========================= */}
      <section className="sw-heritage">
        <img className="sw-heritage-bg" src={HOME_ASSETS.factory.src} alt="" aria-hidden="true" />
        <div className="sw-heritage-scrim" aria-hidden="true" />
        <div className="sw-heritage-inner">
          <div className="sw-heritage-copy">
            <span className="section-kicker sw-heritage-kicker">EST. 1998</span>
            <h2 className="sw-heritage-title">
              {isRtl ? (<>كويتيون بفخر.<br />ملهَمون عالمياً.</>) : (<>Proudly Kuwaiti.<br />Globally Inspired.</>)}
            </h2>
            <p className="sw-heritage-body">
              {isRtl
                ? 'مصنع سمارت وود رائد في الكويت في صناعة الأثاث الفاخر منذ أكثر من 26 سنة.'
                : 'SmartWood factory has been a leader in the kuwaiti high-end furniture for more than 26 years.'}
            </p>
            <Link href="/about" className="sw-link-arrow sw-link-arrow-light">
              <span>{isRtl ? 'اكتشف قصتنا' : 'Learn Our Story'}</span>
              <i className={`bi ${arrow}`}></i>
            </Link>
          </div>
          <div className="sw-heritage-badge" aria-hidden="true">
            <span className="sw-heritage-badge-top">{isRtl ? 'سنوات من' : 'YEARS OF'}</span>
            <span className="sw-heritage-badge-num">26+</span>
            <span className="sw-heritage-badge-bot">{isRtl ? 'التميّز' : 'EXCELLENCE'}</span>
          </div>
        </div>
      </section>

      {/* === 6. German Quality. Timeless Strength. ============= */}
      <section className="sw-quality">
        <h2 className="sw-section-title sw-section-title-center">
          {isRtl ? 'جودة ألمانية. متانة خالدة.' : 'German Quality. Timeless Strength.'}
        </h2>
        <div className="sw-quality-grid">
          {QUALITY_FEATURES.map((q) => (
            <div key={q.key} className="sw-quality-cell">
              <i className={`bi ${q.icon}`}></i>
              <h3 className="sw-quality-title">{isRtl ? q.arTitle : q.enTitle}</h3>
              <p className="sw-quality-text">{isRtl ? q.arText : q.enText}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === 7. Quote card ===================================== */}
      <section className="sw-quote-wrap">
        <blockquote className="sw-quote">
          <span className="sw-quote-mark" aria-hidden="true">99</span>
          <p>
            {isRtl
              ? 'نحن لا نصنع أثاثاً فقط، نحن نصنع إرثاً.'
              : "We don't just build furniture, we craft legacy."}
          </p>
          <footer>— SmartWood</footer>
        </blockquote>
      </section>

      {/* === 8. SmartWood Collection =========================== */}
      <section className="sw-collection">
        <h2 className="sw-section-title sw-section-title-center">
          {isRtl ? 'مجموعة سمارت وود' : 'SmartWood Collection'}
        </h2>
        <div className="sw-collection-grid">
          {featuredItems.map((item) => (
            <Link key={item.id} href={`/shop/product/${item.id}`} className="sw-product-card">
              <div className="sw-product-img">
                <img src={item.image || FALLBACK_IMAGE} alt={isRtl ? item.nameAr || item.name : item.name} />
              </div>
              <div className="sw-product-meta">
                <h3 className="sw-product-name">{isRtl ? item.nameAr || item.name : item.name}</h3>
                <p className="sw-product-price">
                  {item.price.toLocaleString()} <span>{isRtl ? 'د.ك' : 'KWD'}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* === 9. Mini benefit chips ============================= */}
      <section className="sw-benefits">
        {MINI_BENEFITS.map((b) => (
          <div key={b.key} className="sw-benefit-chip">
            <i className={`bi ${b.icon}`}></i>
            <div className="sw-benefit-text">
              <strong>{isRtl ? b.arTitle : b.enTitle}</strong>
              <span>{isRtl ? b.arSub : b.enSub}</span>
            </div>
          </div>
        ))}
      </section>

      {/* === 10. Compare Our Models (desktop only) ============= */}
      {compareItems.length >= 2 && (
        <section className="sw-compare">
          <h2 className="sw-section-title sw-section-title-center">
            {isRtl ? 'قارن بين موديلاتنا' : 'Compare Our Models'}
          </h2>
          <div className="sw-compare-table-wrap">
            <table className="sw-compare-table">
              <thead>
                <tr>
                  <th aria-hidden="true"></th>
                  {compareItems.map((item, i) => (
                    <th key={item.id} className={i === 0 ? 'sw-compare-col-active' : ''}>
                      {isRtl ? item.nameAr || item.name : item.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_SPECS.map((spec) => (
                  <tr key={spec.enKey}>
                    <th scope="row">{isRtl ? spec.arKey : spec.enKey}</th>
                    {spec.vals.slice(0, compareItems.length).map((v, i) => (
                      <td key={i} className={i === 0 ? 'sw-compare-col-active' : ''}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
