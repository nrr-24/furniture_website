'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../data/LanguageContext';

export default function Footer() {
  const { t, isRtl, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3200);
    }
  };

  const year = new Date().getFullYear();

  return (
    <footer className="sw-footer" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="sw-footer-main">
        <div className="sw-footer-left">
          <Link href="/" className="sw-footer-logo" aria-label="Smartwood">
            <img
              src={`/images/LOGO/smartwood-${language}-white.svg`}
              alt="Smartwood"
            />
          </Link>

          <div className="sw-footer-social" aria-label={isRtl ? 'وسائل التواصل' : 'Contact'}>
            <a href="https://www.instagram.com/smartwood_kw/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="bi bi-instagram"></i>
            </a>
            <a href="https://share.google/JkdWv1E5o0GEpumZ6" target="_blank" rel="noopener noreferrer" aria-label="Location">
              <i className="bi bi-geo-alt-fill"></i>
            </a>
            <a href="https://wa.me/96595502860" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <i className="bi bi-whatsapp"></i>
            </a>
            <a href="mailto:contact@smartwoodkw.com" aria-label="Email">
              <i className="bi bi-envelope-fill"></i>
            </a>
          </div>

          {/* Newsletter form commented out
          <p className="sw-footer-newsletter-text">
            {isRtl
              ? 'اشترك لتصلك آخر المجموعات والعروض الحصرية من سمارت وود.'
              : 'Stay updated with the latest collections and exclusive offers from Smartwood.'}
          </p>

          <form className="sw-footer-newsletter" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              placeholder={isRtl ? 'البريد الإلكتروني' : 'E-mail'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label={isRtl ? 'البريد الإلكتروني' : 'Email'}
            />
            <button type="submit" aria-label={isRtl ? 'اشترك' : 'Subscribe'}>
              <i className={isRtl ? 'bi bi-arrow-left' : 'bi bi-arrow-right'}></i>
            </button>
          </form>
          {subscribed && (
            <span className="sw-footer-thanks">
              {isRtl ? 'شكراً لاشتراكك!' : 'Thanks for subscribing!'}
            </span>
          )}
          */}
        </div>

        <nav className="sw-footer-nav" aria-label={isRtl ? 'روابط الموقع' : 'Sitemap'}>
          <Link href="/" className="sw-footer-nav-link">
            <span>{isRtl ? 'الرئيسية' : 'Home'}</span>
            <i className={isRtl ? 'bi bi-chevron-left' : 'bi bi-chevron-right'}></i>
          </Link>
          <Link href="/shop" className="sw-footer-nav-link">
            <span>{isRtl ? 'المجموعات' : 'Collections'}</span>
            <i className={isRtl ? 'bi bi-chevron-left' : 'bi bi-chevron-right'}></i>
          </Link>
          <Link href="/about" className="sw-footer-nav-link">
            <span>{isRtl ? 'الحرفية' : 'Craftsmanship'}</span>
            <i className={isRtl ? 'bi bi-chevron-left' : 'bi bi-chevron-right'}></i>
          </Link>
          <Link href="/contact" className="sw-footer-nav-link">
            <span>{isRtl ? 'تواصل معنا' : 'Contact Us'}</span>
            <i className={isRtl ? 'bi bi-chevron-left' : 'bi bi-chevron-right'}></i>
          </Link>
        </nav>
      </div>

      <div className="sw-footer-bar">
        <span className="sw-footer-copy">
          © {year} {isRtl ? 'سمارت وود. جميع الحقوق محفوظة.' : 'Smartwood. All rights reserved.'}
        </span>
        <div className="sw-footer-legal">
          <Link href="/contact">{isRtl ? 'الأسئلة الشائعة' : 'FAQ'}</Link>
          <Link href="/contact">{isRtl ? 'الشحن والإرجاع' : 'Shipping & Returns'}</Link>
          <Link href="/contact">{isRtl ? 'الضمان' : 'Warranty'}</Link>
          <Link href="/contact">{isRtl ? 'الشروط والأحكام' : 'Terms & Conditions'}</Link>
          <Link href="/contact">{isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link>
        </div>
      </div>
    </footer>
  );
}
