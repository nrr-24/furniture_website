'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../data/LanguageContext';
import Footer from '../../components/layout/Footer';
import { useScrollReveal } from '../../lib/useScrollReveal';

/**
 * Services showcase — "Our Services" grid of bespoke woodwork offerings.
 * Mirrors the SmartWood 2026 design: a centered editorial header followed by a
 * grid of full-bleed image cards. Each card zooms its image and reveals a
 * corner arrow on hover. Scoped under .services-2026.
 */

interface Service {
  key: string;
  img: string;
  enTitle: string;
  arTitle: string;
  enText: string;
  arText: string;
}

const SERVICES: Service[] = [
  {
    key: 'wardrobes',
    img: '/images/home/living-wardrobes.png',
    enTitle: 'Wardrobes', arTitle: 'خزائن الملابس',
    enText: 'Custom luxury wardrobes with integrated lighting and premium finishes',
    arText: 'خزائن ملابس فاخرة مخصصة بإضاءة مدمجة وتشطيبات راقية',
  },
  {
    key: 'dressing',
    img: '/images/home/living-bedrooms.png',
    enTitle: 'Dressing Rooms', arTitle: 'غرف الملابس',
    enText: 'Walk-in dressing rooms with architectural precision',
    arText: 'غرف ملابس متكاملة بدقة معمارية',
  },
  {
    key: 'hidden-doors',
    img: '/images/home/craft-interior.png',
    enTitle: 'Hidden Doors', arTitle: 'أبواب خفية',
    enText: 'Seamless wall integration with invisible hinges',
    arText: 'اندماج سلس مع الجدران بمفصلات خفية',
  },
  {
    key: 'tv-units',
    img: '/images/home/living-custom.png',
    enTitle: 'TV Units', arTitle: 'وحدات تلفزيون',
    enText: 'Integrated entertainment centers with cable management',
    arText: 'وحدات ترفيه متكاملة مع تنظيم الأسلاك',
  },
  {
    key: 'wall-cladding',
    img: '/images/home/craft-finish.png',
    enTitle: 'Wall Cladding', arTitle: 'تكسية الجدران',
    enText: 'Premium wood paneling for architectural impact',
    arText: 'تكسية خشبية فاخرة بلمسة معمارية',
  },
  {
    key: 'sliding',
    img: '/images/home/perspective-3-slate.png',
    enTitle: 'Sliding Systems', arTitle: 'أنظمة انزلاقية',
    enText: 'German-engineered sliding door mechanisms',
    arText: 'آليات أبواب منزلقة بهندسة ألمانية',
  },
  {
    key: 'storage',
    img: '/images/home/cat-accents.png',
    enTitle: 'Storage Systems', arTitle: 'أنظمة التخزين',
    enText: 'Bespoke storage solutions for every space',
    arText: 'حلول تخزين مخصصة لكل مساحة',
  },
  {
    key: 'desks',
    img: '/images/home/feature-wide.png',
    enTitle: 'Desks & Tables', arTitle: 'مكاتب وطاولات',
    enText: 'Executive desks and tables crafted with precision',
    arText: 'مكاتب وطاولات تنفيذية مصنوعة بدقة',
  },
];

export default function ServicesPage() {
  const { isRtl } = useLanguage();
  const arrow = isRtl ? 'bi-arrow-up-left' : 'bi-arrow-up-right';

  useScrollReveal();

  return (
    <main className="app-content services-2026" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* === Header ============================================== */}
      <header className="sv-header sw-reveal-x">
        <span className="sv-kicker">{isRtl ? 'ما نصنعه' : 'WHAT WE CREATE'}</span>
        <h1 className="sv-title">{isRtl ? 'خدماتنا' : 'Our Services'}</h1>
        <p className="sv-sub">
          {isRtl
            ? 'من خزائن الملابس المخصصة إلى التكسيات المعمارية، نصنع حلول أعمال خشبية فاخرة تُعرّف الحياة الراقية في الكويت.'
            : 'From custom wardrobes to architectural paneling, we craft bespoke woodwork solutions that define luxury living in Kuwait.'}
        </p>
      </header>

      {/* === Services grid ====================================== */}
      <section className="sv-grid">
        {SERVICES.map((s) => (
          <Link
            key={s.key}
            href={`/contact?service=${encodeURIComponent(s.enTitle)}`}
            className="sv-card"
          >
            <Image
              src={s.img}
              alt={isRtl ? s.arTitle : s.enTitle}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
            />
            <span className="sv-card-scrim" aria-hidden="true" />
            <span className="sv-card-arrow" aria-hidden="true">
              <i className={`bi ${arrow}`} />
            </span>
            <span className="sv-card-body">
              <span className="sv-card-title">{isRtl ? s.arTitle : s.enTitle}</span>
              <span className="sv-card-text">{isRtl ? s.arText : s.enText}</span>
            </span>
          </Link>
        ))}
      </section>

      {/* === CTA =============================================== */}
      <section className="sv-cta sw-reveal-x">
        <h2 className="sv-cta-title">{isRtl ? 'لديك مشروع في بالك؟' : 'Have a project in mind?'}</h2>
        <p className="sv-cta-sub">
          {isRtl
            ? 'دعنا نحوّل مساحتك إلى قطعة مصنوعة بدقة وحرفية.'
            : "Let's turn your space into something crafted with precision and built to last."}
        </p>
        <Link href="/contact" className="sw-btn-outline">
          <span>{isRtl ? 'ابدأ مشروعك' : 'Start Your Project'}</span>
          <i className={`bi ${isRtl ? 'bi-arrow-left' : 'bi-arrow-right'}`} />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
