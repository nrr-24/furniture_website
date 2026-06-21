'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../data/LanguageContext';
import Footer from '../../components/layout/Footer';
import { useScrollReveal } from '../../lib/useScrollReveal';

interface Project {
  id: string;
  title_en: string;
  title_ar: string;
  year: string;
  location_en: string;
  location_ar: string;
  desc_en: string;
  desc_ar: string;
  image_url: string;
  sort_order: number;
}

export default function ProjectsPage() {
  const { isRtl } = useLanguage();
  const arrow = isRtl ? 'bi-arrow-left' : 'bi-arrow-right';

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then(({ data }) => setProjects(data || []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  // Reveal text once the project list has loaded.
  useScrollReveal(!loading);

  return (
    <main className="app-content projects-2026" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* === Header =============================================== */}
      <header className="projects-header sw-reveal-x">
        <span className="projects-kicker">
          {isRtl ? 'معرض الأعمال' : 'Portfolio'}
        </span>
        <h1 className="projects-title">
          {isRtl ? 'المشاريع المتميزة' : 'Featured Projects'}
        </h1>
      </header>

      {/* === Projects list ========================================= */}
      <section className="projects-list">
        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--text-soft)', padding: '40px 0' }}>
            {isRtl ? 'جاري التحميل…' : 'Loading…'}
          </p>
        )}

        {!loading && projects.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-soft)', padding: '40px 0' }}>
            {isRtl ? 'لا توجد مشاريع حتى الآن.' : 'No projects yet.'}
          </p>
        )}

        {projects.map((p, idx) => (
          <Link key={p.id} href={`/projects/${p.id}`} className="project-row project-row-link">
            <div className="project-img-container">
              <Image src={p.image_url || '/images/projects/placeholder.jpg'} alt={isRtl ? p.title_ar : p.title_en} fill style={{ objectFit: 'cover' }} sizes="(max-width:767px) 100vw, 55vw" />
            </div>
            <div className="project-text-container sw-reveal-x">
              <div className="project-meta">
                {p.year}{(isRtl ? p.location_ar : p.location_en) ? ` • ${isRtl ? p.location_ar : p.location_en}` : ''}
              </div>
              <h2 className="project-name">
                {isRtl ? p.title_ar : p.title_en}
              </h2>
              <p className="project-desc">
                {isRtl ? p.desc_ar : p.desc_en}
              </p>
              <span className="project-cta-link">
                <span>{isRtl ? 'عرض المشروع' : 'View Project'}</span>
                <i className={`bi ${arrow}`} />
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* === Call to action ======================================= */}
      <section className="projects-cta sw-reveal-x">
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
          <i className={`bi ${arrow}`} />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
