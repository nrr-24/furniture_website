'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../data/LanguageContext';
import { FurnitureItem } from '../../data/furnitureData';
import { useFurniture } from '../../data/FurnitureContext';
import { useAuth } from '../../data/AuthContext';
import { useCart } from '../../data/CartContext';
import FurnitureManager from '../../components/FurnitureManager';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80';

export default function ShopPage() {
  const { t, isRtl } = useLanguage();
  const { items, initialized } = useFurniture();
  const { isAdmin, isCustomer } = useAuth();
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();
  
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<FurnitureItem | null>(null);

  if (!initialized) return null;

  const categories = [
    { id: 'sofas', name: isRtl ? 'كنب وأرائك' : 'Sofas & Sectionals' },
    { id: 'bedrooms', name: isRtl ? 'غرف نوم' : 'Bedroom Sets' },
    { id: 'dining', name: isRtl ? 'غرف طعام' : 'Dining Room' },
    { id: 'accents', name: isRtl ? 'قطع تكميلية' : 'Accent Furniture' }
  ];

  const groupedItems = categories.map(cat => ({
    ...cat,
    products: items.filter(item => item.category === cat.id)
  }));

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} className="monolithic-island" style={{ padding: '140px 60px 40px' }}>
      <div className="container">
        <header style={{ marginBottom: '60px', textAlign: 'center' }}>
          <span className="section-kicker" style={{ fontSize: '1rem', letterSpacing: '2px', opacity: 0.8 }}>{t('premiumCollections')}</span>
          <h1 className="smartwood-title" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}>{t('collections')}</h1>
          <p className="section-text mx-auto" style={{ color: 'var(--text-soft)' }}>{t('collectionDesc')}</p>
        </header>

        {/* Category Jump Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '60px' }}>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => {
                const el = document.getElementById(`category-${cat.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                padding: '10px 24px', borderRadius: '50px', background: 'var(--blue-deep)', 
                color: 'var(--text-main)', border: '1px solid var(--blue-accent)', 
                cursor: 'pointer', transition: 'all 0.3s ease', fontWeight: 'bold'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {groupedItems.map(group => (
          <section id={`category-${group.id}`} key={group.id} style={{ marginBottom: '80px', scrollMarginTop: '160px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
              <h2 className="section-title" style={{ margin: 0 }}>{group.name}</h2>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--line-soft)' }}></div>
            </div>

            {group.products.length > 0 ? (
              <div className="row g-4">
                {group.products.map(item => {
                  const cartItem = cart.find(i => i.id === item.id);
                  const inCart = !!cartItem;
                  
                  return (
                  <div className="col-md-6 col-lg-3" key={item.id}>
                    <div 
                      className="furniture-card position-relative"
                      style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.03)' }}
                      onClick={() => !isAdmin && setSelectedItem(item)} // Customers can click to view details
                    >
                      {/* Admin Edit Button */}
                      {isAdmin && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setItemToEdit(item); setIsEditorOpen(true); }}
                          style={{
                            position: 'absolute', top: '12px', right: '12px', zIndex: 10,
                            background: 'var(--blue-deep)', color: 'var(--text-main)', border: 'none',
                            borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', cursor: 'pointer'
                          }}
                        >
                          <i className="bi bi-pencil-fill"></i>
                        </button>
                      )}

                      <div style={{ overflow: 'hidden', height: '280px' }}>
                        <img 
                          src={item.image || FALLBACK_IMAGE} 
                          alt={isRtl ? item.nameAr || item.name || 'قطعة أثاث' : item.name || 'Furniture Piece'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="furniture-card-body d-flex flex-column" style={{ minHeight: '160px' }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 'bold' }}>
                              {isRtl ? item.nameAr || item.name || 'بدون اسم' : item.name || 'Unnamed Piece'}
                          </h3>
                          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', paddingLeft: '8px' }}>
                            ${item.price}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-soft)', flex: 1, marginBottom: '16px' }}>
                            {isRtl ? item.descriptionAr || item.description || '-' : item.description || '-'}
                        </p>
                        
                        {/* Cutomer Add to Cart / Quantity Toggle */}
                        {isCustomer && (
                          <div className="mt-auto">
                            {!inCart ? (
                              <button 
                                className="hero-primary-btn w-100" 
                                style={{ padding: '10px', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                                onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                              >
                                <i className="bi bi-cart-plus"></i> {isRtl ? 'إضافة' : 'Add to Cart'}
                              </button>
                            ) : (
                              <div className="d-flex align-items-center justify-content-between" style={{ background: 'var(--blue-deep)', borderRadius: '8px', padding: '4px' }}>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (cartItem.quantity > 1) updateQuantity(item.id, cartItem.quantity - 1);
                                    else removeFromCart(item.id);
                                  }}
                                  style={{ border: 'none', background: 'transparent', color: 'var(--text-main)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                >
                                  {cartItem.quantity > 1 ? <i className="bi bi-dash"></i> : <i className="bi bi-trash"></i>}
                                </button>
                                <span style={{ fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>{cartItem.quantity}</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(item.id, cartItem.quantity + 1);
                                  }}
                                  style={{ border: 'none', background: 'transparent', color: 'var(--text-main)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                >
                                  <i className="bi bi-plus"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            ) : (
              <p style={{ color: 'var(--text-soft)', fontStyle: 'italic' }}>
                {isRtl ? 'لا توجد منتجات في هذا القسم حالياً' : 'No products found in this category yet.'}
              </p>
            )}
          </section>
        ))}

        {/* Global Admin Floating Add Button */}
        {isAdmin && !isEditorOpen && (
          <button 
            onClick={() => { setItemToEdit(null); setIsEditorOpen(true); }}
            style={{
              position: 'fixed', bottom: '40px', right: isRtl ? 'auto' : '40px', left: isRtl ? '40px' : 'auto', zIndex: 1000,
              background: 'var(--text-main)', color: 'var(--blue-deep)', border: 'none', borderRadius: '50px',
              padding: '16px 32px', fontSize: '1.1rem', fontWeight: 'bold', boxShadow: 'var(--shadow-main)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}
          >
            <i className="bi bi-plus-lg"></i> {isRtl ? 'إضافة منتج جديد' : 'Add New Item'}
          </button>
        )}
      </div>

      {/* Editor Modal (Admin Only) */}
      {isEditorOpen && isAdmin && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'var(--bg-main)', zIndex: 9999,
          overflowY: 'auto', padding: '40px 20px', display: 'flex', justifyContent: 'center'
        }}>
          <div style={{ maxWidth: '900px', width: '100%', position: 'relative' }}>
            <button 
              onClick={() => setIsEditorOpen(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px', background: 'var(--blue-deep)',
                color: 'var(--text-main)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10
              }}
            >&times;</button>
            <FurnitureManager 
              initialItem={itemToEdit || undefined} 
              onClose={() => setIsEditorOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* Item Details Modal (Customer Only) */}
      {selectedItem && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 3000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={() => setSelectedItem(null)}>
          <div 
            style={{
              backgroundColor: 'var(--bg-panel)', borderRadius: '24px', maxWidth: '900px', width: '100%',
              display: 'flex', flexDirection: 'row', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedItem(null)}
              style={{
                position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)',
                color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '1.2rem', cursor: 'pointer', zIndex: 10
              }}
            >&times;</button>
            <div style={{ flex: '1', minHeight: '400px' }}>
              <img src={selectedItem.image} alt={selectedItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: '1', padding: '40px', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                {isRtl ? selectedItem.nameAr : selectedItem.name}
              </h2>
              <span style={{ fontSize: '1.5rem', color: 'var(--text-soft)', marginBottom: '24px' }}>
                ${selectedItem.price}
              </span>
              <p style={{ color: 'var(--text-soft)', lineHeight: '1.8', marginBottom: 'auto' }}>
                {isRtl ? selectedItem.descriptionAr : selectedItem.description}
              </p>
              
              {isCustomer && (
                <button 
                  className="hero-primary-btn w-100" 
                  style={{ marginTop: '30px', padding: '16px', fontSize: '1.1rem' }}
                  onClick={() => { addToCart(selectedItem); setSelectedItem(null); }}
                >
                  <i className="bi bi-cart-plus me-2"></i> {isRtl ? 'إضافة إلى العربة' : 'Add to Cart'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
