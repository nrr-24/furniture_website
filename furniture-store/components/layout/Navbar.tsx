'use client';

import Link from 'next/link';
import { useLanguage } from '../../data/LanguageContext';
import { useAuth } from '../../data/AuthContext';
import { useCart } from '../../data/CartContext';
import { useState } from 'react';

export default function Navbar() {
    const { language, setLanguage, isRtl, t } = useLanguage();
    const { role, setRole, isAdmin, isCustomer } = useAuth();
    const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
    
    const [isCartOpen, setIsCartOpen] = useState(false);

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ar' : 'en');
    };

    return (
        <nav className="navbar-luxury-wrap" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="container">
                <div className="navbar-luxury-inner">
                    <Link href="/" className="brand-link">
                        <img 
                            src={`/images/LOGO/smartwood-${language}-white.svg`}
                            alt="SmartWood Logo" 
                            className="brand-logo-img"
                            style={{ height: '40px', width: 'auto' }}
                        />
                    </Link>

                    <div className="nav-center-pills">
                        <Link href="/" className="nav-pill-link">{t('home')}</Link>
                        <Link href="/shop" className="nav-pill-link">{t('collections')}</Link>
                        <Link href="/about" className="nav-pill-link">{t('craftsmanship')}</Link>
                    </div>

                    <div className="nav-right-actions">
                        <button className="lang-switch-btn" onClick={toggleLanguage}>
                            {t('switchLang')}
                        </button>
                        
                        {/* Role Selector */}
                        <div style={{ position: 'relative' }} className="d-flex align-items-center gap-2">
                            <select 
                                value={role} 
                                onChange={(e) => setRole(e.target.value as 'admin' | 'customer')}
                                style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    color: 'var(--text-main)',
                                    border: '1px solid var(--line-soft)',
                                    borderRadius: '999px',
                                    padding: '12px 18px',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="customer" style={{ color: 'black' }}>Customer View</option>
                                <option value="admin" style={{ color: 'black' }}>Admin View</option>
                            </select>
                        </div>

                        {/* Cart Icon (Customer Only) */}
                        {isCustomer && (
                            <button 
                                className="contact-cta-btn position-relative"
                                onClick={() => setIsCartOpen(true)}
                                style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <i className="bi bi-cart"></i>
                                {totalItems > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.75rem' }}>
                                        {totalItems}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Cart Sidebar Modal */}
            {isCartOpen && isCustomer && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 2000,
                    display: 'flex',
                    justifyContent: isRtl ? 'flex-start' : 'flex-end'
                }}>
                    <div style={{
                        width: '400px',
                        maxWidth: '100%',
                        backgroundColor: 'var(--bg-main)',
                        height: '100%',
                        padding: '24px',
                        boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 style={{ margin: 0, color: 'var(--text-main)' }}>{isRtl ? 'عربة التسوق' : 'Shopping Cart'}</h3>
                            <button 
                                onClick={() => setIsCartOpen(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '1.5rem', cursor: 'pointer' }}
                            >
                                &times;
                            </button>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {cart.length === 0 ? (
                                <p style={{ color: 'var(--text-soft)', textAlign: 'center', marginTop: '40px' }}>
                                    {isRtl ? 'العربة فارغة' : 'Your cart is empty.'}
                                </p>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {cart.map((item) => (
                                        <div key={item.id} className="d-flex gap-3 align-items-center" style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                            <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                                            <div style={{ flex: 1 }}>
                                                <h5 style={{ margin: '0 0 4px', fontSize: '1rem', color: 'var(--text-main)' }}>{isRtl ? item.name : item.name}</h5>
                                                <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: '0.9rem' }}>${item.price}</p>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    value={item.quantity} 
                                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                                    style={{ width: '50px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--line-soft)', borderRadius: '4px', padding: '4px' }}
                                                />
                                                <button 
                                                    onClick={() => removeFromCart(item.id)}
                                                    style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div style={{ paddingTop: '20px', borderTop: '1px solid var(--line-soft)', marginTop: '20px' }}>
                                <div className="d-flex justify-content-between mb-3">
                                    <span style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{isRtl ? 'المجموع' : 'Total'}:</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>${totalPrice.toFixed(2)}</span>
                                </div>
                                <button className="hero-primary-btn w-100" style={{ padding: '16px' }}>
                                    {isRtl ? 'إتمام الشراء' : 'Checkout'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
