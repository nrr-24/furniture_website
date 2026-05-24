'use client';

import Link from 'next/link';
import { useLanguage } from '../../data/LanguageContext';
import { useEffect, useRef } from 'react';
import Footer from '../../components/layout/Footer';

/* ============================================================
 * About Us (Smartwood 2026 redesign)
 *
 * Editorial story page in the cream + espresso design language:
 *   1. Hero — centered headline + wide image
 *   2. Story — two-column copy + image ("Our Promise")
 *   3. Stats band — 26+ years, precision, materials, origin
 *   4. Why SmartWood — values grid (the old timeline, restyled)
 *   5. Quote / CTA — espresso card
 * Strings inline as `isRtl ? ar : en` for parity with the rest of
 * the site. Imagery pulled from /public/images/home.
 * ============================================================ */

const HERO_IMG = '/images/home/about-hero.png';
const STORY_IMG = '/images/home/living-wardrobes.png';

export default function AboutPage() {
  const { isRtl } = useLanguage();
  const revealRef = useRef<HTMLDivElement>(null);
  const arrow = isRtl ? 'bi-arrow-left' : 'bi-arrow-right';

  // Fade-up reveal for the value cards as they scroll into view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.15 }
    );
    const items = revealRef.current?.querySelectorAll('.av-value');
    items?.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const STATS = [
    { num: '26+', en: 'Years of Excellence', ar: 'سنة من التميّز' },
    { num: '100%', en: 'CNC Precision', ar: 'دقة CNC' },
    { num: 'DE·AT', en: 'German & Austrian Hardware', ar: 'إكسسوارات ألمانية ونمساوية' },
    { num: 'KW', en: 'Proudly Made in Kuwait', ar: 'صُنع بفخر في الكويت' },
  ];

  const VALUES = [
    {
      icon: 'bi-cpu',
      enTitle: 'Advanced CNC Precision',
      arTitle: 'دقة CNC المتقدمة',
      enText: 'Fully automated machinery ensures 100% accuracy in every cut, carve, and finish.',
      arText: 'آلات آلية بالكامل تضمن دقة 100٪ في كل قطع ونحت وتشطيب.',
    },
    {
      icon: 'bi-geo-alt',
      enTitle: 'Proudly Made in Kuwait',
      arTitle: 'بفخر صُنع في الكويت',
      enText: 'A national brand committed to local excellence, faster delivery, and superior support.',
      arText: 'علامة وطنية تلتزم بالتميز المحلي وتسليم أسرع ودعم أفضل.',
    },
    {
      icon: 'bi-tree',
      enTitle: 'Premium Material Sourcing',
      arTitle: 'مصادر مواد فاخرة',
      enText: "Sourcing the finest sustainable woods, tested to withstand the Gulf's unique climate.",
      arText: 'خشب مستدام تم اختياره بعناية لتحمل مناخ الخليج الفريد.',
    },
    {
      icon: 'bi-clock-history',
      enTitle: 'Streamlined Experience',
      arTitle: 'تجربة سلسة',
      enText: 'A digitalized production workflow guaranteeing transparency, precision, and on-time delivery.',
      arText: 'سير عمل رقمي يضمن الشفافية والدقة والتسليم في الوقت المحدد.',
    },
  ];

  return (
    <main className="app-content about-2026" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* === 1. Hero =========================================== */}
      <section className="av-hero">
        <span className="section-kicker">{isRtl ? 'قصتنا' : 'OUR STORY'}</span>
        <h1 className="av-hero-title">
          {isRtl ? (<>نصنع الإرث<br />منذ 1998.</>) : (<>Crafting Legacy<br />Since 1998.</>)}
        </h1>
        <p className="av-hero-sub">
          {isRtl
            ? 'في سمارت وود، لا نشكّل الخشب فحسب — بل نصنع إرثاً يدوم لأجيال.'
            : "At SmartWood, we don't just shape wood — we craft a legacy built to last for generations."}
        </p>
        <div className="av-hero-img">
          <img src={HERO_IMG} alt={isRtl ? 'حرفية سمارت وود' : 'SmartWood craftsmanship'} />
        </div>
      </section>

      {/* === 2. Story ========================================== */}
      <section className="av-story">
        <div className="av-story-copy">
          <span className="section-kicker">{isRtl ? 'وعدنا' : 'OUR PROMISE'}</span>
          <h2 className="av-section-title">
            {isRtl ? 'إرث من الجودة' : (<>A Legacy<br />of Quality</>)}
          </h2>
          <p className="av-body">
            {isRtl
              ? 'بصفتنا مصنعاً كويتياً رائداً، وضعنا معياراً جديداً في صناعة النجارة والأخشاب الفاخرة منذ أكثر من 26 عاماً.'
              : 'As a leading Kuwaiti factory, we have set a new benchmark in fine joinery and woodworking for more than 26 years.'}
          </p>
          <p className="av-body">
            {isRtl
              ? 'بدمج أحدث تقنيات CNC في العالم مع نظام Odoo المتطور، نضمن رحلة سلسة من التصميم إلى التنفيذ الخالي من العيوب — بحلول خشبية مستدامة تنافس المعايير العالمية.'
              : "By integrating the world's most advanced CNC technology with the Odoo management system, we ensure a seamless journey from design to flawless execution — sustainable, high-end wood solutions that rival international standards."}
          </p>
          <Link href="/shop" className="av-link-arrow">
            <span>{isRtl ? 'استكشف تصاميمنا' : 'Discover Designs'}</span>
            <i className={`bi ${arrow}`}></i>
          </Link>
        </div>
        <div className="av-story-img">
          <img src={STORY_IMG} alt={isRtl ? 'تصاميم سمارت وود' : 'SmartWood designs'} />
        </div>
      </section>

      {/* === 3. Stats band ===================================== */}
      <section className="av-stats">
        {STATS.map((s) => (
          <div key={s.num} className="av-stat">
            <span className="av-stat-num">{s.num}</span>
            <span className="av-stat-label">{isRtl ? s.ar : s.en}</span>
          </div>
        ))}
      </section>

      {/* === 4. Why SmartWood — values ========================= */}
      <section className="av-why" ref={revealRef}>
        <div className="av-why-header">
          <span className="section-kicker">{isRtl ? 'الميزة التنافسية' : 'THE COMPETITIVE EDGE'}</span>
          <h2 className="av-section-title sw-center">{isRtl ? 'لماذا سمارت وود؟' : 'Why SmartWood?'}</h2>
        </div>
        <div className="av-value-grid">
          {VALUES.map((v, i) => (
            <div key={i} className="av-value" style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="av-value-num">{String(i + 1).padStart(2, '0')}</span>
              <i className={`bi ${v.icon} av-value-icon`}></i>
              <h3 className="av-value-title">{isRtl ? v.arTitle : v.enTitle}</h3>
              <p className="av-value-text">{isRtl ? v.arText : v.enText}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === 5. Quote / CTA ==================================== */}
      <section className="av-cta-wrap">
        <div className="av-cta">
          <span className="av-cta-mark" aria-hidden="true">99</span>
          <p className="av-cta-quote">
            {isRtl
              ? 'نحن لا نصنع أثاثاً فقط، نحن نصنع إرثاً.'
              : "We don't just build furniture, we craft legacy."}
          </p>
          <Link href="/contact" className="av-cta-btn">
            {isRtl ? 'تواصل معنا' : 'Get in Touch'}
            <i className={`bi ${arrow}`}></i>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
