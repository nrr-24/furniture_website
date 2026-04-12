'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../data/LanguageContext';
import { FurnitureItem, Category } from '../../data/furnitureData';
import { useFurniture } from '../../data/FurnitureContext';
import { useAuth } from '../../data/AuthContext';
import { useCart } from '../../data/CartContext';
import FurnitureManager from '../../components/FurnitureManager';

const FALLBACK_IMAGE = 'https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/BEEZ%20BLUE.png';

export default function ShopPage() {
  const { t, isRtl } = useLanguage();
  const { 
    items, categories, initialized, 
    addItem, updateItem, deleteItem, deleteMultipleItems, reorderItems,
    addCategory, updateCategory, deleteCategory, reorderCategories 
  } = useFurniture();
  const { isAdmin, isCustomer } = useAuth();
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

  // Modals & States
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<FurnitureItem | null>(null);
  
  // Management States
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Confirmation Modals
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'product' | 'batch' | 'category', id?: string, count?: number, name?: string } | null>(null);

  if (!initialized) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-soft)' }}>Loading Collections...</div>;

  const groupedItems = categories.map(cat => ({
    ...cat,
    products: items.filter(item => item.categoryId === cat.id).sort((a, b) => a.sortOrder - b.sortOrder)
  }));

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    await deleteMultipleItems(selectedIds);
    setSelectedIds([]);
    setConfirmDelete(null);
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    setConfirmDelete(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Reordering Logic (Using Arrow Buttons as requested "functionality" for sorting)
  const moveCategory = async (index: number, direction: 'up' | 'down') => {
    const newCats = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCats.length) return;
    
    [newCats[index], newCats[targetIndex]] = [newCats[targetIndex], newCats[index]];
    await reorderCategories(newCats);
  };

  const moveProduct = async (categoryId: string, index: number, direction: 'up' | 'down') => {
    const catProducts = groupedItems.find(g => g.id === categoryId)?.products || [];
    const newProducts = [...catProducts];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newProducts.length) return;

    [newProducts[index], newProducts[targetIndex]] = [newProducts[targetIndex], newProducts[index]];
    await reorderItems(categoryId, newProducts);
  };

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} style={{ padding: '40px 60px', flex: 1, overflowY: 'auto', position: 'relative' }}>
      <div className="container">
        <header style={{ marginBottom: '60px', textAlign: 'center', position: 'relative' }}>
          <span className="section-kicker" style={{ fontSize: '1rem', letterSpacing: '2px', opacity: 0.8 }}>{t('premiumCollections')}</span>
          <h1 className="smartwood-title" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}>{t('collections')}</h1>
          <p className="section-text mx-auto" style={{ color: 'var(--text-soft)' }}>{t('collectionDesc')}</p>
          
          {isAdmin && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
              <button 
                onClick={() => setIsManageMode(!isManageMode)}
                className="hero-secondary-btn"
                style={{ padding: '8px 20px', fontSize: '0.9rem', borderColor: isManageMode ? 'var(--blue-accent)' : 'var(--line-soft)', color: isManageMode ? 'var(--blue-accent)' : 'var(--text-soft)' }}
              >
                <i className={`bi ${isManageMode ? 'bi-check-circle-fill' : 'bi-gear'}`}></i> {isManageMode ? (isRtl ? 'إنهاء الإدارة' : 'Exit Management') : (isRtl ? 'إدارة المعرض' : 'Manage Gallery')}
              </button>
              <button 
                onClick={() => setIsCategoryManagerOpen(true)}
                className="hero-secondary-btn"
                style={{ padding: '8px 20px', fontSize: '0.9rem' }}
              >
                <i className="bi bi-tags"></i> {isRtl ? 'الفئات' : 'Categories'}
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
              style={{
                padding: '10px 24px', borderRadius: '50px', background: 'var(--blue-deep)',
                color: 'var(--text-main)', border: '1px solid var(--blue-accent)',
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
          <section id={`category-${group.id}`} key={group.id} style={{ marginBottom: '80px', scrollMarginTop: '160px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
              <h2 className="section-title" style={{ margin: 0 }}>{isRtl ? group.nameAr : group.name}</h2>
              {isManageMode && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button disabled={groupIdx === 0} onClick={() => moveCategory(groupIdx, 'up')} style={{ background: 'none', border: '1px solid var(--line-soft)', color: 'var(--text-soft)', cursor: 'pointer', borderRadius: '4px', opacity: groupIdx === 0 ? 0.3 : 1 }}><i className="bi bi-chevron-up"></i></button>
                  <button disabled={groupIdx === categories.length - 1} onClick={() => moveCategory(groupIdx, 'down')} style={{ background: 'none', border: '1px solid var(--line-soft)', color: 'var(--text-soft)', cursor: 'pointer', borderRadius: '4px', opacity: groupIdx === categories.length - 1 ? 0.3 : 1 }}><i className="bi bi-chevron-down"></i></button>
                  <button onClick={() => setConfirmDelete({ type: 'category', id: group.id, name: isRtl ? group.nameAr : group.name, count: group.products.length })} style={{ background: 'none', border: '1px solid #ff4d4d', color: '#ff4d4d', cursor: 'pointer', borderRadius: '4px' }}><i className="bi bi-trash"></i></button>
                </div>
              )}
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--line-soft)' }}></div>
            </div>

            {group.products.length > 0 ? (
              <div className="row g-4">
                {group.products.map((item, idx) => {
                  const cartItem = cart.find(i => i.id === item.id);
                  const inCart = !!cartItem;
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <div className="col-md-6 col-lg-4" key={item.id}>
                      <div
                        className={`furniture-card position-relative ${isSelected ? 'selected-card' : ''}`}
                        style={{ 
                          cursor: 'pointer', 
                          background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.03)',
                          border: isSelected ? '1px solid var(--blue-accent)' : '1px solid transparent'
                        }}
                        onClick={() => isManageMode ? toggleSelect(item.id) : !isAdmin && setSelectedItem(item)}
                      >
                        {/* Manager Controls */}
                        {isManageMode && (
                           <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 11 }}>
                             <input 
                               type="checkbox" 
                               checked={isSelected} 
                               onChange={() => toggleSelect(item.id)}
                               style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                               onClick={(e) => e.stopPropagation()}
                             />
                           </div>
                        )}

                        {isAdmin && isManageMode && (
                          <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, display: 'flex', gap: '8px' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); moveProduct(group.id, idx, 'up'); }}
                              disabled={idx === 0}
                              style={{ background: 'var(--blue-deep)', color: 'var(--text-main)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: idx === 0 ? 0.5 : 1 }}
                            ><i className="bi bi-arrow-up"></i></button>
                            <button
                              onClick={(e) => { e.stopPropagation(); moveProduct(group.id, idx, 'down'); }}
                              disabled={idx === group.products.length - 1}
                              style={{ background: 'var(--blue-deep)', color: 'var(--text-main)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: idx === group.products.length - 1 ? 0.5 : 1 }}
                            ><i className="bi bi-arrow-down"></i></button>
                          </div>
                        )}

                        {isAdmin && !isManageMode && (
                          <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, display: 'flex', gap: '8px' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setItemToEdit(item); setIsEditorOpen(true); }}
                              style={{ background: 'var(--blue-deep)', color: 'var(--text-main)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                            ><i className="bi bi-pencil-fill"></i></button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'product', id: item.id, name: isRtl ? item.nameAr : item.name }); }}
                              style={{ background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
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
                  )
                })}
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--line-soft)' }}>
                <p style={{ color: 'var(--text-soft)', fontStyle: 'italic', margin: 0 }}>
                  {isRtl ? 'لا توجد منتجات في هذا القسم حالياً' : 'No products found in this category yet.'}
                </p>
              </div>
            )}
          </section>
        ))}

        {/* Floating Batch Actions Bar */}
        {isManageMode && selectedIds.length > 0 && (
          <div style={{
            position: 'fixed', bottom: '110px', left: '50%', transform: 'translateX(-50%)',
            background: 'var(--bg-panel)', padding: '15px 30px', borderRadius: '100px',
            display: 'flex', alignItems: 'center', gap: '20px', zIndex: 1000,
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)', border: '1px solid var(--blue-accent)'
          }}>
            <span style={{ fontWeight: 'bold' }}>{isRtl ? `${selectedIds.length} بنود مختارة` : `${selectedIds.length} items selected`}</span>
            <div style={{ width: '1px', height: '24px', background: 'var(--line-soft)' }}></div>
            <button 
              onClick={() => setConfirmDelete({ type: 'batch', count: selectedIds.length })}
              style={{ background: '#ff4d4d', border: 'none', color: 'white', padding: '6px 20px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              <i className="bi bi-trash-fill me-2"></i> {isRtl ? 'حذف الكل' : 'Delete All'}
            </button>
            <button 
              onClick={() => setSelectedIds([])}
              style={{ background: 'none', border: 'none', color: 'var(--text-soft)', cursor: 'pointer' }}
            >
              {isRtl ? 'إلغاء' : 'Clear'}
            </button>
          </div>
        )}

        {/* Global Admin Floating Add Button */}
        {isAdmin && !isEditorOpen && !isManageMode && (
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

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-panel)', padding: '40px', borderRadius: '24px', maxWidth: '500px', width: '100%', textAlign: 'center', border: '1px solid var(--line-soft)' }}>
             <div style={{ fontSize: '3rem', color: '#ff4d4d', marginBottom: '20px' }}>
                <i className="bi bi-exclamation-triangle-fill"></i>
             </div>
             <h3 style={{ fontSize: '1.8rem', marginBottom: '15px' }}>{isRtl ? 'هل أنت متأكد؟' : 'Are you sure?'}</h3>
             <p style={{ color: 'var(--text-soft)', marginBottom: '30px', fontSize: '1.1rem', lineHeight: '1.6' }}>
                {confirmDelete.type === 'product' && (isRtl ? `سيتم حذف "${confirmDelete.name}" نهائياً.` : `"${confirmDelete.name}" will be permanently deleted.`)}
                {confirmDelete.type === 'batch' && (isRtl ? `سيتم حذف ${confirmDelete.count} منتجات تم اختيارها نهائياً.` : `${confirmDelete.count} selected products will be permanently deleted.`)}
                {confirmDelete.type === 'category' && (isRtl ? `حذف فئة "${confirmDelete.name}" سيؤدي أيضاً إلى حذف ${confirmDelete.count} منتجات داخلها نهائياً.` : `Deleting "${confirmDelete.name}" will also permanently delete all ${confirmDelete.count} products inside it.`)}
             </p>
             <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  onClick={() => setConfirmDelete(null)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--blue-deep)', color: 'var(--text-main)', border: '1px solid var(--line-soft)', cursor: 'pointer', fontWeight: 'bold' }}
                >{isRtl ? 'إلغاء' : 'Cancel'}</button>
                <button 
                  onClick={() => {
                    if (confirmDelete.type === 'product' && confirmDelete.id) deleteItem(confirmDelete.id);
                    else if (confirmDelete.type === 'batch') handleBatchDelete();
                    else if (confirmDelete.type === 'category' && confirmDelete.id) handleDeleteCategory(confirmDelete.id);
                    setConfirmDelete(null);
                  }}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#ff4d4d', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >{isRtl ? 'حذف نهائي' : 'Delete Permanently'}</button>
             </div>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {isCategoryManagerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-panel)', padding: '40px', borderRadius: '24px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
               <h3 style={{ margin: 0 }}>{isRtl ? 'إدارة الفئات' : 'Manage Categories'}</h3>
               <button onClick={() => setIsCategoryManagerOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '2rem' }}>&times;</button>
            </div>
            
            <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
               <h4 style={{ fontSize: '1rem', marginBottom: '15px', color: 'var(--text-soft)' }}>{isRtl ? 'إضافة فئة جديدة' : 'Add New Category'}</h4>
               <form onSubmit={(e) => {
                 e.preventDefault();
                 const formData = new FormData(e.currentTarget);
                 addCategory(formData.get('name') as string, formData.get('nameAr') as string);
                 e.currentTarget.reset();
               }} className="d-flex gap-2">
                 <input name="name" placeholder="English Name" required style={{ flex: 1, background: 'var(--bg-main)', border: '1px solid var(--line-soft)', color: 'white', padding: '8px 12px', borderRadius: '8px' }} />
                 <input name="nameAr" placeholder="Arabic Name" required style={{ flex: 1, background: 'var(--bg-main)', border: '1px solid var(--line-soft)', color: 'white', padding: '8px 12px', borderRadius: '8px' }} />
                 <button type="submit" className="hero-primary-btn" style={{ padding: '8px 20px' }}><i className="bi bi-plus-lg"></i></button>
               </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categories.map((cat, idx) => (
                <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button disabled={idx === 0} onClick={() => moveCategory(idx, 'up')} style={{ background: 'none', border: 'none', color: 'var(--text-soft)', padding: 0, opacity: idx === 0 ? 0.3 : 1 }}><i className="bi bi-chevron-up"></i></button>
                    <button disabled={idx === categories.length - 1} onClick={() => moveCategory(idx, 'down')} style={{ background: 'none', border: 'none', color: 'var(--text-soft)', padding: 0, opacity: idx === categories.length - 1 ? 0.3 : 1 }}><i className="bi bi-chevron-down"></i></button>
                  </div>
                  <div style={{ flex: 1 }}>
                     <input 
                       defaultValue={cat.name} 
                       onBlur={(e) => updateCategory(cat.id, { name: e.target.value })}
                       style={{ background: 'none', border: 'none', color: 'white', display: 'block', fontSize: '1rem', width: '100%' }}
                     />
                     <input 
                       defaultValue={cat.nameAr} 
                       onBlur={(e) => updateCategory(cat.id, { nameAr: e.target.value })}
                       style={{ background: 'none', border: 'none', color: 'var(--text-soft)', display: 'block', fontSize: '0.9rem', width: '100%' }}
                     />
                  </div>
                  <button onClick={() => setConfirmDelete({ type: 'category', id: cat.id, name: isRtl ? cat.nameAr : cat.name, count: items.filter(i => i.categoryId === cat.id).length })} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}><i className="bi bi-trash"></i></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal (Admin Only) */}
      {isEditorOpen && isAdmin && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--bg-main)', zIndex: 9999, overflowY: 'auto', padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ maxWidth: '900px', width: '100%', position: 'relative' }}>
            <button onClick={() => setIsEditorOpen(false)} style={{ position: 'absolute', top: '-45px', right: '0', background: 'var(--blue-deep)', color: 'var(--text-main)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>&times;</button>
            <FurnitureManager initialItem={itemToEdit || undefined} onClose={() => setIsEditorOpen(false)} />
          </div>
        </div>
      )}

      {/* Item Details Modal (Customer Only) */}
      {selectedItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedItem(null)}>
          <div style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '24px', maxWidth: '900px', width: '100%', display: 'flex', flexDirection: 'row', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedItem(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '1.2rem', cursor: 'pointer', zIndex: 10 }}>&times;</button>
            <div style={{ flex: '1', minHeight: '400px' }}>
              <img src={selectedItem.image} alt={selectedItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: '1', padding: '40px', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '8px', color: 'var(--text-main)' }}> {isRtl ? selectedItem.nameAr : selectedItem.name} </h2>
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
        .selected-card {
          animation: cardPulse 2s infinite;
        }
        @keyframes cardPulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `}</style>
    </main>
  );
}
