'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FurnitureItem, Category, FALLBACK_IMAGE } from '../data/furnitureData';
import { useLanguage } from '../data/LanguageContext';
import { useAuth } from '../data/AuthContext';
import { useCart } from '../data/CartContext';
import { useWishlist } from '../data/WishlistContext';


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

/* ============================================================
 * Product detail view (Smartwood 2026 redesign)
 *
 * Visual brief: image 2 from the mockup pack — large product image
 * on top, brand kicker, serif title, big price, circular color
 * swatches, and side-by-side ADD TO CART + WISHLIST buttons.
 *
 * All carousel, variant, quantity, and cart wiring is preserved from
 * the previous version. The CSS layer is the substantive change: new
 * palette tokens, serif title, circular swatches, and the new button
 * row. Wishlist is UI-only for now (no wishlist context exists).
 * ============================================================ */
export default function ProductDetailView({ item, category, onEdit, onToggleFeatured }: ProductDetailViewProps) {
  const { t, isRtl } = useLanguage();
  const { isCustomer, isAdmin } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
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
  const wishlisted = isWishlisted(item.id);

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

  // Brand kicker — show the category name when we have one, otherwise
  // a generic "SMARTWOOD COLLECTION" label so the design always has the
  // small uppercase eyebrow above the serif title (per image 2).
  const kicker = category
    ? (isRtl ? category.nameAr || category.name : category.name)
    : (isRtl ? 'مجموعة سمارت وود' : 'SMARTWOOD COLLECTION');

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
                <div className="pd-dots" role="tablist" aria-label={isRtl ? 'الصور' : 'Images'}>
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={activeIdx === i}
                      aria-label={`${isRtl ? 'صورة' : 'Image'} ${i + 1}`}
                      className={`pd-dot ${activeIdx === i ? 'is-active' : ''}`}
                      onClick={() => setActiveIdx(i)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="pd-details">
          <span className="pd-kicker">{kicker}</span>
          <h1 className="pd-title">{isRtl ? item.nameAr || item.name : item.name}</h1>

          <div className="pd-price-row">
            {hasSale ? (
              <>
                <span className="pd-regular-price-strike">{regularPrice} {t('currency')}</span>
                <span className="pd-sale-price">{activePrice} {t('currency')}</span>
              </>
            ) : (
              <span className="pd-regular-price">{activePrice} <span className="pd-currency">{t('currency')}</span></span>
            )}
          </div>

          <p className="pd-description">
            {isRtl ? item.descriptionAr || item.description : item.description}
          </p>

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
                      <i className="bi bi-dash" />
                    </button>
                    <span>{String(qty).padStart(2, '0')}</span>
                    <button onClick={() => setQty((q) => q + 1)} aria-label="Increase">
                      <i className="bi bi-plus" />
                    </button>
                  </div>
                )}

                {(isCustom || isCustomer) ? (
                  <div className="pd-action-row">
                    <button className="pd-cta pd-cta-primary" onClick={handleCta}>
                      {isCustom
                        ? (isRtl ? 'طلب عرض سعر' : 'GET QUOTE')
                        : (isRtl ? 'أضف إلى العربة' : 'ADD TO CART')}
                    </button>
                    {!isCustom && (
                      <button
                        className={`pd-cta pd-cta-wishlist ${wishlisted ? 'is-on' : ''}`}
                        onClick={() => toggleWishlist(item.id)}
                        aria-pressed={wishlisted}
                      >
                        <i className={`bi ${wishlisted ? 'bi-heart-fill' : 'bi-heart'}`} />
                        <span>{isRtl ? 'المفضلة' : 'WISHLIST'}</span>
                      </button>
                    )}
                  </div>
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
          /* Scoped tokens — kept as a thin layer over the new global palette
             so future tweaks to the product card don't perturb the rest of
             the site. */
          --pd-ink: var(--text-main);
          --pd-ink-soft: var(--text-soft);
          --pd-line: var(--line-soft);
          --pd-surface: var(--bg-panel);
          --pd-image-bg: var(--surface-soft);

          background: var(--pd-surface);
          color: var(--pd-ink);
          border-radius: var(--r-card);
          overflow: hidden;
          display: flex;
          flex-direction: ${isRtl ? 'row-reverse' : 'row'};
          min-height: 560px;
          border: 1px solid var(--pd-line);
        }
        .pd-images {
          flex: 1.15;
          display: flex;
          flex-direction: row;
          background: var(--pd-image-bg);
          min-height: 500px;
        }
        .pd-thumbs {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 18px 10px;
          overflow-y: auto;
          max-height: 640px;
          background: rgba(42, 32, 24, 0.04);
        }
        .pd-thumb {
          width: 64px;
          height: 64px;
          border-radius: 12px;
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
          background: rgba(31, 24, 18, 0.7);
          color: var(--bg-main);
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
        .pd-nav:hover { background: rgba(31, 24, 18, 0.9); transform: translateY(-50%) scale(1.05); }
        .pd-nav-prev { left: 14px; }
        .pd-nav-next { right: 14px; }
        :global([dir="rtl"]) .pd-nav-prev { left: auto; right: 14px; }
        :global([dir="rtl"]) .pd-nav-next { right: auto; left: 14px; }

        .pd-counter {
          position: absolute;
          bottom: 14px;
          right: 14px;
          background: rgba(31, 24, 18, 0.7);
          color: var(--bg-main);
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

        /* Dot pagination — hidden by default; mobile breakpoint below
           swaps it in for the thumbnail strip. */
        .pd-dots {
          display: none;
          position: absolute;
          left: 50%;
          bottom: 14px;
          transform: translateX(-50%);
          z-index: 5;
          gap: 8px;
          padding: 6px 12px;
          background: rgba(31, 24, 18, 0.55);
          backdrop-filter: blur(4px);
          border-radius: 999px;
          pointer-events: auto;
        }
        .pd-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          padding: 0;
          background: rgba(242, 235, 224, 0.55);
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease, width 0.25s ease;
        }
        .pd-dot:hover { background: rgba(242, 235, 224, 0.85); }
        .pd-dot.is-active {
          background: var(--bg-main);
          width: 22px;
          border-radius: 999px;
        }

        .pd-details {
          flex: 1;
          padding: 48px 44px;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        /* Brand kicker above the title — uppercase, tracked, soft. */
        .pd-kicker {
          font-family: var(--font-app);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--pd-ink-soft);
          margin-bottom: 14px;
        }

        .pd-title {
          font-family: var(--font-serif);
          font-size: clamp(2rem, 3vw, 2.8rem);
          font-weight: 500;
          color: var(--pd-ink);
          margin: 0 0 18px;
          letter-spacing: -0.015em;
          line-height: 1.08;
        }

        .pd-price-row {
          display: flex;
          align-items: baseline;
          gap: 14px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }
        .pd-regular-price {
          font-family: var(--font-app);
          font-size: 1.85rem;
          font-weight: 700;
          color: var(--pd-ink);
          letter-spacing: -0.01em;
        }
        .pd-currency {
          font-size: 0.95rem;
          font-weight: 600;
          opacity: 0.75;
          margin-left: 4px;
        }
        :global([dir="rtl"]) .pd-currency { margin-left: 0; margin-right: 4px; }
        .pd-regular-price-strike {
          font-size: 1.1rem;
          color: var(--pd-ink-soft);
          text-decoration: line-through;
          text-decoration-thickness: 2px;
        }
        .pd-sale-price {
          font-family: var(--font-app);
          font-size: 1.85rem;
          font-weight: 700;
          color: #a8553a;
        }

        .pd-description {
          color: var(--pd-ink-soft);
          line-height: 1.7;
          font-size: 0.96rem;
          margin: 0 0 28px;
          max-width: 56ch;
        }

        .pd-selector-row {
          display: flex;
          align-items: center;
          gap: 22px;
          margin-bottom: 22px;
        }
        .pd-selector-label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: var(--pd-ink-soft);
          text-transform: uppercase;
          min-width: 56px;
        }
        .pd-type-options, .pd-color-options {
          display: flex; gap: 10px; flex-wrap: wrap;
        }
        .pd-type-pill {
          padding: 9px 18px;
          border-radius: var(--r-pill);
          border: 1px solid var(--pd-line);
          background: var(--bg-main);
          color: var(--pd-ink);
          cursor: pointer;
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          transition: all 0.2s ease;
        }
        .pd-type-pill:hover { border-color: var(--pd-ink); }
        .pd-type-pill.is-active {
          background: var(--pd-ink);
          color: var(--bg-main);
          border-color: var(--pd-ink);
        }

        /* Circular color swatches (per image 2 mockup) — slightly larger
           than the old rounded squares, with a clean ring on active. */
        .pd-color-swatch {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--pd-line);
          padding: 0;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .pd-color-swatch:hover { transform: scale(1.08); }
        .pd-color-swatch.is-active {
          transform: scale(1.1);
          box-shadow: 0 0 0 2px var(--pd-surface), 0 0 0 3px var(--pd-ink);
        }

        .pd-footer {
          margin-top: auto;
          padding-top: 28px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          border-top: 1px solid var(--pd-line);
        }

        /* Quantity stepper — pill-shaped, sits above the action row. */
        .pd-qty {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 8px 14px;
          background: var(--bg-main);
          border: 1px solid var(--pd-line);
          border-radius: var(--r-pill);
          width: fit-content;
          align-self: ${isRtl ? 'flex-start' : 'flex-start'};
        }
        .pd-qty button {
          width: 30px;
          height: 30px;
          border: none;
          background: transparent;
          color: var(--pd-ink);
          cursor: pointer;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }
        .pd-qty button:hover { background: rgba(42, 32, 24, 0.06); }
        .pd-qty span { font-weight: 600; min-width: 28px; text-align: center; color: var(--pd-ink); }

        /* Action row — ADD TO CART (solid espresso) + WISHLIST (outlined),
           sized 65/35 on desktop, stacks 1fr/1fr on mobile. */
        .pd-action-row {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 12px;
        }

        .pd-cta {
          padding: 18px;
          border: none;
          border-radius: var(--r-pill);
          font-family: var(--font-app);
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          cursor: pointer;
          transition: transform 0.15s ease, opacity 0.15s ease, background 0.2s ease, color 0.2s ease;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          white-space: nowrap;
        }

        .pd-cta-primary {
          background: var(--pd-ink);
          color: var(--bg-main);
        }
        .pd-cta-primary:hover { opacity: 0.92; transform: translateY(-1px); }

        .pd-cta-wishlist {
          background: transparent;
          color: var(--pd-ink);
          border: 1px solid var(--pd-ink);
        }
        .pd-cta-wishlist:hover { background: var(--pd-ink); color: var(--bg-main); }
        .pd-cta-wishlist.is-on {
          background: var(--pd-ink);
          color: var(--bg-main);
        }
        .pd-cta-wishlist i { font-size: 1rem; }

        .pd-cta-edit {
          background: var(--accent-deep); color: var(--bg-main);
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
        }

        .pd-feature-toggle {
          width: 100%; padding: 12px 16px;
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          background: rgba(181, 138, 0, 0.08); color: #8a6700;
          border: 1px solid rgba(181, 138, 0, 0.35);
          border-radius: var(--r-pill);
          font-size: 0.85rem; font-weight: 600; letter-spacing: 0.04em;
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

        /* Tablet-down: card stacks (image on top, details below). The image
           block's internal layout flips so the main image sits above a
           horizontal thumbnail strip — much better than the awkward
           thumbs-on-left + main-on-right that gets squashed on narrow widths. */
        @media (max-width: 960px) {
          .pd-card {
            flex-direction: column !important;
            min-height: auto;
            border-radius: var(--r-card);
          }
          .pd-images {
            min-height: auto;
          }
          .pd-main-img {
            aspect-ratio: 4 / 3;
            min-height: 0;
            max-height: 56vh;
          }
          /* Drop the thumbnail strip on small screens — replaced by the
             dot pagination overlay inside the main image. */
          .pd-thumbs { display: none !important; }
          .pd-dots { display: inline-flex; }
          .pd-counter { top: 12px; bottom: auto; right: 12px; }
          [dir="rtl"] .pd-counter { right: auto; left: 12px; }
          .pd-details { padding: 28px 24px 24px; }
          .pd-kicker { margin-bottom: 10px; font-size: 0.66rem; }
          .pd-title { font-size: clamp(1.6rem, 5.5vw, 2rem); margin-bottom: 14px; }
          .pd-price-row { gap: 10px; margin-bottom: 18px; }
          .pd-regular-price, .pd-sale-price { font-size: 1.45rem; }
          .pd-regular-price-strike { font-size: 0.95rem; }
          .pd-description { font-size: 0.9rem; line-height: 1.6; margin-bottom: 22px; }
          .pd-selector-row { gap: 16px; margin-bottom: 18px; }
          .pd-selector-label { font-size: 0.7rem; letter-spacing: 0.14em; min-width: 50px; }
          .pd-type-pill { padding: 7px 14px; font-size: 0.78rem; }
          .pd-color-swatch { width: 28px; height: 28px; }
          .pd-footer { padding-top: 20px; gap: 12px; }
          /* Keep ADD TO CART wider than WISHLIST so its label fits one line. */
          .pd-action-row { grid-template-columns: 1.4fr 1fr; }
          .pd-cta { padding: 15px 12px; font-size: 0.78rem; letter-spacing: 0.05em; gap: 8px; }
          .pd-feature-toggle { font-size: 0.82rem; padding: 10px 14px; }
        }
        @media (max-width: 600px) {
          .pd-main-img { aspect-ratio: 4 / 3; max-height: 48vh; }
          .pd-details { padding: 22px 18px 20px; }
          .pd-title { font-size: 1.6rem; }
          .pd-price-row { margin-bottom: 14px; }
          .pd-regular-price, .pd-sale-price { font-size: 1.3rem; }
          .pd-description { font-size: 0.85rem; margin-bottom: 20px; }
          .pd-selector-row { gap: 12px; margin-bottom: 14px; }
          .pd-selector-label { min-width: 44px; }
          .pd-type-pill { padding: 6px 12px; font-size: 0.74rem; }
          .pd-cta { padding: 14px 10px; font-size: 0.74rem; letter-spacing: 0.04em; }
          .pd-feature-toggle { font-size: 0.76rem; padding: 9px 12px; }
        }
      `}</style>
    </div>
  );
}
