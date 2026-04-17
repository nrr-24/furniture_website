'use client';

import { useLanguage } from '../../data/LanguageContext';
import { useEffect, useRef } from 'react';

export default function AboutPage() {
  const { t, isRtl } = useLanguage();
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    const items = timelineRef.current?.querySelectorAll('.timeline-item');
    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  const timelineData = [
    {
      icon: 'bi-cpu',
      title: isRtl ? 'دقة CNC المتقدمة' : 'Advanced CNC Precision',
      description: isRtl
        ? 'آلات آلية بالكامل تضمن دقة 100٪ في كل قطع ونحت وتشطيب.'
        : 'Fully automated machinery ensures 100% accuracy in every cut, carve, and finish.',
      image: 'https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0003_030.jpg',
      step: '01',
    },
    {
      icon: 'bi-geo-alt',
      title: isRtl ? 'بفخر صُنع في الكويت' : 'Proudly Made in Kuwait',
      description: isRtl
        ? 'علامة وطنية تلتزم بالتميز المحلي وتسليم أسرع ودعم أفضل.'
        : 'A national brand committed to local excellence, faster delivery, and superior support.',
      image: 'https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0007_026.jpg',
      step: '02',
    },
    {
      icon: 'bi-tree',
      title: isRtl ? 'مصادر مواد فاخرة' : 'Premium Material Sourcing',
      description: isRtl
        ? 'خشب مستدام تم اختباره لتحمل مناخ الخليج الفريد.'
        : 'Sourcing the finest sustainable woods tested to withstand the Gulf\'s unique climate.',
      image: 'https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0024_009.jpg',
      step: '03',
    },
    {
      icon: 'bi-clock-history',
      title: isRtl ? 'تجربة سلسة' : 'Streamlined Experience',
      description: isRtl
        ? 'سير عمل رقمي يضمن الشفافية والدقة والتسليم في الوقت المحدد.'
        : 'Digitalized production workflow guaranteeing transparency, precision, and on-time delivery.',
      image: 'https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/1x1_0032_001.jpg',
      step: '04',
    },
  ];

  return (
    <main className="app-content" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* 1. Heritage Split Section — matches Home hero sizing with nav clearance */}
      <section className="lumiere-split hero-viewport">
        {/* Left Side: Copy & Info */}
        <div className="split-left" style={{ justifyContent: 'center' }}>

          {/* <span className="section-kicker animate-fade-up" style={{ marginBottom: '16px', display: 'block', animationDelay: '0.2s' }}>
            {isRtl ? 'التراث والابتكار' : 'The Heritage & Innovation'}
          </span> */}

          <h1 className="smartwood-title" style={{ fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <span className="text-showup" style={{ animationDelay: '0.05s' }}>{isRtl ? 'عن' : 'ABOUT'}</span>
            <span className="text-reveal" style={{ animationDelay: '0.3s', fontWeight: 600 }}>{isRtl ? 'سمارت وود' : 'SMARTWOOD'}</span>
          </h1>

          <p className="smartwood-description animate-fade-up" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', color: 'var(--text-soft)', marginBottom: '20px', maxWidth: '600px', lineHeight: 1.75, animationDelay: '1.5s' }}>
            {isRtl
              ? 'في سمارت وود، نحن لا نقوم فقط بتشكيل الخشب؛ نحن نصنع إرثاً. بصفتنا مصنعاً كويتياً رائداً، فقد وضعنا معياراً جديداً في صناعة النجارة والأخشاب.'
              : 'At Smartwood, we don\u2019t just process wood; we craft legacies. As a leading Kuwaiti factory, we have established a new benchmark in the joinery and woodworking industry.'
            }
          </p>

          <p className="smartwood-description animate-fade-up" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', color: 'var(--text-soft)', marginBottom: '32px', maxWidth: '600px', lineHeight: 1.75, animationDelay: '1.7s' }}>
            {isRtl
              ? 'من خلال دمج تكنولوجيا CNC الأكثر تقدماً في العالم مع نظام إدارة Odoo المتطور، نضمن رحلة سلسة من التصميم المبدئي إلى التنفيذ الخالي من العيوب. مهمتنا هي تزويد السوق الكويتي بحلول خشبية مستدامة وراقية تنافس المعايير العالمية.'
              : 'By integrating the world\u2019s most advanced CNC technology with the sophisticated Odoo management system, we ensure a seamless journey from conceptual design to flawless execution. Our mission is to provide the Kuwaiti market with sustainable, high-end wood solutions that rival international standards.'
            }
          </p>

          <div className="hero-main-actions d-flex gap-3 animate-fade-up" style={{ animationDelay: '1.9s' }}>
            <a href="/shop" className="hero-secondary-btn" style={{ padding: 'clamp(12px, 3vw, 16px) clamp(24px, 6vw, 40px)', borderRadius: '12px' }}>
              {isRtl ? 'استكشف تصاميمنا' : 'DISCOVER DESIGNS'}
            </a>
          </div>

        </div>

        {/* Right Side: Process edge-to-edge image */}
        <div className="split-right">
          <div className="split-right-img-container reveal-container">
            <img
              src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/9x16_0004_006.jpg"
              alt={isRtl ? 'صناعة الأثاث' : 'Furniture Crafting'}
              className="reveal-inner-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, rgba(0,0,0,0.5) 0%, transparent 100%)' }}></div>

            {/* Corner Text overlay inside the image */}
            <div style={{
              position: 'absolute',
              bottom: 'clamp(24px, 6vw, 100px)',
              left: 'clamp(20px, 5vw, 60px)',
              right: 'clamp(20px, 5vw, 60px)',
              color: 'rgba(255,255,255,0.9)',
              textAlign: isRtl ? 'right' : 'left'
            }}>
              <span style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>02 /</span>
              <h3 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', fontWeight: 300, margin: 0, lineHeight: 1.2 }}>
                {isRtl ? 'صُنع في' : 'MADE IN'}<br />
                <span style={{ fontWeight: 700 }}>{isRtl ? 'الكويت' : 'KUWAIT'}</span>
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Why Smartwood? — Timeline */}
      <section className="timeline-section">
        <div className="timeline-section-header">
          <span className="section-kicker">{isRtl ? 'الميزة التنافسية' : 'The Competitive Edge'}</span>
          <h2 className="section-title" style={{ marginBottom: '0' }}>{isRtl ? 'لماذا سمارت وود؟' : 'Why Smartwood?'}</h2>
        </div>

        <div className="timeline" ref={timelineRef}>
          {timelineData.map((item, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-node"></div>
              <div className="timeline-content">
                <span className="timeline-step">{item.step}</span>
                <h3>
                  <i className={`bi ${item.icon}`}></i>
                  {item.title}
                </h3>
                <p>{item.description}</p>
              </div>
              <div className="timeline-img-wrap">
                <img src={item.image} alt={item.title} />
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
