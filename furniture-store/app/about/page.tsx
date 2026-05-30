'use client';

import Link from 'next/link';
import { useLanguage } from '../../data/LanguageContext';
import { useFurniture } from '../../data/FurnitureContext';
import { FALLBACK_IMAGE } from '../../data/furnitureData';
import { useEffect, useMemo } from 'react';
import Footer from '../../components/layout/Footer';

/* ============================================================
 * Craftsmanship (Smartwood 2026 redesign) — route: /about
 *
 * Deliberately NOT a second homepage. Where the homepage answers
 * "what we offer", this page answers "how we make it":
 *   1. Hero — moody, craft-focused
 *   2. Intro statement
 *   3. The Process — numbered zig-zag journey w/ detail shots
 *   4. Materials & Hardware — German wood + DE/AT fittings (macros)
 *   5. Craft detail gallery — tight close-ups
 *   6. CTA — start a project (not the homepage quote)
 * ============================================================ */

export default function CraftsmanshipPage() {
  const { isRtl, language } = useLanguage();
  const { items } = useFurniture();
  // Prefer a priced item so the hero card never shows "0 KWD".
  const featuredProduct = useMemo(
    () => items.find((i) => i.price > 0) || items[0] || null,
    [items]
  );
  const arrow = isRtl ? 'bi-arrow-left' : 'bi-arrow-right';

  useEffect(() => {
    const main = document.querySelector('main.craft');
    // Enable the hidden→reveal animation only now that JS is running, so the
    // content is never stuck invisible if the observer never fires.
    main?.classList.add('reveal-ready');
    // Use the scrollable container as the observer root (the app scrolls inside
    // main.app-content, not the window).
    const root = document.querySelector('main.app-content');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { root: root || null, threshold: 0.12 }
    );
    const els = document.querySelectorAll('.craft .cr-step, .craft .cr-tile');
    els.forEach((el) => observer.observe(el));
    // Safety net: if anything hasn't revealed shortly after load, show it.
    const t = setTimeout(() => els.forEach((el) => el.classList.add('visible')), 1800);
    return () => { observer.disconnect(); clearTimeout(t); };
  }, []);

  const STEPS = [
    {
      icon: 'bi-pencil-square',
      img: '/images/home/living-custom.png',
      enTitle: 'Design & Blueprint',
      arTitle: 'التصميم والمخطط',
      enText: 'Every piece begins as a precise digital blueprint. We translate your space and vision into exact specifications before a single cut is made.',
      arText: 'كل قطعة تبدأ كمخطط رقمي دقيق. نحوّل مساحتك ورؤيتك إلى مواصفات دقيقة قبل أول قطع.',
    },
    {
      icon: 'bi-cpu',
      img: '/images/home/hardware.png',
      enTitle: 'Precision CNC',
      arTitle: 'دقة CNC',
      enText: 'Fully automated CNC machinery executes each cut, carve, and bore to 100% accuracy — repeatable and flawless, every time.',
      arText: 'آلات CNC آلية بالكامل تنفّذ كل قطع ونحت وثقب بدقة 100٪ — نتائج مثالية ومتكررة في كل مرة.',
    },
    {
      icon: 'bi-tools',
      img: '/images/home/craft-joinery.png',
      enTitle: 'Joinery & Assembly',
      arTitle: 'التجميع والنجارة',
      enText: 'Master craftsmen assemble each component with German & Austrian hardware engineered for a lifetime of smooth, silent use.',
      arText: 'حرفيون مهرة يجمّعون كل مكوّن بإكسسوارات ألمانية ونمساوية مصممة لعمر طويل من الأداء السلس والصامت.',
    },
    {
      icon: 'bi-brush',
      img: '/images/home/craft-finish.png',
      enTitle: 'Finishing',
      arTitle: 'التشطيب',
      enText: 'Surfaces are sanded, sealed, and hand-inspected — sustainable woods finished to withstand the Gulf’s climate for generations.',
      arText: 'تُصقل الأسطح وتُختم وتُفحص يدوياً — أخشاب مستدامة مُشطّبة لتتحمّل مناخ الخليج لأجيال.',
    },
    {
      icon: 'bi-house-check',
      img: '/images/home/living-wardrobes.png',
      enTitle: 'Delivery & Installation',
      arTitle: 'التوصيل والتركيب',
      enText: 'Our team delivers and installs on schedule, leaving you with a flawless, ready-to-live-in result.',
      arText: 'فريقنا يوصّل ويركّب في الموعد المحدد، ليترك لك نتيجة مثالية جاهزة للاستخدام.',
    },
  ];

  const MATERIALS = [
    {
      icon: 'bi-tree',
      enTitle: 'Premium German Wood',
      arTitle: 'خشب ألماني فاخر',
      enText: 'Sustainably sourced, moisture-tested timber selected for durability and natural beauty.',
      arText: 'خشب مستدام تم اختباره للرطوبة ومختار للمتانة والجمال الطبيعي.',
    },
    {
      icon: 'bi-bounding-box',
      enTitle: 'German & Austrian Hardware',
      arTitle: 'إكسسوارات ألمانية ونمساوية',
      enText: 'Soft-close hinges, concealed runners and precision fittings built for silent, lasting performance.',
      arText: 'مفصلات بإغلاق ناعم ومجاري مخفية وتجهيزات دقيقة لأداء صامت ودائم.',
    },
    {
      icon: 'bi-droplet',
      enTitle: 'Advanced Finishes',
      arTitle: 'تشطيبات متقدمة',
      enText: 'Climate-resilient coatings and lacquers applied with the latest techniques for a flawless surface.',
      arText: 'طلاءات ودهانات مقاومة للمناخ تُطبّق بأحدث التقنيات لسطح مثالي.',
    },
  ];

  const GALLERY = [
    '/images/home/hardware.png',
    '/images/home/craft-finish.png',
    '/images/home/craft-interior.png',
    '/images/home/craft-joinery.png',
  ];

  return (
    <main className="app-content craft about-2026" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* === 1. Hero (image-3 mockup: niche + floating badges + glass card + signature) === */}
      <section className="av-hero-mockup">
        {/* Left: niche photo + floating editorial badges */}
        <div className="av-hero-left">
          <img
            src="/images/home/hero-niche.png"
            alt={isRtl ? 'حرفية سمارت وود' : 'SmartWood Craftsmanship'}
            className="hero-bg-img"
          />
          <div className="hero-overlay-badge badge-wood">
            <div className="badge-icon-box"><i className="bi bi-tree"></i></div>
            <div className="badge-text-box">
              <span className="badge-small-text">{isRtl ? 'ممتاز' : 'Premium'}</span>
              <span className="badge-bold-text">{isRtl ? 'خشب ألماني' : 'German Wood'}</span>
            </div>
          </div>
          <div className="hero-overlay-badge badge-accessories">
            <div className="badge-icon-box"><i className="bi bi-gear"></i></div>
            <div className="badge-text-box">
              <span className="badge-small-text">{isRtl ? 'ألماني ونمساوي' : 'German & Austrian'}</span>
              <span className="badge-bold-text">{isRtl ? 'إكسسوارات' : 'Accessories'}</span>
            </div>
          </div>
        </div>

        {/* Floating glassmorphic product card (overlaps the seam) */}
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
                  {isRtl ? featuredProduct.nameAr || featuredProduct.name : featuredProduct.name}
                </span>
                {featuredProduct.price > 0 && (
                  <div className="hero-glass-price-wrap">
                    <span className="hero-glass-price">
                      {isRtl ? `${featuredProduct.price} د.ك` : `${featuredProduct.price} KWD`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        )}

        {/* Right: dark walnut copy panel + signature */}
        <div className="av-hero-right">
          <div className="av-hero-right-content">
            <h1 className="av-hero-title">
              {isRtl ? (<>صُنع ليدوم.<br />خُلق ليلهم.</>) : (<>Built to last.<br />Made to inspire.</>)}
            </h1>
            <p className="av-hero-sub">
              {isRtl
                ? 'مصنع سمارت وود هو رائد في الكويت في صناعة الأثاث الفاخر منذ أكثر من ٢٦ سنة.'
                : 'SmartWood factory has been a leader in the Kuwaiti high-end furniture for more than 26 years.'}
            </p>
          </div>
          <img className="hero-signature-logo" src={`/images/LOGO/smartwood-${language}-white.svg`} alt="" aria-hidden="true" />
        </div>
      </section>

      {/* === 2. Intro === */}
      <section className="cr-intro">
        <p>
          {isRtl
            ? 'لا نشكّل الخشب فحسب — بل ندمج أحدث آلات CNC في العالم مع أيدي حرفيين مهرة لنصنع قطعاً مبنية لتدوم لأجيال.'
            : "We don't just shape wood — we fuse the world's most advanced CNC machinery with the hands of master craftsmen to build pieces made to last for generations."}
        </p>
      </section>

      {/* === 3. The Process (zig-zag) === */}
      <section className="cr-process">
        <div className="cr-process-header">
          <span className="section-kicker">{isRtl ? 'كيف نصنع' : 'HOW WE BUILD'}</span>
          <h2 className="cr-section-title sw-center">{isRtl ? 'العملية' : 'The Process'}</h2>
        </div>

        {STEPS.map((s, i) => (
          <div key={i} className={`cr-step ${i % 2 === 1 ? 'cr-step-rev' : ''}`}>
            <div className="cr-step-media">
              <img src={s.img} alt={isRtl ? s.arTitle : s.enTitle} />
            </div>
            <div className="cr-step-copy">
              <span className="cr-step-num">{String(i + 1).padStart(2, '0')}</span>
              <i className={`bi ${s.icon} cr-step-icon`}></i>
              <h3 className="cr-step-title">{isRtl ? s.arTitle : s.enTitle}</h3>
              <p className="cr-step-text">{isRtl ? s.arText : s.enText}</p>
            </div>
          </div>
        ))}
      </section>

      {/* === 4. Materials & Hardware === */}
      <section className="cr-materials">
        <div className="cr-materials-header">
          <span className="section-kicker">{isRtl ? 'المواد' : 'MATERIALS & HARDWARE'}</span>
          <h2 className="cr-section-title sw-center">{isRtl ? 'جودة ألمانية في كل تفصيل' : 'German Quality in Every Detail'}</h2>
        </div>
        <div className="cr-materials-grid">
          {MATERIALS.map((m, i) => (
            <div key={i} className="cr-material">
              <i className={`bi ${m.icon} cr-material-icon`}></i>
              <h3 className="cr-material-title">{isRtl ? m.arTitle : m.enTitle}</h3>
              <p className="cr-material-text">{isRtl ? m.arText : m.enText}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === 5. Detail gallery === */}
      <section className="cr-gallery">
        <div className="cr-gallery-grid">
          {GALLERY.map((src, i) => (
            <div key={i} className="cr-tile" style={{ transitionDelay: `${i * 70}ms` }}>
              <img src={src} alt={isRtl ? 'تفصيل الحرفية' : 'Craft detail'} />
            </div>
          ))}
        </div>
      </section>

      {/* === 6. CTA === */}
      <section className="cr-cta-wrap">
        <div className="cr-cta">
          <h2 className="cr-cta-title">
            {isRtl ? 'لديك مشروع في بالك؟' : 'Have a project in mind?'}
          </h2>
          <p className="cr-cta-sub">
            {isRtl
              ? 'دعنا نحوّل مساحتك إلى قطعة مصنوعة بدقة وحرفية.'
              : "Let's turn your space into something crafted with precision and built to last."}
          </p>
          <Link href="/contact" className="cr-cta-btn">
            {isRtl ? 'ابدأ مشروعك' : 'Start Your Project'}
            <i className={`bi ${arrow}`}></i>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
