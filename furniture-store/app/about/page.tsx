'use client';

import { useLanguage } from '../../data/LanguageContext';

export default function AboutPage() {
  const { t, isRtl } = useLanguage();
  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} className="lumiere-split" style={{ flex: 1, minHeight: 0 }}>
        
        {/* Left Side: Copy & Info */}
        <div className="split-left" style={{ justifyContent: 'center' }}>
          
          <h1 className="smartwood-title" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: '24px' }}>
            {isRtl ? 'إرث من' : 'A LEGACY OF'}
            <br />
            <span style={{ fontWeight: 600 }}>{t('craftsmanship').toUpperCase()}</span>
          </h1>
          
          <p className="smartwood-description" style={{ fontSize: '1.2rem', color: 'var(--text-soft)', marginBottom: '20px', maxWidth: '500px', lineHeight: 1.8 }}>
            {isRtl 
              ? 'في سمارت وود، نؤمن بأن الأثاث ليس مجرد قطع خشبية، بل هو فن يعيش معك. نركز اهتمامنا على استخدام المواد الطبيعية الفاخرة لإنتاج قطع استثنائية.' 
              : 'At Smartwood, we believe furniture is more than just wood and fabric—it is living art that adapts to your sanctuary. We focus relentlessly on premium material selection to produce exceptional, enduring statements.'
            }
          </p>

          <p className="smartwood-description" style={{ fontSize: '1.2rem', color: 'var(--text-soft)', marginBottom: '40px', maxWidth: '500px', lineHeight: 1.8 }}>
            {isRtl 
              ? 'يتم اختيار كل قطعة خشب بعناية، ويتم نحتها على يد محترفين يمتلكون عقوداً من الخبرة لضمان الجودة العالية.' 
              : 'Our craftsmen have spent decades mastering their trade. Every curve is carved by hand and every surface polished meticulously to uncover the deep, natural beauty hidden within.'
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
              src="https://images.unsplash.com/photo-1595514535311-665e89a5ad3d?auto=format&fit=crop&w=1200&q=80" 
              alt={isRtl ? 'صناعة الأثاث' : 'Furniture Crafting'} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, rgba(0,0,0,0.5) 0%, transparent 100%)' }}></div>
            
            {/* Corner Text overlay inside the image */}
            <div style={{ position: 'absolute', bottom: '40px', left: '40px', color: 'rgba(255,255,255,0.9)' }}>
              <span style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>02 /</span>
              <h3 style={{ fontSize: '2rem', fontWeight: 300, margin: 0 }}>ARTISAN<br/>WORKSHOP</h3>
            </div>
          </div>
        </div>

    </main>
  );
}
