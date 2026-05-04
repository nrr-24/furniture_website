'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '../../../../data/LanguageContext';
import { useAuth } from '../../../../data/AuthContext';
import { useFurniture } from '../../../../data/FurnitureContext';
import { FALLBACK_IMAGE } from '../../../../data/furnitureData';
import ProductDetailView from '../../../../components/ProductDetailView';
import FurnitureManager from '../../../../components/FurnitureManager';
import Footer from '../../../../components/layout/Footer';

export default function ProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { t, isRtl } = useLanguage();
  const { isAdmin } = useAuth();
  const { items, categories, initialized, updateItem } = useFurniture();

  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const item = useMemo(() => items.find(i => i.id === id), [items, id]);
  const category = useMemo(() => categories.find(c => c.id === item?.categoryId), [categories, item?.categoryId]);

  const suggested = useMemo(() => {
    if (!item) return [];
    return items
      .filter(i => i.categoryId === item.categoryId && i.id !== item.id)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, 8);
  }, [items, item]);

  if (!initialized) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-soft)' }}>
        {isRtl ? 'جاري التحميل…' : 'Loading…'}
      </div>
    );
  }

  if (!item) {
    return (
      <main dir={isRtl ? 'rtl' : 'ltr'} className="pp-main">
        <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>
            {isRtl ? 'المنتج غير موجود' : 'Product not found'}
          </h1>
          <p style={{ color: 'var(--text-soft)', marginBottom: '24px' }}>
            {isRtl ? 'ربما تم حذف هذا المنتج أو نقله.' : 'This item may have been removed or moved.'}
          </p>
          <Link href="/shop" className="hero-primary-btn" style={{ textDecoration: 'none' }}>
            {isRtl ? 'العودة إلى المتجر' : 'Back to Shop'}
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main dir={isRtl ? 'rtl' : 'ltr'} className="pp-main" style={{ flex: 1, overflowY: 'auto' }}>
      <div className="container" style={{ padding: '32px 40px 80px' }}>
        {/* Breadcrumb */}
        <nav className="pp-crumbs" aria-label="Breadcrumb">
          <Link href="/shop">{isRtl ? 'المتجر' : 'Shop'}</Link>
          <span className="pp-crumbs-sep">/</span>
          {category && (
            <>
              <Link href={`/shop#category-${category.id}`}>
                {isRtl ? category.nameAr || category.name : category.name}
              </Link>
              <span className="pp-crumbs-sep">/</span>
            </>
          )}
          <span className="pp-crumbs-current">
            {isRtl ? item.nameAr || item.name : item.name}
          </span>
        </nav>

        {/* Product detail body */}
        <ProductDetailView
          item={item}
          category={category}
          onEdit={isAdmin ? () => setIsEditorOpen(true) : undefined}
          onToggleFeatured={isAdmin ? () => updateItem(item.id, { isFeatured: !item.isFeatured }) : undefined}
        />

        {/* Suggested / more-from-this-collection */}
        {suggested.length > 0 && (
          <section className="pp-suggested" aria-label={isRtl ? 'اقتراحات' : 'You may also like'}>
            <header className="pp-suggested-header">
              <h2>
                {isRtl
                  ? `المزيد من ${category?.nameAr || category?.name || 'المجموعة'}`
                  : `More from ${category?.name || 'this collection'}`}
              </h2>
              <Link href={`/shop#category-${item.categoryId}`} className="pp-suggested-all">
                {isRtl ? 'عرض الكل' : 'View all'} <i className={`bi bi-arrow-${isRtl ? 'left' : 'right'}`} />
              </Link>
            </header>

            <div className="pp-suggested-rail">
              {suggested.map(s => {
                const hasSale = s.salePrice != null && s.salePrice > 0 && s.salePrice !== (s.originalPrice ?? s.price);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => router.push(`/shop/product/${s.id}`)}
                    className="pp-suggested-card"
                  >
                    <div className="pp-suggested-img">
                      <img src={s.image || FALLBACK_IMAGE} alt={isRtl ? s.nameAr : s.name} />
                      {(s.isFeatured || hasSale) && (
                        <div className="shop-card-tags">
                          {s.isFeatured && (
                            <span className="shop-card-tag tag-featured">
                              <i className="bi bi-star-fill" /> {isRtl ? 'مميّز' : 'Featured'}
                            </span>
                          )}
                          {hasSale && (
                            <span className="shop-card-tag tag-sale">
                              {isRtl ? 'تخفيض' : 'Sale'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="pp-suggested-meta">
                      <span className="pp-suggested-name">{isRtl ? s.nameAr || s.name : s.name}</span>
                      <span className="pp-suggested-price">
                        {hasSale && (
                          <span className="pp-suggested-strike">{(s.originalPrice ?? s.price)} {t('currency')}</span>
                        )}
                        <span className={hasSale ? 'pp-suggested-sale' : ''}>
                          {hasSale ? s.salePrice : (s.originalPrice ?? s.price)} {t('currency')}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Admin editor overlay (same pattern as the shop page) */}
      {isEditorOpen && isAdmin && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, overflowY: 'auto', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: '800px', width: '100%', position: 'relative', marginTop: '60px' }}>
            <button
              onClick={() => setIsEditorOpen(false)}
              className="shadow-lg"
              style={{ position: 'absolute', top: '15px', right: '25px', background: 'var(--text-main)', color: 'var(--bg-main)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10001 }}
            >&times;</button>
            <FurnitureManager initialItem={item} onClose={() => setIsEditorOpen(false)} />
          </div>
        </div>
      )}

      <Footer />

      <style jsx global>{`
        .pp-main {
          padding: 0;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          scroll-behavior: auto;
          background: var(--sand-soft);
          color: #0d1a63;
        }
        .pp-main .container { padding: 32px 40px 80px; }
        @media (max-width: 991px) { .pp-main .container { padding: 24px 24px 60px; } }
        @media (max-width: 600px) { .pp-main .container { padding: 16px 16px 48px; } }

        .pp-crumbs {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.82rem;
          color: rgba(13, 26, 99, 0.55);
          margin-bottom: 22px;
          flex-wrap: wrap;
        }
        .pp-crumbs a {
          color: rgba(13, 26, 99, 0.55);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .pp-crumbs a:hover { color: #0d1a63; }
        .pp-crumbs-sep { opacity: 0.5; }
        .pp-crumbs-current { color: #0d1a63; font-weight: 600; }

        .pp-suggested {
          margin-top: 56px;
        }
        .pp-suggested-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .pp-suggested-header h2 {
          margin: 0;
          font-size: clamp(1.3rem, 2vw, 1.6rem);
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #0d1a63;
        }
        .pp-suggested-all {
          color: rgba(13, 26, 99, 0.55);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s ease;
        }
        .pp-suggested-all:hover { color: #0d1a63; }

        .pp-suggested-rail {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 18px;
        }
        @media (max-width: 600px) {
          .pp-suggested-rail {
            display: flex;
            gap: 14px;
            overflow-x: auto;
            padding-bottom: 12px;
            margin: 0 -16px;
            padding-left: 16px;
            padding-right: 16px;
            scroll-snap-type: x proximity;
            overscroll-behavior-x: contain;
            -webkit-overflow-scrolling: touch;
          }
          .pp-suggested-rail > * {
            flex: 0 0 62vw;
            max-width: 260px;
            scroll-snap-align: start;
          }
        }

        .pp-suggested-card {
          /* Cream/navy palette matching the product detail card. */
          display: flex;
          flex-direction: column;
          background: #faf8f4;
          border: 1px solid rgba(13, 26, 99, 0.12);
          border-radius: 16px;
          overflow: hidden;
          padding: 0;
          cursor: pointer;
          text-align: left;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s ease;
          color: #0d1a63;
        }
        :global([dir="rtl"]) .pp-suggested-card { text-align: right; }
        .pp-suggested-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 32px rgba(34, 81, 164, 0.45);
          border-color: rgba(13, 26, 99, 0.3);
        }
        .pp-suggested-img {
          position: relative;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background: #ebe6db;
          border-bottom: 1px solid rgba(13, 26, 99, 0.08);
        }
        .pp-suggested-img img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .pp-suggested-card:hover .pp-suggested-img img {
          transform: scale(1.06);
        }
        .pp-suggested-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #d93a3a;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          padding: 3px 9px;
          border-radius: 999px;
          box-shadow: 0 2px 6px rgba(13, 26, 99, 0.25);
        }
        :global([dir="rtl"]) .pp-suggested-badge { left: auto; right: 10px; }
        .pp-suggested-meta {
          padding: 14px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pp-suggested-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0d1a63;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pp-suggested-price {
          display: inline-flex;
          gap: 8px;
          align-items: baseline;
          font-size: 0.9rem;
          color: rgba(13, 26, 99, 0.65);
          font-weight: 600;
        }
        .pp-suggested-strike {
          text-decoration: line-through;
          opacity: 0.65;
          font-size: 0.8rem;
        }
        .pp-suggested-sale { color: #d93a3a; font-weight: 800; }
      `}</style>
    </main>
  );
}
