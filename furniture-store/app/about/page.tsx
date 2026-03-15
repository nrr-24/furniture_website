'use client';

import { useLanguage } from '../../data/LanguageContext';

export default function AboutPage() {
  const { t, isRtl } = useLanguage();
  return (
    <main style={{ paddingTop: '120px', minHeight: '80vh' }} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container">
        <h1 className="reveal active">{t('craftsmanship')}</h1>
        <p className="reveal active">Learn more about our heritage and quality standards.</p>
      </div>
    </main>
  );
}
