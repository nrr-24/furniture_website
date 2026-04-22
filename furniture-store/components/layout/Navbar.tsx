'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../data/LanguageContext';
import { useAuth } from '../../data/AuthContext';
import { useCart } from '../../data/CartContext';
import { FALLBACK_IMAGE } from '../../data/furnitureData';

const LEGACY_PLACEHOLDER = '/images/LOGO/image.png';
const cartImg = (src: string) => (!src || src === LEGACY_PLACEHOLDER ? FALLBACK_IMAGE : src);
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const { language, setLanguage, isRtl, t } = useLanguage();
    const { user, logout, isAdmin } = useAuth();
    const { cart, removeFromCart, updateQuantity, totalItems, totalPrice, isCartOpen, setIsCartOpen } = useCart();
    const pathname = usePathname();

    const isCustomer = !user || user.role === 'customer';
    const isAdminView = pathname?.startsWith('/admin');

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ar' : 'en');
    };

    return (
        <>
        <nav id="navbar" dir={isRtl ? 'rtl' : 'ltr'}>
            <Link href="/" className="brand-link">
                <img
                    src={`/images/LOGO/smartwood-${language}-white.svg`}
                    alt="SmartWood Logo"
                    className="brand-logo-img"
                    style={{ height: '32px', width: 'auto' }}
                />
            </Link>

            <div className="nav-center-pills">
                <Link href="/" className={`nav-pill-link ${pathname === '/' ? 'active' : ''}`}>{t('home')}</Link>
                <Link href="/shop" className={`nav-pill-link ${pathname === '/shop' ? 'active' : ''}`}>{t('collections')}</Link>
                <Link href="/about" className={`nav-pill-link ${pathname === '/about' ? 'active' : ''}`}>{t('craftsmanship')}</Link>
            </div>

            <div className="nav-right-actions">
                <button
                    className="nav-icon-btn"
                    style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px' }}
                    onClick={toggleLanguage}
                    title={t('switchLang')}
                >
                    {language === 'en' ? 'AR' : 'EN'}
                </button>

                {/* Authentication & Profile Controls */}
                {user ? (
                    <div className="d-flex align-items-center gap-3">
                        {isAdmin && (
                            <Link href="/admin/users" style={{ color: 'var(--blue-main)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', letterSpacing: '1px' }}>
                                {isRtl ? 'لوحة المشرف' : 'ADMIN PANEL'}
                            </Link>
                        )}
                        
                        {/* Profile Link - Hidden in Admin View */}
                        {!isAdmin && (
                            <Link 
                                href="/profile"
                                className="nav-icon-btn" 
                                title={isRtl ? 'الملف الشخصي' : 'My Profile'}
                                style={{ fontSize: '1.4rem', color: 'var(--text-main)', opacity: 0.8, textDecoration: 'none' }}
                            >
                                <i className="bi bi-person-circle"></i>
                            </Link>
                        )}

                        <button
                            onClick={logout}
                            style={{ background: 'transparent', border: 'none', color: '#ff6b6b', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                            {isRtl ? 'تسجيل الخروج' : 'LOG OUT'}
                        </button>
                    </div>
                ) : (
                    <div className="d-flex align-items-center gap-3">
                        <Link href="/login" style={{ color: 'white', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500, letterSpacing: '0.5px' }}>
                            {isRtl ? 'تسجيل الدخول' : 'LOG IN'}
                        </Link>
                        <Link href="/signup" style={{ color: 'white', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600, padding: '6px 16px', background: 'var(--blue-deep)', borderRadius: '20px', letterSpacing: '0.5px' }}>
                            {isRtl ? 'حساب جديد' : 'SIGN UP'}
                        </Link>
                    </div>
                )}

                {!isAdminView && (
                    <Link href="/contact" className="contact-cta-btn" style={{ background: 'transparent', border: '1px solid var(--text-main)', textDecoration: 'none' }}>
                        {isRtl ? 'تواصل معنا' : 'CONTACT US'}
                    </Link>
                )}
            </div>
        </nav>

            {/* Rendered outside <nav>: navbar's backdrop-filter creates a containing block for position:fixed in Safari/Firefox. */}
            {isCustomer && !isAdminView && (
                <button
                    className="floating-cart-fab pulse"
                    onClick={() => setIsCartOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: 'max(24px, env(safe-area-inset-bottom))',
                        right: isRtl ? 'auto' : 'max(24px, env(safe-area-inset-right))',
                        left: isRtl ? 'max(24px, env(safe-area-inset-left))' : 'auto',
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'var(--blue-deep)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                        zIndex: 1500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                >
                    <i className="bi bi-cart3"></i>
                    {totalItems > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '-5px',
                            right: isRtl ? 'auto' : '-5px',
                            left: isRtl ? '-5px' : 'auto',
                            background: '#ff4d4d',
                            color: 'white',
                            minWidth: '22px',
                            height: '22px',
                            borderRadius: '11px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 6px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                        }}>
                            {totalItems}
                        </span>
                    )}
                </button>
            )}

            {/* Cart Sidebar Modal */}
            <div 
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
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
                            width: '450px',
                            maxWidth: '100%',
                            backgroundColor: 'var(--bg-main)',
                            height: '100%',
                            padding: '30px',
                            paddingBottom: 'max(30px, env(safe-area-inset-bottom))',
                            boxShadow: '-10px 0 40px rgba(0,0,0,0.4)',
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
                        <h3 style={{ margin: 0, fontWeight: 700, letterSpacing: '1px' }}>{isRtl ? 'عربة التسوق' : 'Shopping Cart'}</h3>
                        <button
                            onClick={() => setIsCartOpen(false)}
                            style={{ background: 'var(--text-main)', border: 'none', color: 'var(--bg-main)', width: '36px', height: '36px', borderRadius: '50%', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}
                        >
                            &times;
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                        {cart.length === 0 ? (
                            <div style={{ textAlign: 'center', marginTop: '60px', opacity: 0.5 }}>
                                <i className="bi bi-cart-x" style={{ fontSize: '3rem', display: 'block', marginBottom: '15px' }}></i>
                                <p style={{ fontSize: '1.1rem' }}>{isRtl ? 'العربة فارغة حالياً' : 'Your cart is empty.'}</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-4">
                                {cart.map((item) => {
                                    const hasVariant = !!(item.selectedColor || item.selectedType);
                                    const isCssColor = !!item.selectedColor && /^(#|rgb|hsl|[a-zA-Z]+$)/.test(item.selectedColor);
                                    return (
                                    <div key={item.id} className="d-flex gap-3 align-items-center" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid var(--line-soft)' }}>
                                        <img src={cartImg(item.image)} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h5 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 600 }}>{item.name}</h5>
                                            {hasVariant && (
                                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', margin: '0 0 6px', fontSize: '0.78rem', color: 'var(--text-soft)', opacity: 0.85 }}>
                                                    {item.selectedType && <span>{item.selectedType}</span>}
                                                    {item.selectedType && item.selectedColor && <span style={{ opacity: 0.5 }}>•</span>}
                                                    {item.selectedColor && (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                            {isCssColor && (
                                                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.selectedColor, border: '1px solid rgba(255,255,255,0.2)' }} />
                                                            )}
                                                            <span>{item.selectedColor}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <p style={{ margin: 0, color: 'var(--blue-main)', fontSize: '1rem', fontWeight: 700 }}>{item.price} {t('currency')}</p>
                                        </div>
                                        <div className="d-flex flex-column align-items-center gap-2">
                                            <div className="d-flex align-items-center gap-3" style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 10px', borderRadius: '8px' }}>
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'none', border: 'none', color: 'white', padding: 0 }}>-</button>
                                                <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'none', border: 'none', color: 'white', padding: 0 }}>+</button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                style={{ background: 'transparent', border: 'none', color: '#ff4d4d', fontSize: '0.8rem', opacity: 0.7 }}
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
                        <div style={{ paddingTop: '30px', borderTop: '1px solid var(--line-soft)', marginTop: '30px' }}>
                            <div className="d-flex justify-content-between mb-4">
                                <span style={{ fontSize: '1.1rem', opacity: 0.7 }}>{isRtl ? 'المجموع الفرعي' : 'Subtotal'}</span>
                                <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{totalPrice.toLocaleString()} {t('currency')}</span>
                            </div>
                            <button className="hero-primary-btn w-100 shadow-lg" style={{ minHeight: '64px', fontSize: '1.1rem', borderRadius: '18px' }}>
                                {isRtl ? 'إتمام الطلب' : 'CHECKOUT NOW'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .floating-cart-fab:hover {
                    transform: scale(1.1) translateY(-5px);
                }
                .floating-cart-fab:active {
                    transform: scale(0.95);
                }
                .pulse {
                    animation: pulse-animation 2s infinite;
                }
                @keyframes pulse-animation {
                    0% { box-shadow: 0 0 0 0px rgba(13, 26, 99, 0.4); }
                    70% { box-shadow: 0 0 0 20px rgba(13, 26, 99, 0); }
                    100% { box-shadow: 0 0 0 0px rgba(13, 26, 99, 0); }
                }
                @media (max-width: 600px) {
                    .floating-cart-fab {
                        width: 56px !important;
                        height: 56px !important;
                        font-size: 1.3rem !important;
                    }
                    .cart-sidebar-panel {
                        padding: 20px !important;
                    }
                    .cart-sidebar-panel h3 {
                        font-size: 1.2rem !important;
                    }
                }
            `}</style>
        </>
    );
}
