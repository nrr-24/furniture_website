'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FurnitureItem, Category } from '../data/furnitureData';
import { useLanguage } from '../data/LanguageContext';
import { useAuth } from '../data/AuthContext';
import { useCart } from '../data/CartContext';

const FALLBACK_IMAGE = '/images/LOGO/image.png';

const CUSTOM_KEYWORDS = /wood|door|kitchen|custom|خش|باب|أبواب|مطبخ|مطابخ|تفصيل/;

function isCustomCategory(cat?: Category | null): boolean {
  if (!cat) return false;
  return CUSTOM_KEYWORDS.test(`${cat.name} ${cat.nameAr}`.toLowerCase());
}

interface ProductDetailViewProps {
  item: FurnitureItem;
  category?: Category | null;
  onEdit?: () => void;
  onToggleFeatured?: () => void;
}

export default function ProductDetailView({ item, category, onEdit, onToggleFeatured }: ProductDetailViewProps) {
  const { t, isRtl } = useLanguage();
  const { isCustomer, isAdmin } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  const allImages = useMemo(() => {
    const gallery = item.gallery && item.gallery.length > 0 ? item.gallery : [];
    const withMain = item.image && !gallery.includes(item.image) ? [item.image, ...gallery] : gallery;
    const final = withMain.length > 0 ? withMain : [item.image || FALLBACK_IMAGE];
    return Array.from(new Set(final.filter(Boolean)));
  }, [item.image, item.gallery]);

  const [activeIdx, setActiveIdx] = useState(0);
  const activeImg = allImages[activeIdx] ?? allImages[0];

  useEffect(() => {
    setActiveIdx(0);
  }, [item.id, allImages.length]);

  const goPrev = useCallback(() => {
    setActiveIdx(i => (i - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);
  const goNext = useCallback(() => {
    setActiveIdx(i => (i + 1) % allImages.length);
  }, [allImages.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (allImages.length <= 1) return;
      if (e.key === 'ArrowRight') (isRtl ? goPrev : goNext)();
      else if (e.key === 'ArrowLeft') (isRtl ? goNext : goPrev)();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goPrev, goNext, allImages.length, isRtl]);

  const [selectedType, setSelectedType] = useState<string | null>(item.types && item.types.length > 0 ? item.types[0] : null);
  const [selectedColor, setSelectedColor] = useState<string | null>(item.colors && item.colors.length > 0 ? item.colors[0] : null);
  const [qty, setQty] = useState(1);

  // Reset selectors when the item changes (navigating between products on
  // the same route, e.g. via the "More from this collection" strip).
  useEffect(() => {
    setSelectedType(item.types && item.types.length > 0 ? item.types[0] : null);
    setSelectedColor(item.colors && item.colors.length > 0 ? item.colors[0] : null);
    setQty(1);
  }, [item.id, item.types, item.colors]);

  const isCustom = isCustomCategory(category);

  const hasSale = item.salePrice != null && item.salePrice > 0 && item.salePrice !== (item.originalPrice ?? item.price);
  const regularPrice = item.originalPrice ?? item.price;
  const activePrice = hasSale ? item.salePrice! : regularPrice;

  const handleCta = () => {
    if (isCustom) {
      const productLabel = encodeURIComponent(isRtl ? item.nameAr || item.name : item.name);
      router.push(`/contact?productId=${item.id}&product=${productLabel}`);
      return;
    }
    const payload = {
      productId: item.id,
      name: isRtl ? item.nameAr || item.name : item.name,
      price: activePrice,
      image: activeImg || item.image,
      selectedColor: selectedColor || null,
      selectedType: selectedType || null,
    };
    for (let i = 0; i < qty; i++) addToCart(payload);
  };

  return (
    <div className="pd-wrap" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="pd-card">
        <div className="pd-images">
          {allImages.length > 1 && (
            <div className="pd-thumbs">
              {allImages.map((url, i) => (
                <button
                  key={`${url}-${i}`}
                  onClick={() => setActiveIdx(i)}
                  className={`pd-thumb ${activeIdx === i ? 'is-active' : ''}`}
                  aria-label={`${isRtl ? 'صورة' : 'Image'} ${i + 1}`}
                  aria-current={activeIdx === i}
                >
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          )}
          <div className="pd-main-img">
            <img src={activeImg || FALLBACK_IMAGE} alt={isRtl ? item.nameAr : item.name} />
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="pd-nav pd-nav-prev"
                  onClick={goPrev}
                  aria-label={isRtl ? 'الصورة التالية' : 'Previous image'}
                >
                  <i className={`bi bi-chevron-${isRtl ? 'right' : 'left'}`} />
                </button>
                <button
                  type="button"
                  className="pd-nav pd-nav-next"
                  onClick={goNext}
                  aria-label={isRtl ? 'الصورة السابقة' : 'Next image'}
                >
                  <i className={`bi bi-chevron-${isRtl ? 'left' : 'right'}`} />
                </button>
                <div className="pd-counter" aria-live="polite">
                  {activeIdx + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="pd-details">
          <h1 className="pd-title">{isRtl ? item.nameAr || item.name : item.name}</h1>
          <div className="pd-title-underline" />

          <div className="pd-price-row">
            {hasSale ? (
              <>
                <span className="pd-regular-price-strike">{regularPrice} {t('currency')}</span>
                <span className="pd-sale-price">{activePrice} {t('currency')}</span>
              </>
            ) : (
              <span className="pd-regular-price">{activePrice} {t('currency')}</span>
            )}
          </div>

          <p className="pd-description">
            <strong>{isRtl ? 'الوصف:' : 'Description:'}</strong>{' '}
            {isRtl ? item.descriptionAr || item.description : item.description}
          </p>
          <div className="pd-desc-underline" />

          {item.types && item.types.length > 0 && (
            <div className="pd-selector-row">
              <span className="pd-selector-label">{isRtl ? 'النوع' : 'TYPE'}</span>
              <div className="pd-type-options">
                {item.types.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`pd-type-pill ${selectedType === type ? 'is-active' : ''}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {item.colors && item.colors.length > 0 && (
            <div className="pd-selector-row">
              <span className="pd-selector-label">{isRtl ? 'اللون' : 'COLOR'}</span>
              <div className="pd-color-options">
                {item.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`pd-color-swatch ${selectedColor === color ? 'is-active' : ''}`}
                    style={{ background: color }}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="pd-footer">
            {isAdmin ? (
              <>
                {onToggleFeatured && (
                  <button
                    className={`pd-feature-toggle ${item.isFeatured ? 'is-on' : ''}`}
                    onClick={onToggleFeatured}
                    aria-pressed={!!item.isFeatured}
                  >
                    <i className={`bi ${item.isFeatured ? 'bi-star-fill' : 'bi-star'}`} />
                    {item.isFeatured
                      ? (isRtl ? 'مميّز — اضغط لإلغاء' : 'Featured — click to unfeature')
                      : (isRtl ? 'تمييز على صفحة المجموعات' : 'Mark as Featured')}
                  </button>
                )}
                {onEdit && (
                  <button className="pd-cta pd-cta-edit" onClick={onEdit}>
                    <i className="bi bi-pencil-fill me-2" />
                    {isRtl ? 'تعديل المنتج' : 'EDIT ITEM'}
                  </button>
                )}
              </>
            ) : (
              <>
                {!isCustom && isCustomer && (
                  <div className="pd-qty">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">
                      <i className="bi bi-chevron-left" />
                    </button>
                    <span>{String(qty).padStart(2, '0')}</span>
                    <button onClick={() => setQty((q) => q + 1)} aria-label="Increase">
                      <i className="bi bi-chevron-right" />
                    </button>
                  </div>
                )}

                {(isCustom || isCustomer) ? (
                  <button className="pd-cta" onClick={handleCta}>
                    {isCustom
                      ? (isRtl ? 'طلب عرض سعر' : 'GET QUOTE')
                      : (isRtl ? 'أضف إلى العربة' : 'ADD TO CART')}
                  </button>
                ) : (
                  <div className="pd-login-hint">
                    {isRtl ? 'للتسوق، يرجى التسجيل' : 'Login to buy'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .pd-wrap { width: 100%; }
        .pd-card {
          /* Cream panel matching the homepage hero. Scoped color tokens used by
             child rules below so we never leak these into global context. */
          --pd-ink: #0d1a63;
          --pd-ink-soft: rgba(13, 26, 99, 0.62);
          --pd-line: rgba(13, 26, 99, 0.12);
          --pd-surface: var(--sand-soft);

          background: var(--pd-surface);
          color: var(--pd-ink);
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: ${isRtl ? 'row-reverse' : 'row'};
          min-height: 540px;
          border: 1px solid var(--pd-line);
        }
        .pd-images {
          flex: 1.15;
          display: flex;
          flex-direction: row;
          background: #fff;
          min-height: 480px;
        }
        .pd-thumbs {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 18px 10px;
          overflow-y: auto;
          max-height: 640px;
          background: rgba(13, 26, 99, 0.05);
        }
        .pd-thumb {
          width: 64px;
          height: 64px;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid transparent;
          background: transparent;
          padding: 0;
          cursor: pointer;
          transition: border-color 0.2s ease, transform 0.2s ease;
          flex-shrink: 0;
        }
        .pd-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .pd-thumb.is-active {
          border-color: var(--pd-ink);
          transform: scale(1.04);
        }
        .pd-main-img {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .pd-main-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pd-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 42px;
          height: 42px;
          border: none;
          border-radius: 50%;
          background: rgba(0,0,0,0.55);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(4px);
          transition: background 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
          opacity: 0;
          z-index: 5;
          font-size: 1.1rem;
        }
        .pd-main-img:hover .pd-nav,
        .pd-nav:focus-visible { opacity: 1; }
        .pd-nav:hover { background: rgba(0,0,0,0.75); transform: translateY(-50%) scale(1.05); }
        .pd-nav-prev { left: 14px; }
        .pd-nav-next { right: 14px; }
        :global([dir="rtl"]) .pd-nav-prev { left: auto; right: 14px; }
        :global([dir="rtl"]) .pd-nav-next { right: auto; left: 14px; }

        .pd-counter {
          position: absolute;
          bottom: 14px;
          right: 14px;
          background: rgba(0,0,0,0.55);
          color: #fff;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          padding: 4px 10px;
          border-radius: 999px;
          backdrop-filter: blur(4px);
          z-index: 5;
        }
        :global([dir="rtl"]) .pd-counter { right: auto; left: 14px; }

        @media (hover: none) {
          .pd-nav { opacity: 0.9; }
        }

        .pd-details {
          flex: 1;
          padding: 44px 40px;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        .pd-title {
          font-size: clamp(1.8rem, 2.6vw, 2.4rem);
          font-weight: 800;
          color: var(--pd-ink);
          margin: 0 0 6px;
          letter-spacing: -0.01em;
          line-height: 1.15;
        }
        .pd-title-underline,
        .pd-desc-underline {
          width: 64px;
          height: 2px;
          background: var(--pd-ink);
          opacity: 0.55;
          margin-bottom: 22px;
        }
        .pd-price-row {
          display: flex;
          align-items: baseline;
          gap: 14px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .pd-regular-price { font-size: 1.7rem; font-weight: 700; color: var(--pd-ink); }
        .pd-regular-price-strike { font-size: 1.15rem; color: var(--pd-ink-soft); text-decoration: line-through; text-decoration-thickness: 2px; }
        .pd-sale-price { font-size: 1.8rem; font-weight: 800; color: #d93a3a; }

        .pd-description {
          color: var(--pd-ink-soft);
          line-height: 1.75;
          font-size: 0.98rem;
          margin: 0 0 14px;
        }
        .pd-description strong { color: var(--pd-ink); font-weight: 700; }

        .pd-selector-row {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--pd-line);
        }
        .pd-selector-label {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: var(--pd-ink-soft);
          text-transform: uppercase;
          min-width: 58px;
        }
        .pd-type-options, .pd-color-options {
          display: flex; gap: 10px; flex-wrap: wrap;
        }
        .pd-type-pill {
          padding: 8px 16px; border-radius: 10px;
          border: 1px solid var(--pd-line);
          background: #fff; color: var(--pd-ink);
          cursor: pointer; font-size: 0.85rem; font-weight: 600;
          transition: all 0.2s ease;
        }
        .pd-type-pill:hover { border-color: var(--pd-ink); }
        .pd-type-pill.is-active {
          background: var(--pd-ink); color: var(--pd-surface);
          border-color: var(--pd-ink);
        }
        .pd-color-swatch {
          width: 34px; height: 34px; border-radius: 8px;
          border: 2px solid var(--pd-line);
          padding: 0; cursor: pointer; transition: all 0.2s ease;
        }
        .pd-color-swatch.is-active {
          border-color: var(--pd-ink); transform: scale(1.08);
          box-shadow: 0 0 0 2px var(--pd-surface), 0 0 0 4px var(--pd-ink);
        }

        .pd-footer {
          margin-top: auto;
          padding-top: 28px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .pd-qty {
          display: flex; align-items: center; justify-content: flex-end; gap: 14px;
          padding: 6px 10px;
          background: #fff;
          border: 1px solid var(--pd-line);
          border-radius: 10px;
          width: fit-content;
          align-self: flex-end;
        }
        .pd-qty button {
          width: 30px; height: 30px; border: none; background: transparent;
          color: var(--pd-ink); cursor: pointer; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
        }
        .pd-qty button:hover { background: rgba(13, 26, 99, 0.08); }
        .pd-qty span { font-weight: 700; min-width: 28px; text-align: center; color: var(--pd-ink); }

        .pd-cta {
          width: 100%; padding: 18px;
          background: var(--pd-ink); color: var(--pd-surface);
          border: none; border-radius: 14px;
          font-size: 1.05rem; font-weight: 700; letter-spacing: 0.08em;
          cursor: pointer;
          transition: transform 0.15s ease, opacity 0.15s ease;
        }
        .pd-cta:hover { opacity: 0.92; transform: translateY(-1px); }
        .pd-cta-edit {
          background: #2e5bff; color: #fff;
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
        }
        .pd-feature-toggle {
          width: 100%; padding: 12px 16px;
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          background: rgba(181, 138, 0, 0.08); color: #8a6700;
          border: 1px solid rgba(181, 138, 0, 0.35);
          border-radius: 12px;
          font-size: 0.9rem; font-weight: 700; letter-spacing: 0.02em;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
        }
        .pd-feature-toggle:hover {
          background: rgba(181, 138, 0, 0.14);
          border-color: rgba(181, 138, 0, 0.6);
          transform: translateY(-1px);
        }
        .pd-feature-toggle.is-on {
          background: rgba(255, 199, 0, 0.2);
          border-color: #b58a00;
          color: #8a6700;
        }
        .pd-feature-toggle i { color: #b58a00; }
        .pd-login-hint {
          text-align: center; color: var(--pd-ink-soft); font-size: 0.9rem; padding: 14px;
        }

        @media (max-width: 820px) {
          .pd-card { flex-direction: column !important; min-height: auto; }
          .pd-images { min-height: 300px; max-height: 60vh; }
          .pd-thumbs { flex-direction: row; max-height: none; max-width: 100%; padding: 8px; }
          .pd-thumb { width: 56px; height: 56px; }
          .pd-details { padding: 28px 24px; }
          .pd-title { font-size: 1.6rem; }
        }
      `}</style>
    </div>
  );
}
