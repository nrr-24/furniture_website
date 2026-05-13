'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../data/LanguageContext';
import { FurnitureItem, Category, FALLBACK_IMAGE } from '../../data/furnitureData';
import { useFurniture } from '../../data/FurnitureContext';
import { useAuth } from '../../data/AuthContext';
import { useCart } from '../../data/CartContext';
import FurnitureManager from '../../components/FurnitureManager';
import Footer from '../../components/layout/Footer';


const CATEGORY_ICON_MAP: Record<string, string> = {
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
  'wood': 'bi-tree-fill', 'خشب': 'bi-tree-fill',
};

function getCategoryIcon(name: string, nameAr: string): string {
  const words = `${name} ${nameAr}`.toLowerCase().split(/\s+/);
  const match = words.find(w => CATEGORY_ICON_MAP[w]);
  return match ? CATEGORY_ICON_MAP[match] : 'bi-grid';
}

export default function ShopPage() {
  const router = useRouter();
  const { t, isRtl } = useLanguage();
  const {
    items, categories, initialized,
    addItem, updateItem, deleteItem, reorderItems,
    addCategory, updateCategory, deleteCategory, reorderCategories
  } = useFurniture();
  const { isAdmin, isCustomer } = useAuth();
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

  // Modals & States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<FurnitureItem | null>(null);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  const openProduct = (id: string) => router.push(`/shop/product/${id}`);

  // Drag and Drop States
  const [draggedItem, setDraggedItem] = useState<{ id: string, index: number, categoryId?: string, type: 'product' | 'category' } | null>(null);

  // Confirmation Modals
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'product' | 'category', id?: string, count?: number, name?: string } | null>(null);

  // Rotating hero showcase state
  const heroSlides = useMemo(() => {
    return categories
      .map(cat => {
        const catItems = items
          .filter(i => i.categoryId === cat.id)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        return {
          id: cat.id,
          name: cat.name,
          nameAr: cat.nameAr,
          image: catItems[0]?.image || '',
          count: catItems.length,
        };
      })
      .filter(c => !!c.image)
      .slice(0, 5);
  }, [categories, items]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [slidesPaused, setSlidesPaused] = useState(false);

  useEffect(() => {
    if (heroSlides.length < 2 || slidesPaused) return;
    const interval = setInterval(() => {
      setActiveSlide(i => (i + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [heroSlides.length, slidesPaused]);

  useEffect(() => {
    if (activeSlide >= heroSlides.length && heroSlides.length > 0) {
      setActiveSlide(0);
    }
  }, [heroSlides.length, activeSlide]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const handleCategoryClick = (id: string) => {
    setSelectedCategoryId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilter = () => {
    setSelectedCategoryId(null);
  };

  const scrollToCategory = (id: string) => {
    // If we're in filtered mode, clearing the filter then scrolling is tricky because of re-render
    // So let's just clear and show all.
    setSelectedCategoryId(null);
    setTimeout(() => {
      const el = document.getElementById(`category-${id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

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

  const filteredCategories = useMemo(() => {
    if (!selectedCategoryId) return groupedItems;
    return groupedItems.filter(cat => cat.id === selectedCategoryId);
  }, [groupedItems, selectedCategoryId]);

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} className="shop-main" style={{ flex: 1, overflowY: 'auto' }}>
      {/* 1. Rotating Collection Showcase */}
      <section
        className="shop-showcase"
        onMouseEnter={() => setSlidesPaused(true)}
        onMouseLeave={() => setSlidesPaused(false)}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="shop-showcase-media">
          {heroSlides.length > 0 ? (
            heroSlides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => scrollToCategory(slide.id)}
                className={`shop-showcase-slide ${i === activeSlide ? 'is-active' : ''}`}
                aria-label={isRtl ? `تصفح ${slide.nameAr}` : `Browse ${slide.name}`}
                tabIndex={i === activeSlide ? 0 : -1}
              >
                <img src={slide.image} alt="" aria-hidden="true" />
              </button>
            ))
          ) : (
            <div className="shop-showcase-slide is-active" aria-hidden="true">
              <img
                src="https://aaadpzivgyvnqukutccg.supabase.co/storage/v1/object/public/product-images/BEEZ.jpg"
                alt=""
              />
            </div>
          )}
          <div className="shop-showcase-scrim" />
        </div>

        <div className="shop-showcase-content">
          <span className="shop-showcase-kicker">{isRtl ? 'المجموعات' : 'COLLECTIONS'}</span>

          <h1 className="shop-showcase-title">
            {heroSlides.length > 0 ? (
              heroSlides.map((slide, i) => (
                <span
                  key={slide.id}
                  className={`shop-showcase-word ${i === activeSlide ? 'is-active' : ''}`}
                  aria-hidden={i !== activeSlide}
                >
                  <span className="shop-showcase-word-name">
                    {isRtl ? slide.nameAr || slide.name : slide.name}
                  </span>
                  <span className="shop-showcase-word-sub">
                    {isRtl ? 'مجموعة' : 'Collection'}
                  </span>
                </span>
              ))
            ) : (
              <span className="shop-showcase-word is-active">
                <span className="shop-showcase-word-name">
                  {isRtl ? 'المجموعات' : 'Our Collections'}
                </span>
              </span>
            )}
          </h1>

          <p className="shop-showcase-sub">
            {heroSlides[activeSlide]
              ? (isRtl
                ? `${heroSlides[activeSlide].count} قطعة مختارة بعناية`
                : `${heroSlides[activeSlide].count} piece${heroSlides[activeSlide].count === 1 ? '' : 's'} curated for your space`)
              : (isRtl
                ? 'اكتشف أثاثاً يجمع بين الراحة والأناقة.'
                : 'Explore furniture that harmoniously combines comfort and style.')}
          </p>

          <button
            className="shop-showcase-cta"
            onClick={() => {
              const target = heroSlides[activeSlide] || heroSlides[0];
              if (target) scrollToCategory(target.id);
              else if (categories[0]) scrollToCategory(categories[0].id);
            }}
          >
            {heroSlides[activeSlide]
              ? (isRtl ? `تصفح ${heroSlides[activeSlide].nameAr || heroSlides[activeSlide].name}` : `Browse ${heroSlides[activeSlide].name}`)
              : (isRtl ? 'استكشف العروض' : 'Browse All')}
            <i className={`bi bi-arrow-${isRtl ? 'left' : 'right'}`} />
          </button>

          {heroSlides.length > 1 && (
            <div className="shop-showcase-dots" role="tablist" aria-label={isRtl ? 'المجموعات' : 'Collections'}>
              {heroSlides.map((slide, i) => (
                <button
                  key={slide.id}
                  role="tab"
                  aria-selected={i === activeSlide}
                  aria-label={isRtl ? slide.nameAr : slide.name}
                  className={`shop-showcase-dot ${i === activeSlide ? 'is-active' : ''}`}
                  onClick={() => { setActiveSlide(i); setSlidesPaused(false); }}
                >
                  <span>{isRtl ? slide.nameAr : slide.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="container" style={{ paddingTop: '0px' }}>
        <div className="shop-layout">
          {/* 1. Desktop Sidebar */}
          <aside className="shop-sidebar">
            <button
              onClick={clearFilter}
              className={`shop-sidebar-category ${selectedCategoryId === null ? 'is-active' : ''}`}
            >
              <i className="bi bi-grid-fill" style={{ fontSize: '0.9rem' }}></i>
              <span>{isRtl ? 'الكل' : 'ALL PRODUCTS'}</span>
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`shop-sidebar-category ${selectedCategoryId === cat.id ? 'is-active' : ''}`}
              >
                <span>{isRtl ? cat.nameAr : cat.name}</span>
              </button>
            ))}
            {selectedCategoryId && (
              <button
                onClick={clearFilter}
                className="shop-sidebar-clear"
                style={{ marginLeft: '12px', flexShrink: 0 }}
                title={isRtl ? 'إزالة الفلتر' : 'Clear filter'}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </aside>

          {/* 2. Main Gallery Area */}
          <div className="shop-gallery" id="all-designs">
            {/* Header / Filter Status */}
            {/* Unity Header */}
            <div className="shop-header-samsung" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontWeight: 800, fontSize: '2rem', color: 'var(--bg-main)', letterSpacing: '-0.02em' }}>
                  {selectedCategoryId
                    ? (isRtl ? categories.find(c => c.id === selectedCategoryId)?.nameAr : categories.find(c => c.id === selectedCategoryId)?.name)
                    : (isRtl ? 'جميع التصاميم' : 'All Designs')
                  }
                </h2>
                <p style={{ margin: '4px 0 0', color: 'rgba(13, 26, 99, 0.45)', fontSize: '0.95rem', fontWeight: 500 }}>
                  {filteredCategories.reduce((acc, cat) => acc + cat.products.length, 0)} {isRtl ? 'قطعة متوفرة' : 'items found'}
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => setIsCategoryManagerOpen(true)}
                  className="hero-secondary-btn py-2 px-4 shadow-sm"
                  style={{ fontSize: '0.85rem', borderRadius: '12px', border: '1.5px solid var(--bg-main)', color: 'var(--bg-main)', fontWeight: 700 }}
                >
                  <i className="bi bi-tags-fill me-2"></i> {isRtl ? 'إدارة الفئات' : 'Edit Categories'}
                </button>
              )}
            </div>

            {/* Product Rendering */}
            {filteredCategories.map((group) => (
              <div key={group.id} id={`category-${group.id}`} style={{ marginBottom: selectedCategoryId ? '0' : '60px' }}>
                {!selectedCategoryId && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(13, 26, 99, 0.4)' }}>
                      {isRtl ? group.nameAr : group.name}
                    </h3>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(13, 26, 99, 0.1)' }}></div>
                  </div>
                )}

                <div className="samsung-grid">
                  {group.products.map((item, idx) => {
                    const defaultColor = item.colors?.[0] ?? null;
                    const defaultType = item.types?.[0] ?? null;
                    const cartItem = cart.find(i => i.productId === item.id);
                    const qty = cartItem?.quantity || 0;

                    return (
                      <div
                        key={item.id}
                        className="samsung-card"
                        onClick={() => openProduct(item.id)}
                        draggable={isAdmin}
                        onDragStart={(e) => handleProductDragStart(e, group.id, idx, item.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => { e.stopPropagation(); handleProductDrop(e, group.id, idx); }}
                        style={{ opacity: draggedItem?.id === item.id ? 0.3 : 1 }}
                      >
                        <div className="samsung-card-img">
                          <img src={item.image || FALLBACK_IMAGE} alt={isRtl ? item.nameAr : item.name} />
                          {isAdmin && (
                            <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, display: 'flex', gap: '6px' }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); updateItem(item.id, { isFeatured: !item.isFeatured }); }}
                                style={{ background: item.isFeatured ? '#ffd700' : 'white', color: item.isFeatured ? '#1a1a1a' : '#b58a00', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab' }}
                              ><i className={`bi ${item.isFeatured ? 'bi-star-fill' : 'bi-star'}`}></i></button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setItemToEdit(item); setIsEditorOpen(true); }}
                                style={{ background: 'white', color: 'black', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              ><i className="bi bi-pencil-fill"></i></button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'product', id: item.id, name: isRtl ? item.nameAr : item.name }); }}
                                style={{ background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              ><i className="bi bi-trash-fill"></i></button>
                            </div>
                          )}
                          {!isAdmin && item.isFeatured && (
                            <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10 }}>
                              <span style={{ background: '#ffd700', color: '#000', fontSize: '0.65rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
                                {isRtl ? 'مميّز' : 'Featured'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="samsung-card-info">
                          <h4 className="samsung-card-title">{isRtl ? item.nameAr || item.name : item.name}</h4>
                          <span className="samsung-card-sub">{isRtl ? group.nameAr : group.name}</span>
                          
                          {/* Color Swatches */}
                          {item.colors && item.colors.length > 0 && (
                            <div style={{ display: 'flex', gap: '6px', margin: '8px 0', justifyContent: 'center' }}>
                              {item.colors.slice(0, 6).map((c, idx) => (
                                <div 
                                  key={idx} 
                                  style={{ 
                                    width: '12px', 
                                    height: '12px', 
                                    borderRadius: '50%', 
                                    background: c, 
                                    border: '1px solid rgba(13, 26, 99, 0.1)',
                                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                                  }} 
                                />
                              ))}
                            </div>
                          )}

                          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px', justifyContent: 'center', width: '100%' }}>
                            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--bg-main)', margin: 0 }}>
                              {item.salePrice ?? item.price} {t('currency')}
                            </span>
                            {item.salePrice && item.salePrice < item.price && (
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2251A4', whiteSpace: 'nowrap' }}>
                                {isRtl ? `وفر ${item.price - item.salePrice}` : `Save ${item.price - item.salePrice}`}
                              </span>
                            )}
                          </div>

                          <div className="samsung-card-actions" style={{ justifyContent: isAdmin ? 'center' : 'space-between' }}>
                            {/* Quantity Controls / Add to Cart - HIDDEN for Admins */}
                            {!isAdmin && (() => {
                              const cartItem = cart.find(i => i.productId === item.id);
                              const qty = cartItem?.quantity || 0;

                              if (qty === 0) {
                                return (
                                  <button
                                    className="samsung-btn samsung-btn-primary"
                                    style={{ borderRadius: '50%', width: '44px', height: '44px', flex: 'none' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToCart({
                                        productId: item.id,
                                        name: isRtl ? item.nameAr || item.name : item.name,
                                        price: item.salePrice ?? item.price,
                                        image: item.image,
                                        selectedColor: defaultColor,
                                        selectedType: defaultType,
                                      });
                                    }}
                                  >
                                    <i className="bi bi-cart-plus" style={{ fontSize: '1.2rem' }}></i>
                                  </button>
                                );
                              }

                              return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(13, 26, 99, 0.04)', padding: '4px 10px', borderRadius: '999px' }}>
                                  <button
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      if (!cartItem) return;
                                      if (qty > 1) {
                                        updateQuantity(cartItem.id, qty - 1);
                                      } else {
                                        removeFromCart(cartItem.id);
                                      }
                                    }}
                                    style={{ border: 'none', background: 'none', color: qty === 1 ? '#ff4d4d' : 'var(--bg-main)', padding: '4px', display: 'flex', alignItems: 'center', transition: 'all 0.2s ease' }}
                                  >
                                    <i className={`bi ${qty === 1 ? 'bi-trash3-fill' : 'bi-dash-lg'}`} style={{ fontSize: '0.9rem' }}></i>
                                  </button>
                                  <span style={{ fontWeight: 800, color: 'var(--bg-main)', minWidth: '18px', textAlign: 'center', fontSize: '0.85rem' }}>{qty}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!cartItem) return;
                                      updateQuantity(cartItem.id, qty + 1);
                                    }}
                                    style={{ border: 'none', background: 'none', color: 'var(--bg-main)', padding: '4px', display: 'flex', alignItems: 'center' }}
                                  >
                                    <i className="bi bi-plus-lg" style={{ fontSize: '0.9rem' }}></i>
                                  </button>
                                </div>
                              );
                            })()}

                            <button
                              className="samsung-details-link"
                              onClick={(e) => { e.stopPropagation(); openProduct(item.id); }}
                              style={{ flex: isAdmin ? '1' : 'none', justifyContent: isAdmin ? 'center' : 'flex-start' }}
                            >
                              {isRtl ? 'التفاصيل' : 'Learn More'}
                              <i className={`bi ${isRtl ? 'bi-arrow-left-short' : 'bi-arrow-right-short'} ms-1`}></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredCategories.length === 0 && (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <i className="bi bi-search" style={{ fontSize: '3rem', opacity: 0.1, marginBottom: '20px', display: 'block' }}></i>
                <h3 style={{ fontWeight: 800 }}>{isRtl ? 'لا توجد منتجات' : 'No products found'}</h3>
                <button onClick={clearFilter} className="samsung-btn samsung-btn-secondary mt-3" style={{ maxWidth: '200px', margin: '0 auto' }}>
                  {isRtl ? 'إظهار الكل' : 'View All Products'}
                </button>
              </div>
            )}
          </div>
        </div>

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
              <h4 style={{ fontSize: '0.8rem', marginBottom: 'px', color: 'var(--text-soft)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{isRtl ? 'فئة جديدة' : 'Add New Category'}</h4>
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

      <style jsx global>{`
        .shop-main {
          padding: 0;
          /* iOS momentum + keep scroll-chain inside this container so the body
             doesn't get tugged when we reach the top/bottom of the page. */
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          scroll-behavior: auto;
        }
        .shop-main .container { padding: 0 40px; }
        @media (max-width: 991px) { .shop-main .container { padding: 0 24px; } }
        @media (max-width: 600px) { .shop-main .container { padding: 0 16px; } }

        /* Rotating Collection Showcase (self-contained, full-bleed image + scrim) */
        .shop-showcase {
          position: relative;
          width: 100%;
          /* Compact "banner" feel — shorter than a full hero, taller than a
             strip. Mobile default is on the lower end of the clamp. */
          min-height: min(420px, 56vh);
          /* Minimal breathing room before the category bar. */
          margin-bottom: 10px;
          overflow: hidden;
          isolation: isolate;
          background: #0a0f2e;
          /* Scope layout + paint so scrolling never needs to recompute anything
             inside this hero — the absolute slides and Ken Burns animation
             stay contained. */
          contain: layout paint;
        }

        .shop-showcase-media {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .shop-showcase-slide {
          position: absolute;
          inset: 0;
          border: none;
          padding: 0;
          margin: 0;
          background: transparent;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.9s ease;
          overflow: hidden;
        }
        .shop-showcase-slide.is-active { opacity: 1; z-index: 1; }
        .shop-showcase-slide img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.02);
          transition: transform 6s ease;
        }
        .shop-showcase-slide.is-active img { transform: scale(1.08); }

        .shop-showcase-scrim {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background: linear-gradient(180deg,
            rgba(6,10,35,0.72) 0%,
            rgba(6,10,35,0.45) 40%,
            rgba(6,10,35,0.82) 100%);
        }

        .shop-showcase-content {
          position: relative;
          z-index: 3;
          min-height: inherit;
          /* Tighter vertical padding to match the shorter banner. */
          padding: clamp(36px, 5.5vw, 64px) clamp(24px, 6vw, 64px);
          display: flex;
          flex-direction: column;
          gap: 18px;
          color: #fff;
          text-align: center;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .shop-showcase-content > * { pointer-events: auto; }

        .shop-showcase-kicker {
          font-size: 0.78rem;
          letter-spacing: 0.32em;
          font-weight: 700;
          text-transform: uppercase;
          color: rgba(255,255,255,0.8);
        }

        .shop-showcase-title {
          position: relative;
          margin: 0;
          width: 100%;
          min-height: clamp(5rem, 10vw, 7.5rem);
          line-height: 1;
        }
        .shop-showcase-word {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: inherit;
          justify-content: center;
          gap: 4px;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.6s ease, transform 0.6s ease;
          pointer-events: none;
        }
        .shop-showcase-word.is-active { opacity: 1; transform: translateY(0); }
        .shop-showcase-word-name {
          font-size: clamp(1.9rem, 3.8vw, 3.4rem);
          font-weight: 800;
          letter-spacing: -0.025em;
          color: #fff;
          line-height: 1.08;
          max-width: 100%;
          overflow-wrap: break-word;
          word-break: normal;
          hyphens: auto;
        }
        .shop-showcase-word-sub {
          font-size: clamp(0.95rem, 1.5vw, 1.3rem);
          font-weight: 300;
          letter-spacing: 0.02em;
          color: rgba(255,255,255,0.75);
        }

        .shop-showcase-sub {
          font-size: clamp(0.95rem, 1.2vw, 1.1rem);
          color: rgba(255,255,255,0.85);
          margin: 0;
          max-width: 520px;
        }

        .shop-showcase-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          margin-top: 6px;
          background: #fff;
          color: #0a0f2e;
          border: none;
          border-radius: 999px;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          box-shadow: 0 10px 28px rgba(34, 81, 164, 0.5);
        }
        .shop-showcase-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 36px rgba(34, 81, 164, 0.65);
        }
        .shop-showcase-cta i { font-size: 0.9rem; }

        .shop-showcase-dots {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          margin-top: 14px;
          max-width: 100%;
        }
        .shop-showcase-dot {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.25);
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s ease;
          backdrop-filter: blur(4px);
        }
        .shop-showcase-dot:hover {
          background: rgba(255,255,255,0.18);
          border-color: rgba(255,255,255,0.55);
          color: #fff;
        }
        .shop-showcase-dot.is-active {
          background: #fff;
          color: #0a0f2e;
          border-color: #fff;
        }
        .shop-showcase-dot span {
          display: inline-block;
          max-width: 16ch;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          vertical-align: middle;
        }

        /* Desktop: constrain content to the leading half, softer horizontal scrim.
           Uses logical properties so the layout mirrors automatically in RTL — no separate
           [dir="rtl"] override needed (previous override misused flex-end which in column-flex
           on RTL resolves to the LEFT cross-axis edge, so the Arabic title was stuck on the
           left of the content box). */
        @media (min-width: 992px) {
          .shop-showcase { min-height: min(420px, 52vh); }
          .shop-showcase-content {
            align-items: flex-start;
            text-align: start;
            max-width: min(640px, 55%);
            padding-inline-end: clamp(40px, 5vw, 64px);
          }
          .shop-showcase-dots { justify-content: flex-start; }
          .shop-showcase-scrim {
            background: linear-gradient(90deg,
              rgba(6,10,35,0.82) 0%,
              rgba(6,10,35,0.6) 35%,
              rgba(6,10,35,0.2) 65%,
              rgba(6,10,35,0.05) 100%);
          }
          [dir="rtl"] .shop-showcase-scrim {
            background: linear-gradient(270deg,
              rgba(6,10,35,0.82) 0%,
              rgba(6,10,35,0.6) 35%,
              rgba(6,10,35,0.2) 65%,
              rgba(6,10,35,0.05) 100%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .shop-showcase-word,
          .shop-showcase-slide,
          .shop-showcase-slide img { transition: none !important; }
          .shop-showcase-slide.is-active img { transform: none; }
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
          box-shadow: 0 6px 20px rgba(34, 81, 164, 0.42);
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
          box-shadow: 0 6px 18px rgba(34, 81, 164, 0.5);
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                      box-shadow 0.25s ease,
                      background 0.2s ease;
        }
        .cart-fab-add:hover {
          transform: translateY(-3px) scale(1.06);
          box-shadow: 0 12px 28px rgba(34, 81, 164, 0.62), 0 0 0 4px rgba(226, 218, 204, 0.18);
          background: #fff;
        }
        .cart-fab-add:active {
          transform: translateY(-1px) scale(0.96);
          box-shadow: 0 4px 12px rgba(34, 81, 164, 0.55);
        }
        .cart-fab-add i {
          line-height: 1;
        }

        .admin-action-btn:hover { transform: scale(1.1); transition: 0.2s; }
        .fixed-add-btn:hover { transform: translateY(-3px); transition: 0.3s; box-shadow: 0 15px 40px rgba(34, 81, 164, 0.75) !important; }
        .category-modal::-webkit-scrollbar { width: 6px; }
        .category-modal::-webkit-scrollbar-thumb { background: var(--line-soft); border-radius: 10px; }

        /* Featured Products Carousel */
        .featured-carousel-container {
          margin: 0 -40px;
          padding: 0 40px;
        }
        @media (max-width: 991px) {
          .featured-carousel-container { margin: 0 -24px; padding: 0 24px; }
        }
        @media (max-width: 600px) {
          .featured-carousel-container { margin: 0 -16px; padding: 0 16px; }
        }
        .samsung-details-link {
          background: none;
          border: none;
          color: var(--bg-main);
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          opacity: 0.6;
        }
        .samsung-details-link:hover {
          opacity: 1;
          transform: translateX(4px);
        }
        [dir="rtl"] .samsung-details-link:hover {
          transform: translateX(-4px);
        }
        .samsung-card-actions {
          display: flex;
          width: 100%;
          gap: 12px;
          justify-content: center;
          align-items: center;
        }
        .featured-carousel {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 16px;
          scroll-snap-type: x proximity;
          /* Keep horizontal swipes inside this strip so they don't fight the
             vertical page scroll when gestures cross axes. */
          overscroll-behavior-x: contain;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
        }
        .featured-carousel::-webkit-scrollbar { height: 6px; }
        .featured-carousel::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
        }
        .featured-carousel::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 10px;
        }
        .featured-carousel::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.28);
        }

        .compact-card {
          /* Cream/navy palette matching the product detail card and homepage hero. */
          flex: 0 0 auto;
          width: 180px;
          scroll-snap-align: start;
          background: var(--sand-soft);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 14px rgba(34, 81, 164, 0.3);
          border: 1px solid rgba(13, 26, 99, 0.12);
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s ease;
          display: flex;
          flex-direction: column;
        }
        .compact-card:hover {
          box-shadow: 0 12px 28px rgba(34, 81, 164, 0.4);
          border-color: rgba(13, 26, 99, 0.3);
        }
        .compact-img-wrapper {
          position: relative;
          width: 100%;
          height: 140px;
          overflow: hidden;
          background: #fff;
          border-bottom: 1px solid rgba(13, 26, 99, 0.08);
        }
        .compact-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .compact-card:hover .compact-img-wrapper img {
          transform: scale(1.05);
        }
        .compact-tag {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #0d1a63;
          color: var(--sand-soft);
          font-size: 0.6rem;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 999px;
          letter-spacing: 1px;
          text-transform: uppercase;
          box-shadow: 0 2px 6px rgba(34, 81, 164, 0.35);
        }
        [dir="rtl"] .compact-tag { left: auto; right: 10px; }
        .compact-info {
          padding: 12px 14px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .compact-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #0d1a63;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .compact-price {
          font-size: 0.78rem;
          color: rgba(13, 26, 99, 0.65);
          font-weight: 600;
        }

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
          box-shadow: 0 8px 24px rgba(34, 81, 164, 0.4);
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.2), box-shadow 0.4s ease;
        }
        .shop-item-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 16px 40px rgba(34, 81, 164, 0.6), 0 0 0 1px rgba(255,255,255,0.1);
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
          background: linear-gradient(to top, rgba(6, 10, 35, 0.95) 0%, rgba(6, 10, 35, 0.6) 20%, transparent 45%);
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

          /* Compact mobile card overrides for inline-styled elements */
          .samsung-card .samsung-card-actions {
            justify-content: center !important;
          }
          .samsung-card .samsung-btn-primary {
            width: 100% !important;
            height: 36px !important;
            border-radius: 10px !important;
          }
          .samsung-card .samsung-btn-primary i {
            font-size: 1rem !important;
          }
          .samsung-details-link {
            display: none !important;
          }
        }
      `}</style>
      <Footer />
    </main>
  );
}
