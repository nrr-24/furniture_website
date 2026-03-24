'use client';

import React, { useState } from 'react';
import { useLanguage } from '../data/LanguageContext';
import { useAuth } from '../data/AuthContext';
import { useCart } from '../data/CartContext';
import { FurnitureItem } from '../data/furnitureData';
import { useFurniture } from '../data/FurnitureContext';
import FurnitureManager from '../components/FurnitureManager';

export default function HomePage() {
  const { t, isRtl } = useLanguage();
  const { isAdmin, isCustomer } = useAuth();
  const { addToCart } = useCart();
  const { items, initialized } = useFurniture();
  const [showManager, setShowManager] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);

  if (!initialized) return null;

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const categories = Object.keys(groupedItems);

  const handleScrollToCategory = (categoryId: string) => {
    const el = document.getElementById(`category-${categoryId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. Hero Section (The First Impression) */}
      <section className="lumiere-split" style={{ minHeight: 'calc(100vh - 80px)' }}>
        {/* Left Side: Copy, Gallery, Actions */}
        <div className="split-left" style={{ justifyContent: 'center', alignItems: 'flex-start', textAlign: isRtl ? 'right' : 'left' }}>

          <h1 className="smartwood-title" style={{ fontSize: 'clamp(2.5rem, 4vw, 4.5rem)', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: '24px', lineHeight: 1.1 }}>
            <span style={{ fontWeight: 800 }}>{isRtl ? 'سمارت وود:' : 'Smartwood:'}</span>
            <br />
            {isRtl ? 'حيث تلتقي أناقة الطبيعة بأحدث تقنيات الدقة.' : 'Where Nature’s Elegance Meets Cutting-Edge Precision.'}
          </h1>

          <p className="smartwood-description" style={{ fontSize: '1.2rem', color: 'var(--text-soft)', marginBottom: '40px', maxWidth: '600px' }}>
            {isRtl 
              ? 'إعادة تعريف مفهوم النجارة الفاخرة في الكويت. نمزج بين الحرفية المتقنة والتكنولوجيا المتقدمة لنبتكر تصاميم داخلية تعبر عن قصتك.' 
              : 'Redefining luxury woodworking in Kuwait. We blend master craftsmanship with advanced technology to create bespoke interiors that tell your story.'}
          </p>

          <div className="hero-main-actions d-flex gap-3">
            <a href="/shop" className="hero-primary-btn" style={{ padding: '16px 40px', background: 'var(--text-main)', color: 'var(--bg-main)', borderRadius: '12px' }}>
              {isRtl ? 'استكشف مجموعتنا' : 'Explore Our Collection'}
            </a>
            <a href="#contact" className="hero-secondary-btn" style={{ padding: '16px 40px', borderRadius: '12px' }}>
              {isRtl ? 'اطلب استشارة' : 'Request a Consultation'}
            </a>
          </div>

        </div>

        {/* Right Side: Vast Edge Image */}
        <div className="split-right">
          <div className="split-right-img-container">
            <img
              src="https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80"
              alt={isRtl ? 'أثاث فاخر' : 'Luxury Furniture'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, rgba(0,0,0,0.3) 0%, transparent 100%)' }}></div>

            <div style={{ position: 'absolute', bottom: '40px', left: '40px', color: 'rgba(255,255,255,0.9)' }}>
              <span style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>01 /</span>
              <h3 style={{ fontSize: '2rem', fontWeight: 300, margin: 0 }}>{isRtl ? 'تميز لا يضاهى' : 'BESPOKE LUXURY'}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Services (Bespoke Solutions) */}
      <section style={{ padding: '100px 5%', background: 'var(--bg-panel)' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span className="section-kicker">{isRtl ? 'حلول مصممة خصيصاً' : 'Bespoke Solutions'}</span>
          <h2 className="section-title">{isRtl ? 'خدماتنا' : 'Our Services'}</h2>
          <p style={{ color: 'var(--text-soft)', maxWidth: '600px', margin: '0 auto' }}>
            {isRtl ? 'نقدم مجموعة متكاملة من الخدمات مع التركيز التام على الجودة.' : 'Showcasing our core offerings with a relentless focus on quality.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {/* Service 1 */}
          <div className="furniture-card">
            <img src="https://images.unsplash.com/photo-1556910103-1c02745a8728?auto=format&fit=crop&w=600&q=80" alt="Kitchens" />
            <div className="furniture-card-body">
              <h3>{isRtl ? 'مطابخ فاخرة' : 'Luxury Kitchens'}</h3>
              <p>{isRtl ? 'ذكية، عملية، وبجمال يخطف الأنفاس.' : 'Smart, ergonomic, and breathtakingly beautiful. Designed to be the heart of the home.'}</p>
            </div>
          </div>
          {/* Service 2 */}
          <div className="furniture-card">
            <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80" alt="Doors" />
            <div className="furniture-card-body">
              <h3>{isRtl ? 'أبواب معمارية' : 'Architectural Doors'}</h3>
              <p>{isRtl ? 'مداخل فخمة وأبواب داخلية مصممة للتميز الصوتي.' : 'Grand entrances and internal doors engineered for acoustic excellence and timeless style.'}</p>
            </div>
          </div>
          {/* Service 3 */}
          <div className="furniture-card">
            <img src="https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=600&q=80" alt="Wardrobes" />
            <div className="furniture-card-body">
              <h3>{isRtl ? 'خزائن وغرف ملابس' : 'Bespoke Wardrobes'}</h3>
              <p>{isRtl ? 'حلول تخزين مخصصة تعظم المساحة برفاهية.' : 'Custom-built storage solutions that maximize space while maintaining an aura of refined luxury.'}</p>
            </div>
          </div>
          {/* Service 4 */}
          <div className="furniture-card">
            <img src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=80" alt="Joinery" />
            <div className="furniture-card-body">
              <h3>{isRtl ? 'أعمال نادرة وتكسية جدران' : 'Premium Joinery'}</h3>
              <p>{isRtl ? 'من الألواح الجدارية المعقدة إلى الأسقف الزخرفية.' : 'From intricate wall panels to decorative ceilings, adding warmth and sophistication.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why Smartwood? (The Competitive Edge) */}
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
            <img src="https://images.unsplash.com/photo-1622372736546-2e19d20c5b36?auto=format&fit=crop&w=600&q=80" alt="Factory" />
            <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=300&q=80" alt="Wood Detail" />
            <img src="https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=300&q=80" alt="Design" />
          </div>
        </div>
      </section>

      {/* 6. Contact Us */}
      <footer id="contact" style={{ padding: '80px 5%', background: '#0a144c', borderTop: '1px solid var(--line-soft)', textAlign: 'center' }}>
        <h2 className="section-title" style={{ marginBottom: '20px' }}>{isRtl ? 'تواصل معنا' : 'Contact Us'}</h2>
        <p style={{ color: 'var(--text-soft)', maxWidth: '600px', margin: '0 auto 40px' }}>
          {isRtl ? 'نحن هنا لتحويل رؤيتك إلى واقع. تواصل معنا اليوم لتحصل على استشارتك.' : 'We are here to turn your vision into reality. Reach out to us today for a consultation.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
          <div>
            <i className="bi bi-building" style={{ fontSize: '2rem', display: 'block', marginBottom: '16px' }}></i>
            <h5 style={{ margin: '0 0 8px', fontWeight: 600 }}>{isRtl ? 'العنوان' : 'Address'}</h5>
            <p style={{ color: 'var(--text-soft)', margin: 0 }}>[Add Factory/Showroom Location in Kuwait]</p>
          </div>
          <div>
            <i className="bi bi-telephone" style={{ fontSize: '2rem', display: 'block', marginBottom: '16px' }}></i>
            <h5 style={{ margin: '0 0 8px', fontWeight: 600 }}>{isRtl ? 'الهاتف' : 'Phone'}</h5>
            <p style={{ color: 'var(--text-soft)', margin: 0 }}>[Add Contact Number]</p>
          </div>
          <div>
            <i className="bi bi-envelope" style={{ fontSize: '2rem', display: 'block', marginBottom: '16px' }}></i>
            <h5 style={{ margin: '0 0 8px', fontWeight: 600 }}>{isRtl ? 'البريد الإلكتروني' : 'Email'}</h5>
            <p style={{ color: 'var(--text-soft)', margin: 0 }}>[Add Official Email Address]</p>
          </div>
        </div>
      </footer>

    </main>
  );
}
