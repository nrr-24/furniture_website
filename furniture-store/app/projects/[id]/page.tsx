'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useLanguage } from '../../../data/LanguageContext';
import Footer from '../../../components/layout/Footer';

interface MediaItem { type: 'image' | 'video'; url: string; }

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
  media?: MediaItem[];
  sort_order: number;
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { isRtl } = useLanguage();
  const arrow = isRtl ? 'bi-arrow-left' : 'bi-arrow-right';

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then(({ data }) => {
        const p = (data as Project[])?.find((x) => x.id === params.id);
        if (p) setProject(p);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-soft)' }}>
        {isRtl ? 'جاري التحميل…' : 'Loading…'}
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <main dir={isRtl ? 'rtl' : 'ltr'} className="app-content projects-2026">
        <div style={{ padding: '80px 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>
            {isRtl ? 'المشروع غير موجود' : 'Project not found'}
          </h1>
          <Link href="/projects" className="sw-btn-outline">
            <span>{isRtl ? 'العودة إلى المشاريع' : 'Back to Projects'}</span>
            <i className={`bi ${arrow}`} />
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const title = isRtl ? project.title_ar : project.title_en;
  const location = isRtl ? project.location_ar : project.location_en;
  const desc = isRtl ? project.desc_ar : project.desc_en;

  return (
    <main className="app-content projects-2026 pd-page" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Back link */}
      <div className="pd-back">
        <Link href="/projects" className="pd-back-link">
          <i className={`bi ${isRtl ? 'bi-arrow-right' : 'bi-arrow-left'}`} />
          <span>{isRtl ? 'المشاريع' : 'Projects'}</span>
        </Link>
      </div>

      {/* Hero image */}
      <div className="pd-hero-img">
        <Image src={project.image_url || '/images/projects/placeholder.jpg'} alt={title} fill style={{ objectFit: 'cover' }} sizes="(max-width:767px) 100vw, 1000px" priority />
      </div>

      {/* Content */}
      <div className="pd-content">
        <p className="project-meta">{project.year}{location ? ` • ${location}` : ''}</p>
        <h1 className="pd-title">{title}</h1>
        <p className="pd-desc">{desc}</p>

        {/* Media gallery */}
        {project.media && project.media.length > 0 && (
          <div className="pd-gallery">
            {project.media.map((m, i) => (
              <div key={i} className="pd-gallery-img">
                {m.type === 'video' ? (
                  <video src={m.url} controls playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <img src={m.url} alt={`${title} ${i + 1}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
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
          <span>{isRtl ? 'تواصل معنا' : 'Get in Touch'}</span>
          <i className={`bi ${arrow}`} />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
