'use client';

import Link from 'next/link';
import { useLanguage } from '../../data/LanguageContext';
import { useAuth } from '../../data/AuthContext';
import { useCart } from '../../data/CartContext';
import { useState } from 'react';

export default function Navbar() {
    const { language, setLanguage, isRtl, t } = useLanguage();
    const { user, logout, isAdmin, isCustomer } = useAuth();
    const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

    const [isCartOpen, setIsCartOpen] = useState(false);

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ar' : 'en');
    };

    return (
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
                <Link href="/" className="nav-pill-link active">{t('home')}</Link>
                <Link href="/shop" className="nav-pill-link">{t('collections')}</Link>
                <Link href="/about" className="nav-pill-link">{t('craftsmanship')}</Link>
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

                {/* Authentication Controls */}
                {user ? (
                    <div className="d-flex align-items-center gap-3">
                        {isAdmin && (
                            <Link href="/admin/users" style={{ color: 'var(--blue-main)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', letterSpacing: '1px' }}>
                                {isRtl ? 'لوحة المشرف' : 'ADMIN PANEL'}
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

                {/* Contact Us / Cart Icon (Customer Only) */}
                {isCustomer && (
                    <button
                        className="contact-cta-btn position-relative d-flex align-items-center gap-2"
                        onClick={() => setIsCartOpen(true)}
                        style={{ padding: '12px 24px' }}
                    >
                        {isRtl ? 'سلة المشتريات' : 'CART'}
                        {totalItems > 0 && (
                            <span className="badge rounded-pill bg-danger" style={{ fontSize: '0.7rem', padding: '4px 6px' }}>
                                {totalItems}
                            </span>
                        )}
                    </button>
                )}

                <Link href="/contact" className="contact-cta-btn" style={{ background: 'transparent', border: '1px solid var(--text-main)', textDecoration: 'none' }}>
                    {isRtl ? 'تواصل معنا' : 'CONTACT US'}
                </Link>
            </div>

            {/* Cart Sidebar Modal */}
            <div 
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 2000,
                    opacity: isCartOpen ? 1 : 0,
                    visibility: isCartOpen ? 'visible' : 'hidden',
                    transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                    display: 'flex',
                    justifyContent: isRtl ? 'flex-start' : 'flex-end'
                }}
                onClick={() => setIsCartOpen(false)}
            >
                <div 
                    style={{
                        width: '450px',
                        maxWidth: '90%',
                        backgroundColor: 'var(--bg-main)',
                        height: '100%',
                        padding: '30px',
                        boxShadow: isRtl ? '10px 0 40px rgba(0,0,0,0.4)' : '-10px 0 40px rgba(0,0,0,0.4)',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        transform: isCartOpen ? 'translateX(0)' : (isRtl ? 'translateX(-100%)' : 'translateX(100%)'),
                        transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                        borderLeft: isRtl ? 'none' : '1px solid var(--line-soft)',
                        borderRight: isRtl ? '1px solid var(--line-soft)' : 'none'
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
                                {cart.map((item) => (
                                    <div key={item.id} className="d-flex gap-3 align-items-center" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid var(--line-soft)' }}>
                                        <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }} />
                                        <div style={{ flex: 1 }}>
                                            <h5 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 600 }}>{item.name}</h5>
                                            <p style={{ margin: 0, color: 'var(--blue-main)', fontSize: '1rem', fontWeight: 700 }}>${item.price}</p>
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
                                ))}
                            </div>
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div style={{ paddingTop: '30px', borderTop: '1px solid var(--line-soft)', marginTop: '30px' }}>
                            <div className="d-flex justify-content-between mb-4">
                                <span style={{ fontSize: '1.1rem', opacity: 0.7 }}>{isRtl ? 'المجموع الفرعي' : 'Subtotal'}</span>
                                <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>${totalPrice.toLocaleString()}</span>
                            </div>
                            <button className="hero-primary-btn w-100 shadow-lg" style={{ minHeight: '64px', fontSize: '1.1rem', borderRadius: '18px' }}>
                                {isRtl ? 'إتمام الطلب' : 'CHECKOUT NOW'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
