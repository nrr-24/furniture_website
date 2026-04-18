'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '../../data/LanguageContext';
import { FurnitureItem, Category } from '../../data/furnitureData';
import { useFurniture } from '../../data/FurnitureContext';
import { useAuth } from '../../data/AuthContext';
import { useCart } from '../../data/CartContext';
import FurnitureManager from '../../components/FurnitureManager';
import Footer from '../../components/layout/Footer';

const FALLBACK_IMAGE = '/images/LOGO/image.png';

export default function ShopPage() {
  const { t, isRtl } = useLanguage();
  const {
    items, categories, initialized,
    addItem, updateItem, deleteItem, reorderItems,
    addCategory, updateCategory, deleteCategory, reorderCategories
  } = useFurniture();
  const { isAdmin, isCustomer } = useAuth();
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

  // Modals & States
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<FurnitureItem | null>(null);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Drag and Drop States
  const [draggedItem, setDraggedItem] = useState<{ id: string, index: number, categoryId?: string, type: 'product' | 'category' } | null>(null);

  // Confirmation Modals
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'product' | 'category', id?: string, count?: number, name?: string } | null>(null);

  if (!initialized) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-soft)' }}>Loading Collections...</div>;

  const groupedItems = categories.map(cat => ({
    ...cat,
    products: items.filter(item => item.categoryId === cat.id).sort((a, b) => a.sortOrder - b.sortOrder)
  }));

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    setConfirmDelete(null);
  };

  // --- Vanilla DND Handlers ---

  // Category DND
  const handleCategoryDragStart = (e: React.DragEvent, index: number, id: string) => {
    setDraggedItem({ type: 'category', index, id });
  };

  const handleCategoryDrop = async (e: React.DragEvent, targetIndex: number) => {
    if (!draggedItem || draggedItem.type !== 'category') return;
    const sourceIndex = draggedItem.index;
    if (sourceIndex === targetIndex) return;

    const newCats = [...categories];
    const [moved] = newCats.splice(sourceIndex, 1);
    newCats.splice(targetIndex, 0, moved);

    await reorderCategories(newCats);
    setDraggedItem(null);
  };

  // Product DND
  const handleProductDragStart = (e: React.DragEvent, categoryId: string, index: number, id: string) => {
    setDraggedItem({ type: 'product', categoryId, index, id });
  };

  const handleProductDrop = async (e: React.DragEvent, targetCategoryId: string, targetIndex: number) => {
    if (!draggedItem || draggedItem.type !== 'product' || !draggedItem.categoryId) return;

    const sourceCategoryId = draggedItem.categoryId;
    const sourceIndex = draggedItem.index;

    // Movement within the same category
    if (sourceCategoryId === targetCategoryId) {
      if (sourceIndex === targetIndex) return;
      const catGroup = groupedItems.find(g => g.id === targetCategoryId);
      if (!catGroup) return;

      const newProducts = [...catGroup.products];
      const [moved] = newProducts.splice(sourceIndex, 1);
      newProducts.splice(targetIndex, 0, moved);

      await reorderItems(targetCategoryId, newProducts);
    } else {
      // Movement between categories
      // For now, let's keep it simple: moving to a new category triggers a re-parenting
      const item = items.find(i => i.id === draggedItem.id);
      if (!item) return;

      const targetGroup = groupedItems.find(g => g.id === targetCategoryId);
      if (!targetGroup) return;

      const newProducts = [...targetGroup.products];
      newProducts.splice(targetIndex, 0, { ...item, categoryId: targetCategoryId });

      await reorderItems(targetCategoryId, newProducts);
    }
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow drop
  };

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} className="shop-main" style={{ flex: 1, overflowY: 'auto' }}>
      {/* Promotional Banner */}
      <div className="shop-promo-banner">
        <div className="promo-content">
          <span className="promo-badge">{isRtl ? 'عرض خاص' : 'SPECIAL OFFER'}</span>
          <h2 className="promo-title">{isRtl ? 'خصم حصري على مجموعات مختارة' : 'Exclusive Discounts on Select Collections'}</h2>
          <p className="promo-subtitle">{isRtl ? 'اكتشف أحدث التصاميم بأسعار استثنائية — لفترة محدودة فقط.' : 'Discover the latest designs at exceptional prices — limited time only.'}</p>
        </div>
        <div className="promo-decoration">
          <i className="bi bi-stars" style={{ fontSize: '4rem', opacity: 0.15 }}></i>
        </div>
      </div>

      <div className="container">
        <header style={{ marginBottom: '28px', textAlign: 'center' }}>
          <span className="section-kicker" style={{ fontSize: '0.85rem', letterSpacing: '2px', opacity: 0.8 }}>{t('premiumCollections')}</span>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 300, letterSpacing: '-0.02em', margin: '0 0 14px', textAlign: 'center', lineHeight: 1.1 }}>
              {isRtl ? 'استكشف' : 'EXPLORE'}
              <br />
              <span style={{ fontWeight: 600 }}>{isRtl ? 'المجموعات' : 'COLLECTIONS'}</span>
            </h1>
          </div>
          <p className="section-text mx-auto" style={{ color: 'var(--text-soft)', textAlign: 'center', margin: '0 auto', fontSize: '0.88rem' }}>{t('collectionDesc')}</p>

          {isAdmin && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '14px' }}>
              <button
                onClick={() => setIsCategoryManagerOpen(true)}
                className="hero-secondary-btn py-2 px-4 shadow-sm"
                style={{ fontSize: '0.85rem', borderRadius: '12px' }}
              >
                <i className="bi bi-tags-fill me-2"></i> {isRtl ? 'إدارة الفئات' : 'Edit Categories'}
              </button>
            </div>
          )}
        </header>

        {/* Category Jump Pills with Icons */}
        <div className="shop-category-pills">
          {categories.map(cat => {
            const iconMap: Record<string, string> = {
              'door': 'bi-door-open', 'باب': 'bi-door-open', 'أبواب': 'bi-door-open',
              'kitchen': 'bi-cup-hot', 'مطبخ': 'bi-cup-hot', 'مطابخ': 'bi-cup-hot',
              'bed': 'bi-moon-stars', 'سرير': 'bi-moon-stars', 'bedroom': 'bi-moon-stars', 'غرف': 'bi-moon-stars',
              'living': 'bi-lamp', 'معيشة': 'bi-lamp', 'صالون': 'bi-lamp',
              'office': 'bi-briefcase', 'مكتب': 'bi-briefcase',
              'dining': 'bi-egg-fried', 'طعام': 'bi-egg-fried', 'سفرة': 'bi-egg-fried',
              'wardrobe': 'bi-archive', 'خزانة': 'bi-archive', 'closet': 'bi-archive',
              'shelf': 'bi-bookshelf', 'رف': 'bi-bookshelf', 'display': 'bi-bookshelf',
              'table': 'bi-grid-3x3', 'طاولة': 'bi-grid-3x3',
              'chair': 'bi-person-workspace', 'كرسي': 'bi-person-workspace',
              'tv': 'bi-tv', 'تلفزيون': 'bi-tv', 'entertainment': 'bi-tv',
              'bathroom': 'bi-droplet', 'حمام': 'bi-droplet',
              'outdoor': 'bi-tree', 'خارجي': 'bi-tree',
            };
            const catWords = `${cat.name} ${cat.nameAr}`.toLowerCase().split(/\s+/);
            const matchedIcon = catWords.find(w => iconMap[w]);
            const icon = matchedIcon ? iconMap[matchedIcon] : 'bi-grid';

            return (
              <button
                key={cat.id}
                onClick={() => {
                  const el = document.getElementById(`category-${cat.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="shop-category-pill"
              >
                <i className={`bi ${icon}`}></i>
                <span>{isRtl ? cat.nameAr : cat.name}</span>
              </button>
            );
          })}
        </div>

        {groupedItems.map((group, groupIdx) => {
          const iconMap2: Record<string, string> = {
            'door': 'bi-door-open', 'باب': 'bi-door-open', 'أبواب': 'bi-door-open',
            'kitchen': 'bi-cup-hot', 'مطبخ': 'bi-cup-hot', 'مطابخ': 'bi-cup-hot',
            'bed': 'bi-moon-stars', 'سرير': 'bi-moon-stars', 'bedroom': 'bi-moon-stars', 'غرف': 'bi-moon-stars',
            'living': 'bi-lamp', 'معيشة': 'bi-lamp', 'صالون': 'bi-lamp',
            'office': 'bi-briefcase', 'مكتب': 'bi-briefcase',
            'dining': 'bi-egg-fried', 'طعام': 'bi-egg-fried', 'سفرة': 'bi-egg-fried',
            'wardrobe': 'bi-archive', 'خزانة': 'bi-archive', 'closet': 'bi-archive',
            'table': 'bi-grid-3x3', 'طاولة': 'bi-grid-3x3',
            'tv': 'bi-tv', 'تلفزيون': 'bi-tv',
          };
          const catWords2 = `${group.name} ${group.nameAr}`.toLowerCase().split(/\s+/);
          const matchedIcon2 = catWords2.find(w => iconMap2[w]);
          const sectionIcon = matchedIcon2 ? iconMap2[matchedIcon2] : 'bi-grid';

          return (
          <section
            id={`category-${group.id}`}
            key={group.id}
            style={{
              marginBottom: '48px',
              scrollMarginTop: '120px'
            }}
          >
            <div className="shop-section-header">
              <div className="shop-section-icon">
                <i className={`bi ${sectionIcon}`}></i>
              </div>
              <h2 className="section-title" style={{ margin: 0 }}>{isRtl ? group.nameAr : group.name}</h2>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--line-soft)' }}></div>
              <span className="shop-section-count">{group.products.length} {isRtl ? 'منتج' : 'items'}</span>
            </div>

            {group.products.length > 0 ? (
              <div className="row g-3">
                {group.products.map((item, idx) => {
                  const cartItem = cart.find(i => i.id === item.id);
                  const inCart = !!cartItem;

                  return (
                    <div
                      className="col-6 col-sm-6 col-lg-4 col-xl-3"
                      key={item.id}
                      draggable={isAdmin}
                      onDragStart={(e) => handleProductDragStart(e, group.id, idx, item.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => { e.stopPropagation(); handleProductDrop(e, group.id, idx); }}
                      style={{ opacity: draggedItem?.type === 'product' && draggedItem.id === item.id ? 0.3 : 1 }}
                    >
                      <div
                        className="shop-item-card group"
                        style={{ cursor: isAdmin ? 'default' : 'pointer' }}
                        onClick={() => !isAdmin && setSelectedItem(item)}
                      >
                        {isAdmin && (
                          <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
                            <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '50px', padding: '4px 10px', backdropFilter: 'blur(4px)', color: 'white', cursor: 'grab', fontSize: '0.85rem' }}>
                              <i className="bi bi-list"></i>
                            </div>
                          </div>
                        )}

                        {isAdmin && (
                          <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, display: 'flex', gap: '6px' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setItemToEdit(item); setIsEditorOpen(true); }}
                              className="admin-action-btn shadow-sm"
                              style={{ background: 'white', color: 'black', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}
                            ><i className="bi bi-pencil-fill"></i></button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'product', id: item.id, name: isRtl ? item.nameAr : item.name }); }}
                              className="admin-action-btn shadow-sm"
                              style={{ background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}
                            ><i className="bi bi-trash-fill"></i></button>
                          </div>
                        )}

                        <div className="card-bg-layer">
                          <img
                            src={item.image || FALLBACK_IMAGE}
                            alt={isRtl ? item.nameAr : item.name}
                          />
                          <div className="card-overlay"></div>
                        </div>

                        <div className="card-content">
                          <div className="card-header">
                            <h3 className="card-title">
                              {isRtl ? item.nameAr || item.name : item.name}
                            </h3>
                          </div>

                          <div className="card-hover-drawer">
                            {isCustomer ? (
                              <div className="hover-inner">
                                <span className="hover-price">{item.price} {t('currency')}</span>
                                {!inCart ? (
                                  <button
                                    className="cart-fab-add"
                                    aria-label={isRtl ? 'إضافة إلى العربة' : 'Add to cart'}
                                    onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                                  >
                                    <i className="bi bi-cart-plus"></i>
                                  </button>
                                ) : (
                                  <div className="d-flex align-items-center" style={{ background: 'white', borderRadius: '8px', padding: '4px', gap: '8px', color: 'black' }}>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (cartItem.quantity > 1) updateQuantity(item.id, cartItem.quantity - 1);
                                        else removeFromCart(item.id);
                                      }}
                                      style={{ border: 'none', background: 'var(--bg-main)', color: 'white', borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                      {cartItem.quantity > 1 ? <i className="bi bi-dash"></i> : <i className="bi bi-trash"></i>}
                                    </button>
                                    <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{cartItem.quantity}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateQuantity(item.id, cartItem.quantity + 1);
                                      }}
                                      style={{ border: 'none', background: 'var(--bg-main)', color: 'white', borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                      <i className="bi bi-plus"></i>
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                               <div className="hover-inner">
                                  <span className="hover-price">{item.price} {t('currency')}</span>
                                  <span style={{ color: 'var(--text-soft)', fontSize: '0.8rem' }}>{isRtl ? 'للتسوق، يرجى التسجيل' : 'Login to buy'}</span>
                               </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div
                style={{ padding: '30px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--line-soft)' }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleProductDrop(e, group.id, 0)}
              >
                <p style={{ color: 'var(--text-soft)', fontStyle: 'italic', margin: 0, fontSize: '0.88rem' }}>
                  {isRtl ? 'لا توجد منتجات في هذا القسم حالياً' : 'No products found in this category yet.'}
                </p>
              </div>
            )}
          </section>
          );
        })}

        {/* Global Admin Floating Add Button */}
        {isAdmin && !isEditorOpen && (
          <button
            onClick={() => { setItemToEdit(null); setIsEditorOpen(true); }}
            className="fixed-add-btn"
            style={{
              position: 'fixed',
              bottom: 'max(24px, env(safe-area-inset-bottom))',
              right: isRtl ? 'auto' : 'max(24px, env(safe-area-inset-right))',
              left: isRtl ? 'max(24px, env(safe-area-inset-left))' : 'auto',
              zIndex: 1000,
              background: 'var(--text-main)', color: 'var(--bg-main)', border: 'none', borderRadius: '50px',
              padding: '16px 32px', fontSize: '1.1rem', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}
          >
            <i className="bi bi-plus-lg"></i> {isRtl ? 'إضافة منتج جديد' : 'Add New Item'}
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="confirm-modal" style={{ background: 'var(--bg-panel)', padding: '40px', borderRadius: '24px', maxWidth: '500px', width: '100%', textAlign: 'center', border: '1px solid var(--line-soft)' }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '3rem', color: '#ff4d4d', marginBottom: '20px', display: 'block' }}></i>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '15px' }}>{isRtl ? 'هل أنت متأكد؟' : 'Are you sure?'}</h3>
            <p style={{ color: 'var(--text-soft)', marginBottom: '30px', fontSize: '1.1rem' }}>
              {confirmDelete.type === 'product' && (isRtl ? `سيتم حذف "${confirmDelete.name}" نهائياً.` : `"${confirmDelete.name}" will be permanently deleted.`)}
              {confirmDelete.type === 'category' && (isRtl ? `حذف فئة "${confirmDelete.name}" سيؤدي أيضاً إلى حذف كافة المنتجات داخلها نهائياً.` : `حذف "${confirmDelete.name}" سيؤدي أيضاً إلى حذف ${confirmDelete.count || ''} منتجات داخلها.`)}
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => setConfirmDelete(null)} className="hero-secondary-btn py-2 flex-grow-1" style={{ border: 'none' }}>{isRtl ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={() => {
                if (confirmDelete.type === 'product' && confirmDelete.id) deleteItem(confirmDelete.id);
                else if (confirmDelete.type === 'category' && confirmDelete.id) handleDeleteCategory(confirmDelete.id);
                setConfirmDelete(null);
              }} style={{ background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '12px', flexGrow: 1, fontWeight: 'bold' }}>{isRtl ? 'حذف نهائي' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {isCategoryManagerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setIsCategoryManagerOpen(false)}>
          <div
            className="category-modal shadow-lg"
            style={{
              background: 'var(--bg-panel)', padding: '25px', borderRadius: '24px', maxWidth: '650px', width: '100%',
              maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative', border: '1px solid var(--line-soft)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.5rem' }}>{isRtl ? 'إدارة الفئات' : 'Manage Categories'}</h3>
              <button onClick={() => setIsCategoryManagerOpen(false)} style={{ background: 'var(--text-main)', border: 'none', color: 'var(--bg-main)', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ marginBottom: '25px', padding: '20px', background: 'var(--bg-main)', borderRadius: '16px', border: '1px solid var(--line-soft)' }}>
              <h4 style={{ fontSize: '0.8rem', marginBottom: '12px', color: 'var(--text-soft)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{isRtl ? 'فئة جديدة' : 'Add New Category'}</h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addCategory(formData.get('name') as string, formData.get('nameAr') as string);
                e.currentTarget.reset();
              }} className="d-flex gap-2">
                <input name="name" placeholder="Name (EN)" required style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line-soft)', color: 'white', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem' }} />
                <input name="nameAr" placeholder="الاسم (AR)" required style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line-soft)', color: 'white', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem' }} />
                <button type="submit" className="hero-primary-btn" style={{ padding: '10px 15px', border: 'none' }}><i className="bi bi-plus-lg"></i></button>
              </form>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
              {categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  draggable
                  onDragStart={(e) => handleCategoryDragStart(e, idx, cat.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleCategoryDrop(e, idx)}
                  className="cat-list-item d-flex align-items-center gap-3 p-3 transition-all"
                  style={{ background: 'var(--bg-main)', borderRadius: '14px', border: '1px solid var(--line-soft)', opacity: draggedItem?.type === 'category' && draggedItem.id === cat.id ? 0.2 : 1 }}
                >
                  <div style={{ cursor: 'grab', color: 'var(--text-soft)', padding: '5px' }}><i className="bi bi-list" style={{ fontSize: '1.2rem' }}></i></div>
                  <div style={{ flex: 1 }}>
                    <div className="d-flex gap-2">
                      <input
                        defaultValue={cat.name}
                        onBlur={(e) => updateCategory(cat.id, { name: e.target.value })}
                        placeholder="English"
                        style={{ flex: 1, background: 'none', border: 'none', color: 'white', fontSize: '1rem', fontWeight: 600, padding: 0 }}
                      />
                      <input
                        defaultValue={cat.nameAr}
                        onBlur={(e) => updateCategory(cat.id, { nameAr: e.target.value })}
                        placeholder="Arabic"
                        dir="rtl"
                        style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text-soft)', fontSize: '0.9rem', textAlign: isRtl ? 'right' : 'left', padding: 0 }}
                      />
                    </div>
                  </div>
                  <button onClick={() => {
                    const itemCount = items.filter(i => i.categoryId === cat.id).length;
                    setConfirmDelete({ type: 'category', id: cat.id, name: isRtl ? cat.nameAr : cat.name, count: itemCount });
                  }} style={{ background: 'rgba(255,77,77,0.1)', border: 'none', color: '#ff4d4d', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="bi bi-trash"></i></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal (Admin Only) */}
      {isEditorOpen && isAdmin && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, overflowY: 'auto', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: '800px', width: '100%', position: 'relative', marginTop: '60px' }}>
            <button
              onClick={() => setIsEditorOpen(false)}
              className="shadow-lg"
              style={{ position: 'absolute', top: '15px', right: '25px', background: 'var(--text-main)', color: 'var(--bg-main)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10001 }}
            >&times;</button>
            <FurnitureManager initialItem={itemToEdit || undefined} onClose={() => setIsEditorOpen(false)} />
          </div>
        </div>
      )}

      {/* Item Details Modal (Customer Only) */}
      {selectedItem && (
        <div className="modal-overlay-animated" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedItem(null)}>
          <div
            className="details-modal-animated"
            style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '24px', maxWidth: '900px', width: '100%', display: 'flex', flexDirection: isRtl ? 'row-reverse' : 'row', overflow: 'hidden', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelectedItem(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '1.2rem', cursor: 'pointer', zIndex: 10 }}>&times;</button>
            <div style={{ flex: '1', minHeight: '400px' }}>
              <img src={selectedItem.image} alt={selectedItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: '1', padding: '40px', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 700 }}> {isRtl ? selectedItem.nameAr : selectedItem.name} </h2>
              <span style={{ fontSize: '1.5rem', color: 'var(--text-soft)', marginBottom: '24px' }}> {selectedItem.price} {t('currency')} </span>
              <p style={{ color: 'var(--text-soft)', lineHeight: '1.8', marginBottom: 'auto' }}> {isRtl ? selectedItem.descriptionAr : selectedItem.description} </p>
              {isCustomer && (
                <button className="hero-primary-btn w-100" style={{ marginTop: '30px', padding: '16px', fontSize: '1.1rem' }} onClick={() => { addToCart(selectedItem); setSelectedItem(null); }}>
                  <i className="bi bi-cart-plus me-2"></i> {isRtl ? 'إضافة إلى العربة' : 'Add to Cart'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .shop-main { padding: 0; }
        .shop-main .container { padding: 0 40px; }
        @media (max-width: 991px) { .shop-main .container { padding: 0 24px; } }
        @media (max-width: 600px) { .shop-main .container { padding: 0 16px; } }

        /* Promotional Banner */
        .shop-promo-banner {
          background: linear-gradient(135deg, #1a2ca3 0%, #0d1a63 50%, #2251a4 100%);
          padding: 28px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          margin-bottom: 28px;
        }
        .shop-promo-banner::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(226,218,204,0.08) 0%, transparent 70%);
          border-radius: 50%;
        }
        .promo-content { position: relative; z-index: 1; }
        .promo-badge {
          display: inline-block;
          background: var(--sand-soft);
          color: var(--bg-main);
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          padding: 4px 12px;
          border-radius: 999px;
          margin-bottom: 10px;
        }
        .promo-title {
          font-size: clamp(1.1rem, 2.5vw, 1.6rem);
          font-weight: 700;
          color: var(--text-main);
          margin: 0 0 6px;
          line-height: 1.2;
        }
        .promo-subtitle {
          font-size: 0.82rem;
          color: var(--text-soft);
          margin: 0;
          max-width: 500px;
        }
        .promo-decoration {
          position: relative;
          z-index: 1;
          color: var(--sand-soft);
        }
        @media (max-width: 600px) {
          .shop-promo-banner { padding: 20px; }
          .promo-decoration { display: none; }
        }

        /* Category Pills with Icons */
        .shop-category-pills {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 36px;
        }
        .shop-category-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-main);
          color: var(--text-main);
          border: 1px solid var(--line-soft);
          padding: 8px 18px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          font-size: 0.82rem;
        }
        .shop-category-pill i {
          font-size: 1rem;
          opacity: 0.7;
        }
        .shop-category-pill:hover {
          background: var(--blue-deep);
          border-color: var(--blue-accent);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }
        .shop-category-pill:hover i {
          opacity: 1;
        }

        /* Section Header with Icon */
        .shop-section-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }
        .shop-section-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(226,218,204,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          color: var(--sand-soft);
          flex-shrink: 0;
        }
        .shop-section-count {
          font-size: 0.75rem;
          color: var(--text-soft);
          letter-spacing: 0.05em;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .cart-fab-add {
          width: 48px;
          height: 48px;
          min-width: 48px;
          flex-shrink: 0;
          border: none;
          padding: 0;
          border-radius: 50%;
          background: var(--text-main);
          color: var(--bg-main);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                      box-shadow 0.25s ease,
                      background 0.2s ease;
        }
        .cart-fab-add:hover {
          transform: translateY(-3px) scale(1.06);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45), 0 0 0 4px rgba(226, 218, 204, 0.18);
          background: #fff;
        }
        .cart-fab-add:active {
          transform: translateY(-1px) scale(0.96);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }
        .cart-fab-add i {
          line-height: 1;
        }

        .admin-action-btn:hover { transform: scale(1.1); transition: 0.2s; }
        .fixed-add-btn:hover { transform: translateY(-3px); transition: 0.3s; box-shadow: 0 15px 40px rgba(0,0,0,0.6) !important; }
        .category-modal::-webkit-scrollbar { width: 6px; }
        .category-modal::-webkit-scrollbar-thumb { background: var(--line-soft); border-radius: 10px; }

        /* Shop Card Redesign */
        .shop-item-card {
          height: 300px;
          border-radius: 1.2em;
          position: relative;
          display: flex;
          justify-content: flex-end;
          flex-direction: column;
          padding: 1.2em;
          z-index: 1;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.2), box-shadow 0.4s ease;
        }
        .shop-item-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1);
        }
        .card-bg-layer {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          z-index: -1;
        }
        .card-bg-layer img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .shop-item-card:hover .card-bg-layer img {
          transform: scale(1.1);
        }
        .card-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 45%, transparent 100%);
        }
        .card-content {
          color: white;
          z-index: 2;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.5em;
        }
        .card-title {
          font-size: 1.2rem;
          margin: 0;
          font-weight: bold;
        }
        
        .card-hover-drawer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.6s cubic-bezier(0.22, 1, 0.36, 1), margin-top 0.4s ease, opacity 0.4s ease;
          opacity: 0;
        }
        .shop-item-card:hover .card-hover-drawer {
          max-height: 120px;
          margin-top: 10px;
          opacity: 1;
        }
        .hover-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          padding-top: 5px;
        }
        .hover-price {
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
        }

        /* Smooth grab Modal Animation */
        @keyframes modalOverlayFade {
          0% { opacity: 0; backdrop-filter: blur(0px); }
          100% { opacity: 1; backdrop-filter: blur(8px); }
        }
        @keyframes modalGrab {
          0% { transform: scale(0.8) translateY(80px); opacity: 0; border-radius: 40px; }
          100% { transform: scale(1) translateY(0); opacity: 1; border-radius: 24px; }
        }
        .modal-overlay-animated {
          animation: modalOverlayFade 0.4s ease forwards;
        }
        .details-modal-animated {
          animation: modalGrab 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.15) forwards;
          box-shadow: 0 30px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1) !important;
        }

        /* Touch devices can't :hover, so reveal the card drawer by default. */
        @media (hover: none) {
          .card-hover-drawer {
            max-height: 120px;
            margin-top: 10px;
            opacity: 1;
          }
        }

        @media (max-width: 600px) {
          .shop-item-card {
            height: 320px;
            padding: 1.2em;
          }
          .card-title { font-size: 1.05rem; }
          .hover-price { font-size: 1.2rem; }

          .details-modal-animated {
            flex-direction: column !important;
            max-height: calc(100dvh - 24px);
            overflow-y: auto;
          }
          .details-modal-animated > div:first-of-type:not(button) {
            min-height: 240px !important;
            max-height: 40vh;
          }
          .details-modal-animated > div:last-of-type {
            padding: 24px !important;
          }
          .details-modal-animated h2 { font-size: 1.6rem !important; }
          .details-modal-animated > div:last-of-type > span { font-size: 1.2rem !important; }

          .fixed-add-btn {
            bottom: max(20px, env(safe-area-inset-bottom)) !important;
            right: max(20px, env(safe-area-inset-right)) !important;
            padding: 12px 20px !important;
            font-size: 0.9rem !important;
          }
        }
      `}</style>
      <Footer />
    </main>
  );
}
