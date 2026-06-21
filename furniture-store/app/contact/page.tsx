'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '../../data/LanguageContext';
import { useAuth } from '../../data/AuthContext';
import Footer from '../../components/layout/Footer';
import { useScrollReveal } from '../../lib/useScrollReveal';

type Category = 'business_letter' | 'consultation' | 'quote' | 'after_sales' | 'general' | 'other';

const CATEGORY_OPTIONS: { value: Category; en: string; ar: string }[] = [
  { value: 'quote', en: 'Quote request', ar: 'طلب عرض سعر' },
  { value: 'consultation', en: 'Consultation', ar: 'استشارة' },
  { value: 'business_letter', en: 'Business letter', ar: 'خطاب تجاري' },
  { value: 'after_sales', en: 'After-sales service', ar: 'خدمة ما بعد البيع' },
  { value: 'general', en: 'General inquiry', ar: 'استفسار عام' },
  { value: 'other', en: 'Other', ar: 'أخرى' },
];

export default function ContactPage() {
  const { isRtl } = useLanguage();
  const { user } = useAuth();
  const params = useSearchParams();

  // Pre-fill hooks from the /contact?productId=X&product=Y query
  const queryProductId = params.get('productId') || '';
  const queryProduct = params.get('product') || '';

  const [category, setCategory] = useState<Category>(queryProduct ? 'quote' : 'general');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [clientNumber, setClientNumber] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ kind: 'idle' | 'ok' | 'err'; text?: string }>({ kind: 'idle' });

  // If a product query param is present, pre-fill the message with useful context
  useEffect(() => {
    if (queryProduct && !message) {
      const prefix = isRtl
        ? `أرغب في الحصول على عرض سعر لـ: ${queryProduct}\n\n`
        : `I'd like a quote for: ${queryProduct}\n\n`;
      setMessage(prefix);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setStatus({ kind: 'idle' });
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          fullName,
          email,
          phone,
          clientNumber: clientNumber || null,
          message,
          productId: queryProductId || null,
          productName: queryProduct || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.error) {
        setStatus({ kind: 'err', text: json.error || `Error ${res.status}` });
        return;
      }
      setStatus({
        kind: 'ok',
        text: isRtl
          ? 'شكراً لتواصلك! لقد استلمنا رسالتك وسنرد عليك قريباً.'
          : "Thanks! We've received your message and will be in touch shortly.",
      });
      // Clear form on success
      setCategory('general');
      setFullName(user?.full_name || '');
      setEmail(user?.email || '');
      setPhone(user?.phone_number || '');
      setClientNumber('');
      setMessage('');
    } catch (err) {
      setStatus({ kind: 'err', text: err instanceof Error ? err.message : 'Request failed' });
    } finally {
      setSubmitting(false);
    }
  };

  useScrollReveal();

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} className="app-content about-page-theme" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: 'clamp(48px, 8vw, 80px) clamp(16px, 5vw, 60px)' }}>
        <section id="contact" style={{ maxWidth: '1000px', width: '100%', textAlign: 'center' }}>
          <h2 className="smartwood-title sw-reveal-x" style={{ marginBottom: '20px', fontSize: 'clamp(2rem, 7vw, 3.5rem)' }}>
            {isRtl ? 'تواصل معنا' : 'Contact Us'}
          </h2>
          <p className="sw-reveal-x" style={{ color: 'rgba(42, 32, 24, 0.7)', maxWidth: '600px', margin: '0 auto 40px', fontSize: '1.05rem', lineHeight: '1.6' }}>
            {isRtl
              ? 'نحن هنا لتحويل رؤيتك إلى واقع. تواصل معنا اليوم لتحصل على استشارتك.'
              : 'We are here to turn your vision into reality. Reach out to us today for a consultation.'}
          </p>

          <div className="contact-info-row">
            <a href="https://share.google/JkdWv1E5o0GEpumZ6" target="_blank" rel="noopener noreferrer" className="contact-info-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="contact-info-icon">
                <i className="bi bi-geo-alt-fill" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <h5 className="contact-info-label">{isRtl ? 'الموقع' : 'Location'}</h5>
              <p className="contact-info-text">{isRtl ? 'الكويت' : 'Kuwait'}</p>
            </a>

            <a href="https://wa.me/96595502860" target="_blank" rel="noopener noreferrer" className="contact-info-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="contact-info-icon">
                <i className="bi bi-whatsapp" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <h5 className="contact-info-label">{isRtl ? 'واتساب' : 'WhatsApp'}</h5>
              <p className="contact-info-text" dir="ltr">+965 9550 2860</p>
            </a>

            <a href="mailto:contact@smartwoodkw.com" className="contact-info-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="contact-info-icon">
                <i className="bi bi-envelope-fill" style={{ fontSize: '1.5rem' }}></i>
              </div>
              <h5 className="contact-info-label">{isRtl ? 'البريد الإلكتروني' : 'Email'}</h5>
              <p className="contact-info-text">contact@smartwoodkw.com</p>
            </a>
          </div>
        </section>

        {/* Contact form — cream/navy palette matching the homepage hero and product detail card */}
        {/* <section className="contact-form-panel" style={{ maxWidth: '720px', width: '100%', padding: 'clamp(28px, 4vw, 40px)', textAlign: isRtl ? 'right' : 'left' }}>
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <h3 className="contact-form-title">
              {isRtl ? 'أرسل رسالة' : 'Send us a message'}
            </h3>
            <p className="contact-form-subtitle">
              {isRtl ? 'نرد عادةً خلال ٢٤ ساعة في أيام العمل.' : 'We typically reply within 24 hours on weekdays.'}
            </p>
          </div>

          {queryProduct && (
            <div className="contact-quote-banner">
              <i className="bi bi-star-fill" style={{ color: '#b58a00', marginRight: isRtl ? 0 : 8, marginLeft: isRtl ? 8 : 0 }} />
              {isRtl ? `عرض سعر لـ: ${queryProduct}` : `Quote request for: ${queryProduct}`}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <div className="col-12">
                <label className="contact-label">{isRtl ? 'نوع الطلب' : 'Subject / Category'} *</label>
                <select
                  className="contact-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  required
                >
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {isRtl ? opt.ar : opt.en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="contact-label">{isRtl ? 'الاسم الكامل' : 'Full name'} *</label>
                <input
                  type="text"
                  className="contact-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isRtl ? 'اسمك' : 'Your name'}
                  maxLength={120}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="contact-label">{isRtl ? 'البريد الإلكتروني' : 'Email'} *</label>
                <input
                  type="email"
                  className="contact-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  maxLength={200}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="contact-label">{isRtl ? 'رقم الهاتف' : 'Phone'} *</label>
                <input
                  type="tel"
                  className="contact-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+965 ..."
                  maxLength={40}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="contact-label">
                  {isRtl ? 'رقم العميل' : 'Client number'}{' '}
                  <span style={{ color: 'var(--text-soft)', fontWeight: 400, fontSize: '0.78rem' }}>
                    {isRtl ? '(إن وُجد)' : '(if you have one)'}
                  </span>
                </label>
                <input
                  type="text"
                  className="contact-input"
                  value={clientNumber}
                  onChange={(e) => setClientNumber(e.target.value)}
                  placeholder={isRtl ? 'اختياري' : 'Optional'}
                  maxLength={40}
                />
              </div>

              <div className="col-12">
                <label className="contact-label">{isRtl ? 'رسالتك' : 'Message'} *</label>
                <textarea
                  className="contact-input"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isRtl ? 'اكتب تفاصيل طلبك هنا...' : 'Tell us about your project or inquiry...'}
                  maxLength={4000}
                  required
                />
                <div className="contact-counter" style={{ textAlign: isRtl ? 'left' : 'right' }}>
                  {message.length} / 4000
                </div>
              </div>

              <div className="col-12 d-flex flex-column align-items-center gap-3">
                {status.kind === 'err' && (
                  <div className="contact-banner contact-banner-err">
                    {status.text}
                  </div>
                )}
                {status.kind === 'ok' && (
                  <div className="contact-banner contact-banner-ok">
                    <i className="bi bi-check-circle-fill me-2" />
                    {status.text}
                  </div>
                )}
                <button
                  type="submit"
                  className="contact-submit"
                  disabled={submitting}
                >
                  {submitting
                    ? (isRtl ? 'جارٍ الإرسال...' : 'Sending...')
                    : (isRtl ? 'إرسال الرسالة' : 'Send Message')}
                </button>
              </div>
            </div>
          </form>
        </section> */}
      </div>
      <Footer />

      <style jsx global>{`
        /* Address / Phone / Email card row — equal-width columns so the row
           stays visually balanced regardless of how long the placeholder text
           is, and stays centered within the page. */
        .contact-info-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 220px));
          justify-content: center;
          gap: clamp(20px, 5vw, 60px);
          margin: 0 auto 60px;
          max-width: 100%;
        }
        @media (max-width: 700px) {
          .contact-info-row {
            grid-template-columns: 1fr;
            max-width: 320px;
          }
        }
        .contact-info-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-width: 0;
        }
        .contact-info-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(42, 32, 24, 0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          border: 1px solid rgba(42, 32, 24, 0.12);
          color: var(--text-main);
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                      background 0.35s ease, border-color 0.35s ease;
        }
        .contact-info-card:hover .contact-info-icon {
          transform: translateY(-4px);
          background: var(--text-main);
          border-color: var(--text-main);
          color: var(--bg-main);
        }
        @media (prefers-reduced-motion: reduce) {
          .contact-info-card:hover .contact-info-icon {
            transform: none;
          }
        }
        .contact-info-label {
          margin: 0 0 8px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-size: 0.9rem;
          text-align: center;
        }
        .contact-info-text {
          color: rgba(42, 32, 24, 0.6);
          margin: 0;
          font-size: 0.95rem;
          text-align: center;
          /* Allow long placeholder text to wrap inside the column instead
             of stretching the column wider than its siblings. */
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        /* Contact form — cream/navy palette matching the homepage hero & product detail card.
           Scoped tokens so no other page is affected. */
        .contact-form-panel {
          --cf-ink: var(--text-main);
          --cf-ink-soft: rgba(42, 32, 24, 0.62);
          --cf-line: rgba(42, 32, 24, 0.14);
          --cf-surface: var(--sand-soft);

          background: var(--cf-surface);
          color: var(--cf-ink);
          border: 1px solid var(--cf-line);
          border-radius: 20px;
        }

        .contact-form-title {
          /* margin-inline: auto centers the block itself when Bootstrap's
             text-wrap: balance shrinks the heading's box to its text width. */
          margin: 0 auto 8px;
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--cf-ink);
          text-align: center;
        }
        .contact-form-subtitle {
          /* Same trick — text-wrap: pretty on <p> elements collapses the
             box to content width, so we center it explicitly. */
          margin: 0 auto;
          font-size: 0.92rem;
          color: var(--cf-ink-soft);
          text-align: center;
        }

        .contact-form-panel .contact-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--cf-ink-soft);
          margin: 0 0 6px;
        }
        .contact-form-panel .contact-input {
          width: 100%;
          padding: 12px 14px;
          background: #fff;
          border: 1px solid var(--cf-line);
          border-radius: 10px;
          color: var(--cf-ink);
          font-size: 0.95rem;
          font-family: inherit;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .contact-form-panel .contact-input:focus {
          outline: none;
          border-color: var(--cf-ink);
          box-shadow: 0 0 0 3px rgba(42, 32, 24, 0.18);
        }
        .contact-form-panel .contact-input::placeholder {
          color: rgba(42, 32, 24, 0.4);
        }

        .contact-form-panel select.contact-input {
          appearance: none;
          /* Chevron stroked in navy (var(--text-main)) — URL-encoded for data URI */
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230d1a63' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 16px;
          padding-right: 40px;
        }
        [dir="rtl"] .contact-form-panel select.contact-input {
          background-position: left 14px center;
          padding-right: 14px;
          padding-left: 40px;
        }
        .contact-form-panel textarea.contact-input {
          resize: vertical;
          min-height: 120px;
          line-height: 1.5;
        }

        .contact-form-panel .contact-counter {
          font-size: 0.75rem;
          color: var(--cf-ink-soft);
          margin-top: 4px;
        }

        .contact-form-panel .contact-quote-banner {
          margin-bottom: 20px;
          padding: 12px 16px;
          background: rgba(255, 199, 0, 0.15);
          border: 1px solid rgba(181, 138, 0, 0.45);
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #6b5300;
        }

        .contact-form-panel .contact-banner {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.9rem;
          text-align: center;
          font-weight: 600;
        }
        .contact-form-panel .contact-banner-err {
          background: rgba(217, 58, 58, 0.1);
          border: 1px solid rgba(217, 58, 58, 0.45);
          color: #a82525;
        }
        .contact-form-panel .contact-banner-ok {
          background: rgba(40, 140, 80, 0.12);
          border: 1px solid rgba(40, 140, 80, 0.45);
          color: #1f6b3a;
        }

        .contact-form-panel .contact-submit {
          min-width: 220px;
          padding: 14px 28px;
          background: var(--cf-ink);
          color: var(--cf-surface);
          border: none;
          border-radius: 999px;
          font-size: 0.98rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
          box-shadow: 0 8px 22px rgba(139, 111, 78, 0.35);
        }
        .contact-form-panel .contact-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 30px rgba(139, 111, 78, 0.5);
        }
        .contact-form-panel .contact-submit:disabled {
          opacity: 0.65;
          cursor: wait;
        }
      `}</style>
    </main>
  );
}
