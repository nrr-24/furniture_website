'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../data/LanguageContext';
import Footer from '../../components/layout/Footer';

/**
 * Projects showcase page – matches the visual language of the rest of the site.
 * Centered layout with alternating rows of images and descriptions.
 */
export default function ProjectsPage() {
  const { isRtl } = useLanguage();
  const arrow = isRtl ? 'bi-arrow-left' : 'bi-arrow-right';

  const projects = [
    {
      titleEn: 'Villa Modernist',
      titleAr: 'فيلا مودرنست',
      year: '2024',
      locationEn: 'Bayan, Kuwait',
      locationAr: 'بيان، الكويت',
      descEn: 'Complete interior woodwork including wardrobes, TV units, and wall paneling',
      descAr: 'أعمال خشبية داخلية كاملة تشمل خزائن الملابس، وحدات التلفزيون، وتكسية الجدران',
      img: '/images/projects/1.jpg',
    },
    {
      titleEn: 'Contemporary Palace',
      titleAr: 'قصر معاصر',
      year: '2023',
      locationEn: 'Salmiya, Kuwait',
      locationAr: 'السالمية، الكويت',
      descEn: 'Master bedroom suite with custom dressing room and hidden storage',
      descAr: 'جناح غرفة النوم الرئيسية مع غرفة ملابس مخصصة ومساحات تخزين مخفية',
      img: '/images/projects/2.jpg',
    },
    {
      titleEn: 'Executive Residence',
      titleAr: 'سكن تنفيذي',
      year: '2023',
      locationEn: 'Sabah Al Salem, Kuwait',
      locationAr: 'صباح السالم، الكويت',
      descEn: 'Home office with integrated library and sliding door system',
      descAr: 'مكتب منزلي مع مكتبة متكاملة ونظام أبواب منزلقة',
      img: '/images/projects/3.jpg',
    },
  ];

  return (
    <main className="app-content projects-2026" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* === Header =============================================== */}
      <header className="projects-header">
        <span className="projects-kicker">
          {isRtl ? 'معرض الأعمال' : 'Portfolio'}
        </span>
        <h1 className="projects-title">
          {isRtl ? 'المشاريع المتميزة' : 'Featured Projects'}
        </h1>
      </header>

      {/* === Projects list ========================================= */}
      <section className="projects-list">
        {projects.map((p, idx) => (
          <article key={idx} className="project-row">
            <div className="project-img-container">
              <img src={p.img} alt={isRtl ? p.titleAr : p.titleEn} />
            </div>
            <div className="project-text-container">
              <div className="project-meta">
                {p.year} • {isRtl ? p.locationAr : p.locationEn}
              </div>
              <h2 className="project-name">
                {isRtl ? p.titleAr : p.titleEn}
              </h2>
              <p className="project-desc">
                {isRtl ? p.descAr : p.descEn}
              </p>
            </div>
          </article>
        ))}
      </section>

      {/* === Call to action ======================================= */}
      <section className="projects-cta">
        <h2 className="projects-cta-title">
          {isRtl ? 'ابدأ مشروعك' : 'Begin Your Project'}
        </h2>
        <p className="projects-cta-subtitle">
          {isRtl
            ? 'حوّل فيلتك بأعمال خشبية معمارية فاخرة. احجز استشارة مع فريق التصميم لدينا.'
            : 'Transform your villa with luxury architectural woodwork. Schedule a consultation with our design team.'}
        </p>
        <Link href="/contact" className="sw-btn-outline">
          <span>{isRtl ? 'ابدأ مشروعك' : 'Start Your Project'}</span>
          <i className={`bi ${arrow}`}></i>
        </Link>
      </section>

      <Footer />
    </main>
  );
}
