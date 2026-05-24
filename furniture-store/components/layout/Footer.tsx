'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../data/LanguageContext';

/* ============================================================
 * Footer (Smartwood 2026 redesign)
 *
 * One dark espresso rounded card containing, top→bottom:
 *   - "Stay Inspired" newsletter section (mail icon + heading + email form)
 *   - Hairline divider
 *   - Brand row: SMARTWOOD wordmark + copyright (left), social icons (right)
 *
 * Desktop adds a thin light meta-bar above the card with
 * Showroom / Contact / FAQ / Corporate links (per image 3).
 *
 * Newsletter submit is currently UI-only (shows a thank-you message and
 * clears the field) — wire to /api/newsletter when an endpoint exists.
 * ============================================================ */
export default function Footer() {
  const { t, isRtl, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: POST to a newsletter endpoint
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3500);
  };

  const year = new Date().getFullYear();
  const arrowIcon = isRtl ? 'bi-arrow-left' : 'bi-arrow-right';

  const META_LINKS = [
    { href: '/contact', en: 'Showroom',  ar: 'صالة العرض' },
    { href: '/contact', en: 'Contact',   ar: 'تواصل' },
    { href: '/contact', en: 'FAQ',       ar: 'الأسئلة الشائعة' },
    { href: '/contact', en: 'Corporate', ar: 'الشركة' },
  ];

  return (
    <footer className="sw-footer" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Desktop-only thin meta bar above the dark card. Matches the
          horizontal links bar shown in image 3. */}
      <div className="sw-footer-meta d-none d-lg-flex">
        <span className="sw-footer-meta-copy">
          © {year} {isRtl ? 'مصنع سمارت وود' : 'SmartWood Factory'}
        </span>
        <nav className="sw-footer-meta-links" aria-label={isRtl ? 'روابط الموقع' : 'Site links'}>
          {META_LINKS.map((l, i) => (
            <span key={l.en} className="sw-footer-meta-link-wrap">
              <Link href={l.href} className="sw-footer-meta-link">
                {isRtl ? l.ar : l.en}
              </Link>
              {i < META_LINKS.length - 1 && <span className="sw-footer-meta-sep" aria-hidden="true">|</span>}
            </span>
          ))}
        </nav>
        <div className="sw-footer-meta-social" aria-label={isRtl ? 'وسائل التواصل' : 'Social'}>
          <a href="https://www.instagram.com/smartwood_kw/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <i className="bi bi-instagram"></i>
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <i className="bi bi-twitter-x"></i>
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <i className="bi bi-linkedin"></i>
          </a>
        </div>
      </div>

      {/* === Dark espresso card === */}
      <div className="sw-footer-shell">
        <div className="sw-footer-card">
          {/* --- Newsletter --- */}
          <div className="sw-footer-newsletter">
            <div className="sw-footer-newsletter-head">
              <span className="sw-footer-newsletter-icon" aria-hidden="true">
                <i className="bi bi-envelope"></i>
              </span>
              <div className="sw-footer-newsletter-headtext">
                <h3 className="sw-footer-newsletter-title">
                  {isRtl ? 'ابقَ ملهَماً' : 'Stay Inspired'}
                </h3>
                <p className="sw-footer-newsletter-sub">
                  {isRtl
                    ? 'اشترك ليصلك أحدث التصاميم والمستجدات من سمارت وود.'
                    : 'Subscribe to get the latest designs and updates from SmartWood.'}
                </p>
              </div>
            </div>

            <form className="sw-footer-newsletter-form" onSubmit={handleSubmit}>
              <input
                type="email"
                required
                placeholder={isRtl ? 'بريدك الإلكتروني' : 'Enter your email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label={isRtl ? 'البريد الإلكتروني' : 'Email address'}
              />
              <button type="submit" aria-label={isRtl ? 'اشترك' : 'Subscribe'}>
                <i className={`bi ${arrowIcon}`}></i>
              </button>
            </form>

            {subscribed && (
              <span className="sw-footer-thanks">
                {isRtl ? 'شكراً لاشتراكك!' : 'Thanks for subscribing!'}
              </span>
            )}
          </div>

          <div className="sw-footer-divider" aria-hidden="true" />

          {/* --- Brand row --- */}
          <div className="sw-footer-brandbar">
            <div className="sw-footer-brand">
              <Link href="/" className="sw-footer-brand-logo" aria-label="Smartwood">
                <img
                  src={`/images/LOGO/smartwood-${language}-white.svg`}
                  alt="Smartwood"
                />
              </Link>
              <span className="sw-footer-brand-copy">
                © {isRtl ? 'مصنع سمارت وود' : 'SmartWood Factory'}
                <br />
                {isRtl ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
              </span>
            </div>

            <div className="sw-footer-social" aria-label={isRtl ? 'تواصل اجتماعي' : 'Social'}>
              <a href="https://www.instagram.com/smartwood_kw/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
