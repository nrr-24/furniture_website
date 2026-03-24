'use client';

import { useLanguage } from '../../data/LanguageContext';

export default function ContactPage() {
  const { t, isRtl } = useLanguage();

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', padding: '40px 60px' }}>
      <footer id="contact" style={{ padding: '40px 5%', background: 'transparent', textAlign: 'center', margin: 'auto' }}>
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
