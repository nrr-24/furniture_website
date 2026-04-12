'use client';

import { useLanguage } from '../../data/LanguageContext';

export default function AboutPage() {
  const { t, isRtl } = useLanguage();
  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>

      {/* 1. Heritage Split Section */}
      <section className="lumiere-split" style={{ minHeight: 'calc(100vh - 80px)' }}>
        {/* Left Side: Copy & Info */}
        <div className="split-left" style={{ justifyContent: 'center' }}>

          <span className="section-kicker" style={{ marginBottom: '16px', display: 'block' }}>
            {isRtl ? 'التراث والابتكار' : 'The Heritage & Innovation'}
          </span>

          <h1 className="smartwood-title" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: '24px' }}>
            {isRtl ? 'عن' : 'ABOUT'}
            <br />
            <span style={{ fontWeight: 600 }}>{isRtl ? 'سمارت وود' : 'SMARTWOOD'}</span>
          </h1>

          <p className="smartwood-description" style={{ fontSize: '1.1rem', color: 'var(--text-soft)', marginBottom: '20px', maxWidth: '600px', lineHeight: 1.8 }}>
            {isRtl
              ? 'في سمارت وود، نحن لا نقوم فقط بتشكيل الخشب؛ نحن نصنع إرثاً. بصفتنا مصنعاً كويتياً رائداً، فقد وضعنا معياراً جديداً في صناعة النجارة والأخشاب.'
              : 'At Smartwood, we don’t just process wood; we craft legacies. As a leading Kuwaiti factory, we have established a new benchmark in the joinery and woodworking industry.'
            }
          </p>

          <p className="smartwood-description" style={{ fontSize: '1.1rem', color: 'var(--text-soft)', marginBottom: '40px', maxWidth: '600px', lineHeight: 1.8 }}>
            {isRtl
              ? 'من خلال دمج تكنولوجيا CNC الأكثر تقدماً في العالم مع نظام إدارة Odoo المتطور، نضمن رحلة سلسة من التصميم المبدئي إلى التنفيذ الخالي من العيوب. مهمتنا هي تزويد السوق الكويتي بحلول خشبية مستدامة وراقية تنافس المعايير العالمية.'
              : 'By integrating the world’s most advanced CNC technology with the sophisticated Odoo management system, we ensure a seamless journey from conceptual design to flawless execution. Our mission is to provide the Kuwaiti market with sustainable, high-end wood solutions that rival international standards.'
            }
          </p>

          <div className="hero-main-actions d-flex gap-3">
            <a href="/shop" className="hero-secondary-btn" style={{ padding: '16px 40px', borderRadius: '12px' }}>
              {isRtl ? 'استكشف تصاميمنا' : 'DISCOVER DESIGNS'}
            </a>
          </div>

        </div>

        {/* Right Side: Process edge-to-edge image */}
        <div className="split-right">
          <div className="split-right-img-container">
            <img
              src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/BEEZ%20BLUE.jpg"
              alt={isRtl ? 'صناعة الأثاث' : 'Furniture Crafting'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, rgba(0,0,0,0.5) 0%, transparent 100%)' }}></div>

            {/* Corner Text overlay inside the image */}
            <div style={{ position: 'absolute', bottom: '40px', left: '40px', color: 'rgba(255,255,255,0.9)' }}>
              <span style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>02 /</span>
              <h3 style={{ fontSize: '2rem', fontWeight: 300, margin: 0 }}>MADE IN<br />KUWAIT</h3>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Why Smartwood? (The Competitive Edge) */}
      <section style={{ padding: '100px 5%' }}>
        <div className="smartwood-story-panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 400px' }}>
            <span className="section-kicker">{isRtl ? 'الميزة التنافسية' : 'The Competitive Edge'}</span>
            <h2 className="section-title" style={{ marginBottom: '30px' }}>{isRtl ? 'لماذا سمارت وود؟' : 'Why Smartwood?'}</h2>

            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <li style={{ display: 'flex', gap: '16px' }}>
                <i className="bi bi-cpu" style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}></i>
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1.2rem' }}>{isRtl ? 'دقة CNC المتقدمة' : 'Advanced CNC Precision'}</h4>
                  <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: '0.95rem' }}>{isRtl ? 'آلات آلية بالكامل تضمن دقة 100٪.' : 'Fully automated machinery ensures 100% accuracy in every cut, carve, and finish.'}</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '16px' }}>
                <i className="bi bi-geo-alt" style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}></i>
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1.2rem' }}>{isRtl ? 'بفخر صُنع في الكويت' : 'Proudly Made in Kuwait'}</h4>
                  <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: '0.95rem' }}>{isRtl ? 'علامة وطنية تلتزم بالتميز المحلي وتسليم أسرع.' : 'A national brand committed to local excellence, faster delivery, and superior support.'}</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '16px' }}>
                <i className="bi bi-tree" style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}></i>
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1.2rem' }}>{isRtl ? 'مصادر مواد فاخرة' : 'Premium Material'}</h4>
                  <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: '0.95rem' }}>{isRtl ? 'خشب مستدام تم اختباره لتحمل مناخ الخليج.' : 'Sourcing the finest sustainable woods tested to withstand the Gulf’s unique climate.'}</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '16px' }}>
                <i className="bi bi-clock-history" style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}></i>
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1.2rem' }}>{isRtl ? 'تجربة سلسة' : 'Streamlined Experience'}</h4>
                  <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: '0.95rem' }}>{isRtl ? 'سير عمل رقمي يضمن الشفافية والدقة.' : 'Digitalized production workflow guaranteeing transparency, precision, and on-time delivery.'}</p>
                </div>
              </li>
            </ul>
          </div>

          <div style={{ flex: '1 1 400px' }} className="story-side-grid">
            <img src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/MIST%20OFF-WHITE.jpg" alt="Factory" />
            <img src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/MIST%20BLUE.jpg" alt="Wood Detail" />
            <img src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/BEEZ%20OFF-WHITE.jpg" alt="Design" />
          </div>
        </div>
      </section>

    </main>
  );
}
