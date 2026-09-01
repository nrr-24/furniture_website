'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../data/LanguageContext';
import { useAuth } from '../../data/AuthContext';
import { useCart } from '../../data/CartContext';
import { useWishlist } from '../../data/WishlistContext';
import { FALLBACK_IMAGE } from '../../data/furnitureData';
import { usePathname, useRouter } from 'next/navigation';

const LEGACY_PLACEHOLDER = '/images/LOGO/image.png';
const cartImg = (src: string) => (!src || src === LEGACY_PLACEHOLDER ? FALLBACK_IMAGE : src);

// 2026 redesign nav structure: Home / Services / Craftsmanship / Portfolio / Collection.
type NavItem = { href: string; key: 'home' | 'services' | 'craftsmanship' | 'portfolio' | 'collection' };
const NAV_ITEMS: NavItem[] = [
    { href: '/',      key: 'home' },
    { href: '/services', key: 'services' },
    { href: '/about', key: 'craftsmanship' },
    // Portfolio/projects page hidden from navigation for now.
    { href: '/shop',  key: 'collection' },
];

const NAV_LABEL: Record<NavItem['key'], { en: string; ar: string }> = {
    home:          { en: 'Home',          ar: 'الرئيسية' },
    services:      { en: 'Services',      ar: 'خدماتنا' },
    craftsmanship: { en: 'Craftsmanship', ar: 'الحرفية' },
    portfolio:     { en: 'Portfolio',     ar: 'المشاريع' },
    collection:    { en: 'Collection',    ar: 'المجموعات' },
};

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { language, isRtl, t, setLanguage } = useLanguage();
    const { user, logout, isAdmin } = useAuth();
    const { cart, removeFromCart, updateQuantity, totalItems, totalPrice, isCartOpen, setIsCartOpen,
            clearCart, promo, discount, finalTotal, applyPromo, removePromo } = useCart();
    const { count: wishlistCount } = useWishlist();
    const pathname = usePathname();
    const router = useRouter();

    const isAdminView = pathname?.startsWith('/admin');

    // --- Promo + checkout state ---
    const [promoInput, setPromoInput] = useState('');
    const [promoError, setPromoError] = useState('');
    const [promoBusy, setPromoBusy] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);

    const handleApplyPromo = async () => {
        setPromoError('');
        setPromoBusy(true);
        const res = await applyPromo(promoInput);
        setPromoBusy(false);
        if (!res.ok) setPromoError(res.error || 'Invalid code');
        else setPromoInput('');
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        // Require login to place an order.
        if (!user) {
            setIsCartOpen(false);
            router.push('/login');
            return;
        }
        setCheckingOut(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    items: cart.map((i) => ({
                        productId: i.productId,
                        quantity: i.quantity,
                        price: i.price,
                        selectedColor: i.selectedColor ?? null,
                        selectedType: i.selectedType ?? null,
                    })),
                    subtotal: totalPrice,
                    discount,
                    promoCode: promo?.code ?? null,
                }),
            });
            const json = await res.json();
            if (!res.ok || !json.orderId) {
                setPromoError(json.error || 'Checkout failed. Please try again.');
                setCheckingOut(false);
                return;
            }

            // Start Hesabe payment for the newly created (pending) order and
            // hand the customer off to the hosted KNET / card / Apple Pay page.
            // The cart is intentionally kept until payment succeeds (cleared on
            // the confirmation page) so a failed payment doesn't lose it.
            const payRes = await fetch('/api/payment/hesabe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: json.orderId }),
            });
            const payJson = await payRes.json();
            if (payRes.ok && payJson.url) {
                setIsCartOpen(false);
                window.location.href = payJson.url;
                return;
            }
            setPromoError(payJson.error || 'Could not start payment. Please try again.');
        } catch {
            setPromoError('Checkout failed. Please try again.');
        } finally {
            setCheckingOut(false);
        }
    };

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ar' : 'en');
    };

    // The active pill matches the current path exactly (Home only on "/").
    const isPillActive = (item: NavItem) => {
        if (item.href === '/') return pathname === '/';
        return pathname === item.href;
    };

    return (
        <>
            <nav id="navbar" dir={isRtl ? 'rtl' : 'ltr'}>
                {/* === Brand === */}
                <Link href="/" className="brand-link" aria-label="SmartWood — Home">
                    <img
                        src={`/images/LOGO/smartwood-${language}-black.svg`}
                        alt="SmartWood"
                        className="brand-logo-img"
                    />
                </Link>

                {/* === Center pill nav (desktop) === */}
                <div className="nav-pill-bar d-none d-lg-flex" role="navigation">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.key}
                            href={item.href}
                            className={`nav-pill-link ${isPillActive(item) ? 'active' : ''}`}
                        >
                            {isRtl ? NAV_LABEL[item.key].ar : NAV_LABEL[item.key].en}
                        </Link>
                    ))}
                </div>

                {/* === Right actions === */}
                <div className="nav-right-actions">
                    {/* Wishlist */}
                    {!isAdminView && (
                        <Link
                            href="/wishlist"
                            className="nav-icon-square"
                            aria-label={isRtl ? 'المفضلة' : 'Wishlist'}
                            title={isRtl ? 'المفضلة' : 'Wishlist'}
                        >
                            <i className={`bi ${wishlistCount > 0 ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                            {wishlistCount > 0 && (
                                <span className="nav-cart-badge" aria-hidden="true">{wishlistCount}</span>
                            )}
                        </Link>
                    )}

                    {/* Cart icon — replaces the old floating FAB. Same setIsCartOpen wiring. */}
                    {!isAdmin && !isAdminView && (
                        <button
                            className="nav-icon-square nav-icon-cart"
                            onClick={() => setIsCartOpen(true)}
                            aria-label={isRtl ? `عربة التسوق، ${totalItems} عناصر` : `Shopping cart, ${totalItems} items`}
                        >
                            <i className="bi bi-bag"></i>
                            {totalItems > 0 && (
                                <span className="nav-cart-badge" aria-hidden="true">{totalItems}</span>
                            )}
                        </button>
                    )}

                    {/* Language toggle — desktop-only; mobile has it in the overlay footer */}
                    <button
                        className="nav-lang-btn d-none d-lg-inline-flex"
                        onClick={toggleLanguage}
                        title={t('switchLang')}
                        aria-label={t('switchLang')}
                    >
                        {language === 'en' ? 'AR' : 'EN'}
                    </button>

                    {/* Auth controls — desktop only. Profile icon when logged in, login/signup
                        pills when not. All auth surfaces collapsed into mobile-menu pills on
                        small screens to keep the header iconography clean per the mockup. */}
                    {user ? (
                        <div className="nav-auth-group d-none d-lg-flex">
                            {isAdmin && (
                                <>
                                  <Link href="/admin/users" className="nav-text-link">
                                      {isRtl ? 'المستخدمون' : 'USERS'}
                                  </Link>
                                  <Link href="/admin/projects" className="nav-text-link">
                                      {isRtl ? 'المشاريع' : 'PROJECTS'}
                                  </Link>
                                </>
                            )}
                            {!isAdmin && (
                                <Link
                                    href="/profile"
                                    className="nav-icon-square"
                                    aria-label={isRtl ? 'الملف الشخصي' : 'Profile'}
                                    title={isRtl ? 'الملف الشخصي' : 'Profile'}
                                >
                                    <i className="bi bi-person"></i>
                                </Link>
                            )}
                            <button onClick={logout} className="nav-text-link nav-text-link-danger">
                                {isRtl ? 'خروج' : 'LOG OUT'}
                            </button>
                        </div>
                    ) : (
                        <div className="nav-auth-group d-none d-lg-flex">
                            <Link href="/login" className="nav-text-link">
                                {isRtl ? 'دخول' : 'LOG IN'}
                            </Link>
                        </div>
                    )}

                    {/* Hamburger (mobile only) */}
                    <button
                        className="nav-icon-square nav-icon-hamburger d-lg-none"
                        onClick={() => setIsMobileMenuOpen(true)}
                        aria-label={isRtl ? 'فتح القائمة' : 'Open menu'}
                    >
                        <i className="bi bi-list"></i>
                    </button>
                </div>
            </nav>

            {/* === Cart Sidebar Modal === */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(31, 24, 18, 0.45)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    zIndex: 2000,
                    opacity: isCartOpen ? 1 : 0,
                    visibility: isCartOpen ? 'visible' : 'hidden',
                    transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}
                onClick={() => setIsCartOpen(false)}
            >
                <div
                    className="cart-sidebar-panel"
                    style={{
                        width: '460px',
                        maxWidth: '100%',
                        backgroundColor: 'var(--bg-panel)',
                        color: 'var(--text-main)',
                        height: '100%',
                        padding: '30px',
                        paddingBottom: 'max(30px, env(safe-area-inset-bottom))',
                        boxShadow: '-10px 0 40px rgba(42, 32, 24, 0.18)',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
                        transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                        borderLeft: '1px solid var(--line-soft)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="d-flex justify-content-between align-items-center mb-5">
                        <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 500, letterSpacing: '0', fontSize: '1.75rem' }}>
                            {isRtl ? 'عربة التسوق' : 'Shopping Cart'}
                        </h3>
                        <button
                            onClick={() => setIsCartOpen(false)}
                            aria-label={isRtl ? 'إغلاق' : 'Close cart'}
                            style={{ background: 'var(--text-main)', border: 'none', color: 'var(--bg-main)', width: '36px', height: '36px', borderRadius: '50%', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}
                        >
                            <i className="bi bi-x-lg" style={{ fontSize: '0.95rem' }}></i>
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-soft)' }}>
                                <i className="bi bi-bag" style={{ fontSize: '3rem', display: 'block', marginBottom: '15px', opacity: 0.4 }}></i>
                                <p style={{ fontSize: '1.05rem' }}>{isRtl ? 'العربة فارغة حالياً' : 'Your cart is empty.'}</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {cart.map((item) => {
                                    const hasVariant = !!(item.selectedColor || item.selectedType);
                                    const isCssColor = !!item.selectedColor && /^(#|rgb|hsl|[a-zA-Z]+$)/.test(item.selectedColor);
                                    return (
                                        <div key={item.id} className="d-flex gap-3 align-items-center" style={{ padding: '14px', background: 'var(--bg-main)', borderRadius: '18px', border: '1px solid var(--line-soft)' }}>
                                            <img src={cartImg(item.image)} alt={item.name} style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '12px' }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h5 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-app)' }}>{item.name}</h5>
                                                {hasVariant && (
                                                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', margin: '0 0 6px', fontSize: '0.78rem', color: 'var(--text-soft)' }}>
                                                        {item.selectedType && <span>{item.selectedType}</span>}
                                                        {item.selectedType && item.selectedColor && <span style={{ opacity: 0.5 }}>•</span>}
                                                        {item.selectedColor && (
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                                {isCssColor && (
                                                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.selectedColor, border: '1px solid var(--line-soft)' }} />
                                                                )}
                                                                <span>{item.selectedColor}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700 }}>{item.price} {t('currency')}</p>
                                            </div>
                                            <div className="d-flex flex-column align-items-center gap-2">
                                                <div className="d-flex align-items-center gap-3" style={{ background: 'var(--surface-soft)', padding: '4px 10px', borderRadius: '999px', color: 'var(--text-main)' }}>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity" style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer' }}>−</button>
                                                    <span style={{ minWidth: '18px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity" style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, cursor: 'pointer' }}>+</button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    style={{ background: 'transparent', border: 'none', color: '#a8553a', fontSize: '0.78rem', opacity: 0.85, cursor: 'pointer' }}
                                                >
                                                    {isRtl ? 'إزالة' : 'Remove'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div style={{ paddingTop: '24px', borderTop: '1px solid var(--line-soft)', marginTop: '24px' }}>
                            {/* Promo code */}
                            {promo ? (
                                <div className="d-flex justify-content-between align-items-center mb-3" style={{ padding: '10px 14px', background: 'var(--surface-soft)', borderRadius: '12px' }}>
                                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                                        <i className="bi bi-tag-fill" style={{ marginInlineEnd: '6px' }}></i>{promo.code}
                                    </span>
                                    <button onClick={removePromo} style={{ background: 'transparent', border: 'none', color: 'var(--text-soft)', fontSize: '0.78rem', cursor: 'pointer' }}>
                                        {isRtl ? 'إزالة' : 'Remove'}
                                    </button>
                                </div>
                            ) : (
                                <div className="mb-3">
                                    <div className="d-flex gap-2">
                                        <input
                                            value={promoInput}
                                            onChange={(e) => { setPromoInput(e.target.value); setPromoError(''); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleApplyPromo(); }}
                                            placeholder={isRtl ? 'كود الخصم' : 'Promo code'}
                                            style={{ flex: 1, minWidth: 0, padding: '12px 14px', background: 'var(--bg-main)', border: '1px solid var(--line-soft)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.85rem' }}
                                        />
                                        <button
                                            onClick={handleApplyPromo}
                                            disabled={promoBusy || !promoInput.trim()}
                                            style={{ padding: '0 18px', background: 'var(--surface-soft)', border: '1px solid var(--line-soft)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', opacity: promoBusy || !promoInput.trim() ? 0.5 : 1 }}
                                        >
                                            {isRtl ? 'تطبيق' : 'Apply'}
                                        </button>
                                    </div>
                                    {promoError && <p style={{ color: '#a8553a', fontSize: '0.76rem', margin: '6px 2px 0' }}>{promoError}</p>}
                                </div>
                            )}

                            {/* Totals */}
                            <div className="d-flex justify-content-between mb-2">
                                <span style={{ fontSize: '0.92rem', color: 'var(--text-soft)' }}>{isRtl ? 'المجموع الفرعي' : 'Subtotal'}</span>
                                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{totalPrice.toLocaleString()} {t('currency')}</span>
                            </div>
                            {discount > 0 && (
                                <div className="d-flex justify-content-between mb-2">
                                    <span style={{ fontSize: '0.92rem', color: '#a8553a' }}>{isRtl ? 'الخصم' : 'Discount'}</span>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#a8553a' }}>−{discount.toLocaleString()} {t('currency')}</span>
                                </div>
                            )}
                            <div className="d-flex justify-content-between align-items-baseline mb-4" style={{ paddingTop: '10px', borderTop: '1px solid var(--line-soft)' }}>
                                <span style={{ fontSize: '1rem' }}>{isRtl ? 'الإجمالي' : 'Total'}</span>
                                <span style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>{finalTotal.toLocaleString()} {t('currency')}</span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={checkingOut}
                                style={{
                                    width: '100%',
                                    minHeight: '56px',
                                    fontSize: '0.9rem',
                                    borderRadius: 'var(--r-pill)',
                                    background: 'var(--text-main)',
                                    color: 'var(--bg-main)',
                                    border: 'none',
                                    fontWeight: 600,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    cursor: checkingOut ? 'wait' : 'pointer',
                                    opacity: checkingOut ? 0.7 : 1
                                }}
                            >
                                {checkingOut ? (isRtl ? 'جارٍ المعالجة...' : 'Processing...') : (isRtl ? 'إتمام الطلب' : 'Checkout')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* === Full-Screen Mobile Menu Overlay === */}
            <div
                className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
                dir={isRtl ? 'rtl' : 'ltr'}
                aria-hidden={!isMobileMenuOpen}
            >
                <div className="mobile-menu-bg" aria-hidden="true">
                    <span className="mobile-menu-orb mobile-menu-orb-a" />
                    <span className="mobile-menu-orb mobile-menu-orb-b" />
                </div>

                <div className="mobile-menu-header stagger-item">
                    <Link href="/" className="brand-link" onClick={() => setIsMobileMenuOpen(false)}>
                        <img
                            src={`/images/LOGO/smartwood-${language}-black.svg`}
                            alt="SmartWood"
                            className="brand-logo-img"
                            style={{ height: '28px', width: 'auto' }}
                        />
                    </Link>
                    <button
                        className="close-menu-btn"
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Close Menu"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="mobile-menu-body">
                    <span className="mobile-menu-eyebrow stagger-item">
                        {isRtl ? 'القائمة' : 'Menu'}
                    </span>

                    <nav className="mobile-menu-links">
                        {[
                            ...NAV_ITEMS.map((item, idx) => ({
                                idx,
                                href: item.href,
                                label: isRtl ? NAV_LABEL[item.key].ar : NAV_LABEL[item.key].en,
                            })),
                            { idx: NAV_ITEMS.length, href: '/contact', label: isRtl ? 'تواصل معنا' : 'Contact' },
                        ].map((item) => (
                            <Link
                                key={`${item.href}-${item.idx}`}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`mobile-nav-link stagger-item ${pathname === item.href ? 'active' : ''}`}
                            >
                                <span className="mobile-nav-index">
                                    {String(item.idx + 1).padStart(2, '0')}
                                </span>
                                <span className="mobile-nav-label">{item.label}</span>
                                <span className="mobile-nav-arrow" aria-hidden="true">
                                    <i className={`bi ${isRtl ? 'bi-arrow-left' : 'bi-arrow-right'}`}></i>
                                </span>
                            </Link>
                        ))}
                    </nav>

                    <div className="mobile-menu-auth stagger-item">
                        {user ? (
                            <>
                                {!isAdmin && (
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="mobile-menu-pill mobile-menu-pill-primary"
                                    >
                                        <i className="bi bi-person-circle"></i>
                                        <span>{isRtl ? 'الملف الشخصي' : 'My Profile'}</span>
                                    </Link>
                                )}
                                {isAdmin && (
                                    <>
                                      <Link
                                          href="/admin/users"
                                          onClick={() => setIsMobileMenuOpen(false)}
                                          className="mobile-menu-pill mobile-menu-pill-primary"
                                      >
                                          <i className="bi bi-people"></i>
                                          <span>{isRtl ? 'إدارة المستخدمين' : 'Manage Users'}</span>
                                      </Link>
                                      <Link
                                          href="/admin/projects"
                                          onClick={() => setIsMobileMenuOpen(false)}
                                          className="mobile-menu-pill mobile-menu-pill-primary"
                                      >
                                          <i className="bi bi-images"></i>
                                          <span>{isRtl ? 'إدارة المشاريع' : 'Manage Projects'}</span>
                                      </Link>
                                    </>
                                )}
                                <button
                                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                    className="mobile-menu-pill mobile-menu-pill-ghost"
                                >
                                    <i className="bi bi-box-arrow-right"></i>
                                    <span>{isRtl ? 'تسجيل الخروج' : 'Log Out'}</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="mobile-menu-pill mobile-menu-pill-ghost"
                                >
                                    <i className="bi bi-box-arrow-in-right"></i>
                                    <span>{isRtl ? 'تسجيل الدخول' : 'Log In'}</span>
                                </Link>
                                <Link
                                    href="/signup"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="mobile-menu-pill mobile-menu-pill-primary"
                                >
                                    <i className="bi bi-stars"></i>
                                    <span>{isRtl ? 'حساب جديد' : 'Sign Up'}</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="mobile-menu-footer stagger-item">
                    <button
                        className="mobile-menu-lang"
                        onClick={toggleLanguage}
                        aria-label={t('switchLang')}
                    >
                        <i className="bi bi-translate"></i>
                        <span>{language === 'en' ? 'العربية' : 'English'}</span>
                    </button>
                    <span className="mobile-menu-tagline">
                        {isRtl ? 'صُمم لحياة راقية' : 'Crafted for refined living'}
                    </span>
                </div>
            </div>
        </>
    );
}
