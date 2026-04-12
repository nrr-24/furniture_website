'use client';

import { useLanguage } from '../../data/LanguageContext';

export default function ContactPage() {
  const { t, isRtl } = useLanguage();

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh', justifyContent: 'center', alignItems: 'center', padding: '40px 60px' }}>
      <section id="contact" style={{ maxWidth: '1000px', width: '100%', background: 'transparent', textAlign: 'center' }}>
        <h2 className="smartwood-title" style={{ marginBottom: '20px', fontSize: '3.5rem' }}>{isRtl ? 'تواصل معنا' : 'Contact Us'}</h2>
        <p style={{ color: 'var(--text-soft)', maxWidth: '600px', margin: '0 auto 60px', fontSize: '1.1rem', lineHeight: '1.6' }}>
          {isRtl ? 'نحن هنا لتحويل رؤيتك إلى واقع. تواصل معنا اليوم لتحصل على استشارتك.' : 'We are here to turn your vision into reality. Reach out to us today for a consultation.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid var(--line-soft)' }}>
              <i className="bi bi-building" style={{ fontSize: '1.5rem' }}></i>
            </div>
            <h5 style={{ margin: '0 0 8px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>{isRtl ? 'العنوان' : 'Address'}</h5>
            <p style={{ color: 'var(--text-soft)', margin: 0, fontSize: '0.95rem' }}>[Add Factory/Showroom Location in Kuwait]</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid var(--line-soft)' }}>
              <i className="bi bi-telephone" style={{ fontSize: '1.5rem' }}></i>
            </div>
            <h5 style={{ margin: '0 0 8px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>{isRtl ? 'الهاتف' : 'Phone'}</h5>
            <p style={{ color: 'var(--text-soft)', margin: 0, fontSize: '0.95rem' }}>[Add Contact Number]</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid var(--line-soft)' }}>
              <i className="bi bi-envelope" style={{ fontSize: '1.5rem' }}></i>
            </div>
            <h5 style={{ margin: '0 0 8px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>{isRtl ? 'البريد الإلكتروني' : 'Email'}</h5>
            <p style={{ color: 'var(--text-soft)', margin: 0, fontSize: '0.95rem' }}>[Add Official Email Address]</p>
          </div>
        </div>
      </section>
    </main>
  );
}
