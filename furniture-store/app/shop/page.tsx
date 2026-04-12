'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '../../data/LanguageContext';
import { FurnitureItem, Category } from '../../data/furnitureData';
import { useFurniture } from '../../data/FurnitureContext';
import { useAuth } from '../../data/AuthContext';
import { useCart } from '../../data/CartContext';
import FurnitureManager from '../../components/FurnitureManager';

const FALLBACK_IMAGE = '/images/no-image.png';

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
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: '40px 60px', flex: 1, overflowY: 'auto' }}>
      <div className="container">
        <header style={{ marginBottom: '60px', textAlign: 'center' }}>
          <span className="section-kicker" style={{ fontSize: '1rem', letterSpacing: '2px', opacity: 0.8 }}>{t('premiumCollections')}</span>
          <h1 className="smartwood-title" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}>{t('collections')}</h1>
          <p className="section-text mx-auto" style={{ color: 'var(--text-soft)' }}>{t('collectionDesc')}</p>
          
          {isAdmin && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
              <button 
                onClick={() => setIsCategoryManagerOpen(true)}
                className="hero-secondary-btn py-2 px-4 shadow-sm"
                style={{ fontSize: '0.9rem', borderRadius: '12px' }}
              >
                <i className="bi bi-tags-fill me-2"></i> {isRtl ? 'إدارة الفئات' : 'Edit Categories'}
              </button>
            </div>
          )}
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
              className="px-4 py-2 rounded-pill shadow-sm"
              style={{
                background: 'var(--blue-deep)', color: 'var(--text-main)', border: '1px solid var(--blue-accent)',
                cursor: 'pointer', transition: 'all 0.3s ease', fontWeight: 'bold'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {isRtl ? cat.nameAr : cat.name}
            </button>
          ))}
        </div>

        {groupedItems.map((group, groupIdx) => (
          <section 
            id={`category-${group.id}`} 
            key={group.id} 
            style={{ 
              marginBottom: '80px', 
              scrollMarginTop: '160px' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
              <h2 className="section-title" style={{ margin: 0 }}>{isRtl ? group.nameAr : group.name}</h2>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--line-soft)' }}></div>
            </div>

            {group.products.length > 0 ? (
              <div className="row g-4">
                {group.products.map((item, idx) => {
                  const cartItem = cart.find(i => i.id === item.id);
                  const inCart = !!cartItem;

                  return (
                    <div 
                      className="col-md-6 col-lg-4" 
                      key={item.id}
                      draggable={isAdmin}
                      onDragStart={(e) => handleProductDragStart(e, group.id, idx, item.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => { e.stopPropagation(); handleProductDrop(e, group.id, idx); }}
                      style={{ opacity: draggedItem?.type === 'product' && draggedItem.id === item.id ? 0.3 : 1 }}
                    >
                      <div
                        className="furniture-card position-relative"
                        style={{ cursor: isAdmin ? 'default' : 'pointer' }}
                        onClick={() => !isAdmin && setSelectedItem(item)}
                      >
                        {isAdmin && (
                          <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, display: 'flex', gap: '8px' }}>
                            <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '50px', padding: '4px 10px', backdropFilter: 'blur(4px)', color: 'white', cursor: 'grab' }}>
                               <i className="bi bi-list"></i>
                            </div>
                          </div>
                        )}

                        {isAdmin && (
                          <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, display: 'flex', gap: '8px' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setItemToEdit(item); setIsEditorOpen(true); }}
                              className="admin-action-btn"
                              style={{ background: 'var(--blue-deep)', color: 'var(--text-main)', border: 'none', borderRadius: '50%', width: '36px', height: '36px' }}
                            ><i className="bi bi-pencil-fill"></i></button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'product', id: item.id, name: isRtl ? item.nameAr : item.name }); }}
                              className="admin-action-btn"
                              style={{ background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px' }}
                            ><i className="bi bi-trash-fill"></i></button>
                          </div>
                        )}

                        <div style={{ overflow: 'hidden', height: '280px' }}>
                          <img
                            src={item.image || FALLBACK_IMAGE}
                            alt={isRtl ? item.nameAr : item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div className="furniture-card-body d-flex flex-column" style={{ minHeight: '160px' }}>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 'bold' }}>
                              {isRtl ? item.nameAr || item.name : item.name}
                            </h3>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)', paddingLeft: '8px' }}>
                              ${item.price}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-soft)', flex: 1, marginBottom: '16px' }}>
                            {isRtl ? item.descriptionAr || item.description : item.description}
                          </p>

                          {isCustomer && (
                            <div className="mt-auto">
                              {!inCart ? (
                                <button
                                  className="hero-primary-btn w-100"
                                  style={{ border: 'none', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
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
                  )
                })}
              </div>
            ) : (
              <div 
                style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--line-soft)' }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleProductDrop(e, group.id, 0)}
              >
                <p style={{ color: 'var(--text-soft)', fontStyle: 'italic', margin: 0 }}>
                  {isRtl ? 'لا توجد منتجات في هذا القسم حالياً' : 'No products found in this category yet.'}
                </p>
              </div>
            )}
          </section>
        ))}

        {/* Global Admin Floating Add Button */}
        {isAdmin && !isEditorOpen && (
          <button
            onClick={() => { setItemToEdit(null); setIsEditorOpen(true); }}
            className="fixed-add-btn"
            style={{
              position: 'fixed', bottom: '40px', right: isRtl ? 'auto' : '40px', left: isRtl ? '40px' : 'auto', zIndex: 1000,
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
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedItem(null)}>
          <div 
            className="details-modal"
            style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '24px', maxWidth: '900px', width: '100%', display: 'flex', flexDirection: isRtl ? 'row-reverse' : 'row', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', position: 'relative' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelectedItem(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '1.2rem', cursor: 'pointer', zIndex: 10 }}>&times;</button>
            <div style={{ flex: '1', minHeight: '400px' }}>
              <img src={selectedItem.image} alt={selectedItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: '1', padding: '40px', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '8px', color: 'var(--text-main)', fontWeight: 700 }}> {isRtl ? selectedItem.nameAr : selectedItem.name} </h2>
              <span style={{ fontSize: '1.5rem', color: 'var(--text-soft)', marginBottom: '24px' }}> ${selectedItem.price} </span>
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
        .admin-action-btn:hover { transform: scale(1.1); transition: 0.2s; }
        .fixed-add-btn:hover { transform: translateY(-3px); transition: 0.3s; box-shadow: 0 15px 40px rgba(0,0,0,0.6) !important; }
        .category-modal::-webkit-scrollbar { width: 6px; }
        .category-modal::-webkit-scrollbar-thumb { background: var(--line-soft); borderRadius: 10px; }
      `}</style>
    </main>
  );
}
