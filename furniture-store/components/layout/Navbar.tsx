'use client';

import Link from 'next/link';
import { useLanguage } from '../../data/LanguageContext';
import { useAuth } from '../../data/AuthContext';
import { useCart } from '../../data/CartContext';
import { useState } from 'react';

export default function Navbar() {
    const { language, setLanguage, isRtl, t } = useLanguage();
    const { user, logout, isAdmin, isCustomer, updateUser } = useAuth();
    const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    
    // Profile Edit State
    const [editName, setEditName] = useState(user?.full_name || '');
    const [editPhone, setEditPhone] = useState(user?.phone_number || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ar' : 'en');
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveMessage('');
        
        const success = await updateUser({
            full_name: editName,
            phone_number: editPhone
        });

        if (success) {
            setSaveMessage(isRtl ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully');
            setTimeout(() => setSaveMessage(''), 3000);
        } else {
            setSaveMessage(isRtl ? 'فشل الحفظ. حاول مرة أخرى.' : 'Save failed. Try again.');
        }
        setIsSaving(false);
    };

    // Order History Fetching
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

    const fetchOrders = async () => {
        if (!user) return;
        setIsLoadingOrders(true);
        try {
            const res = await fetch(`/api/orders?userId=${user.id}`);
            const data = await res.json();
            if (data.orders) setOrders(data.orders);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setIsLoadingOrders(false);
        }
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

                {/* Authentication & Profile Controls */}
                {user ? (
                    <div className="d-flex align-items-center gap-3">
                        {isAdmin && (
                            <Link href="/admin/users" style={{ color: 'var(--blue-main)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', letterSpacing: '1px' }}>
                                {isRtl ? 'لوحة المشرف' : 'ADMIN PANEL'}
                            </Link>
                        )}
                        
                        {/* Profile Avatar Icon */}
                        <button 
                            className="nav-icon-btn" 
                            onClick={() => {
                                setIsProfileOpen(true);
                                if (activeTab === 'history') fetchOrders();
                            }}
                            title={isRtl ? 'الملف الشخصي' : 'Profile Settings'}
                            style={{ fontSize: '1.4rem', color: 'var(--text-main)', opacity: 0.8 }}
                        >
                            <i className="bi bi-person-circle"></i>
                        </button>

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

                <Link href="/contact" className="contact-cta-btn" style={{ background: 'transparent', border: '1px solid var(--text-main)', textDecoration: 'none' }}>
                    {isRtl ? 'تواصل معنا' : 'CONTACT US'}
                </Link>
            </div>

            {/* Floating Cart Button (FAB) */}
            {isCustomer && (
                <button
                    className="floating-cart-fab pulse"
                    onClick={() => setIsCartOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        right: isRtl ? 'auto' : '30px',
                        left: isRtl ? '30px' : 'auto',
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

            {/* Profile Modal */}
            <div 
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 3000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isProfileOpen ? 1 : 0,
                    visibility: isProfileOpen ? 'visible' : 'hidden',
                    transition: 'all 0.4s ease',
                    padding: '20px'
                }}
                onClick={() => setIsProfileOpen(false)}
            >
                <div 
                    className="profile-modal shadow-lg"
                    style={{
                        width: '550px',
                        maxWidth: '100%',
                        maxHeight: '85vh',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'var(--bg-panel)',
                        borderRadius: '30px',
                        padding: '40px',
                        position: 'relative',
                        border: '1px solid var(--line-soft)',
                        transform: isProfileOpen ? 'scale(1)' : 'scale(0.9)',
                        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => setIsProfileOpen(false)} style={{ position: 'absolute', top: '25px', right: '25px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', zIndex: 10 }}>&times;</button>
                    
                    <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                        <div style={{ 
                            width: '70px', height: '70px', borderRadius: '50%', 
                            background: 'linear-gradient(135deg, var(--blue-main), var(--blue-deep))', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 15px', fontSize: '1.8rem', color: 'white',
                            boxShadow: '0 10px 30px rgba(13, 26, 99, 0.3)'
                        }}>
                            <i className="bi bi-person"></i>
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>{isRtl ? 'حسابي' : 'My Account'}</h2>
                    </div>

                    {/* Tabs Navigation */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '15px' }}>
                        <button 
                            onClick={() => setActiveTab('info')}
                            style={{ 
                                flex: 1, padding: '10px', borderRadius: '12px', border: 'none', 
                                background: activeTab === 'info' ? 'var(--blue-deep)' : 'transparent',
                                color: 'white', fontSize: '0.9rem', fontWeight: 600, transition: '0.3s'
                            }}
                        >
                            {isRtl ? 'المعلومات' : 'Profile Info'}
                        </button>
                        <button 
                            onClick={() => { setActiveTab('history'); fetchOrders(); }}
                            style={{ 
                                flex: 1, padding: '10px', borderRadius: '12px', border: 'none', 
                                background: activeTab === 'history' ? 'var(--blue-deep)' : 'transparent',
                                color: 'white', fontSize: '0.9rem', fontWeight: 600, transition: '0.3s'
                            }}
                        >
                            {isRtl ? 'الطلبات' : 'Order History'}
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                        {activeTab === 'info' ? (
                            <form onSubmit={handleSaveProfile}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-soft)' }}>
                                        {isRtl ? 'الاسم الكامل' : 'Full Name'}
                                    </label>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--line-soft)', color: 'white', borderRadius: '12px', padding: '12px 16px' }}
                                        placeholder={isRtl ? 'أدخل اسمك' : 'Enter your name'}
                                    />
                                </div>
                                <div style={{ marginBottom: '30px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-soft)' }}>
                                        {isRtl ? 'رقم الهاتف' : 'Phone Number'}
                                    </label>
                                    <input 
                                        type="tel"
                                        className="form-control"
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(e.target.value)}
                                        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--line-soft)', color: 'white', borderRadius: '12px', padding: '12px 16px' }}
                                        placeholder="+123 456 7890"
                                    />
                                </div>

                                {saveMessage && (
                                    <div style={{ 
                                        marginBottom: '20px', padding: '12px', borderRadius: '10px', 
                                        background: saveMessage.includes('فشل') || saveMessage.includes('failed') ? 'rgba(255,77,77,0.1)' : 'rgba(0,184,148,0.1)',
                                        color: saveMessage.includes('فشل') || saveMessage.includes('failed') ? '#ff4d4d' : '#00b894',
                                        fontSize: '0.9rem', textAlign: 'center'
                                    }}>
                                        {saveMessage}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="hero-primary-btn w-100"
                                    style={{ minHeight: '56px', borderRadius: '15px', border: 'none' }}
                                >
                                    {isSaving ? '...' : (isRtl ? 'حفظ التغييرات' : 'Save Changes')}
                                </button>
                            </form>
                        ) : (
                            <div className="order-history-list">
                                {isLoadingOrders ? (
                                    <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner-border text-info"></div></div>
                                ) : orders.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                                        <i className="bi bi-receipt" style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}></i>
                                        {isRtl ? 'لا توجد طلبات سابقة' : 'No order history yet.'}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {orders.map(order => (
                                            <div key={order.id} style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line-soft)', padding: '20px' }}>
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <div>
                                                        <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{new Date(order.created_at).toLocaleDateString()}</div>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Order #{order.id.substring(0,8)}</div>
                                                    </div>
                                                    <span style={{ 
                                                        fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', 
                                                        padding: '4px 10px', borderRadius: '50px',
                                                        background: order.status === 'delivered' ? 'rgba(0,184,148,0.1)' : 'rgba(255,165,0,0.1)',
                                                        color: order.status === 'delivered' ? '#00b894' : '#ffa500'
                                                    }}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                                                    {order.order_items?.map((oi: any) => (
                                                        <div key={oi.id} className="d-flex justify-content-between align-items-center">
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <img src={oi.products?.image_url} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                                                                <span style={{ fontSize: '0.85rem' }}>{oi.products?.name} <small style={{ opacity: 0.5 }}>x{oi.quantity}</small></span>
                                                            </div>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>${oi.price}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: '10px', textAlign: 'right', fontWeight: 800, fontSize: '1.1rem' }}>
                                                    ${order.total_amount}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
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
            `}</style>
        </nav>
    );
}
