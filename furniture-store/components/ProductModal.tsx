'use client';

import React, { useMemo, useState } from 'react';
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

interface ProductModalProps {
  item: FurnitureItem;
  category?: Category | null;
  onClose: () => void;
}

export default function ProductModal({ item, category, onClose }: ProductModalProps) {
  const { t, isRtl } = useLanguage();
  const { isCustomer } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  const allImages = useMemo(() => {
    const gallery = item.gallery && item.gallery.length > 0 ? item.gallery : [];
    const withMain = item.image && !gallery.includes(item.image) ? [item.image, ...gallery] : gallery;
    const final = withMain.length > 0 ? withMain : [item.image || FALLBACK_IMAGE];
    return final.filter(Boolean);
  }, [item.image, item.gallery]);

  const [activeImg, setActiveImg] = useState(allImages[0]);
  const [selectedType, setSelectedType] = useState<string | null>(item.types && item.types.length > 0 ? item.types[0] : null);
  const [selectedColor, setSelectedColor] = useState<string | null>(item.colors && item.colors.length > 0 ? item.colors[0] : null);
  const [qty, setQty] = useState(1);

  const isCustom = isCustomCategory(category);

  const hasSale = item.salePrice != null && item.salePrice > 0 && item.salePrice !== (item.originalPrice ?? item.price);
  const regularPrice = item.originalPrice ?? item.price;
  const activePrice = hasSale ? item.salePrice! : regularPrice;

  const handleCta = () => {
    if (isCustom) {
      const productLabel = encodeURIComponent(isRtl ? item.nameAr || item.name : item.name);
      router.push(`/contact?productId=${item.id}&product=${productLabel}`);
      onClose();
      return;
    }
    for (let i = 0; i < qty; i++) addToCart(item);
    onClose();
  };

  return (
    <div
      className="modal-overlay-animated"
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 3000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="details-modal-animated product-modal"
        style={{
          backgroundColor: 'var(--bg-panel)', borderRadius: '24px', maxWidth: '1000px', width: '100%',
          display: 'flex', flexDirection: isRtl ? 'row-reverse' : 'row', overflow: 'hidden', position: 'relative',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'rgba(0,0,0,0.55)', color: 'white', border: 'none', borderRadius: '50%',
            width: '36px', height: '36px', fontSize: '1.2rem', cursor: 'pointer', zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >&times;</button>

        <div className="pm-images">
          {allImages.length > 1 && (
            <div className="pm-thumbs">
              {allImages.map((url, i) => (
                <button
                  key={`${url}-${i}`}
                  onClick={() => setActiveImg(url)}
                  className={`pm-thumb ${activeImg === url ? 'is-active' : ''}`}
                  aria-label={`Image ${i + 1}`}
                >
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          )}
          <div className="pm-main-img">
            <img src={activeImg || FALLBACK_IMAGE} alt={isRtl ? item.nameAr : item.name} />
          </div>
        </div>

        <div className="pm-details">
          <h2 className="pm-title">{isRtl ? item.nameAr || item.name : item.name}</h2>
          <div className="pm-title-underline" />

          <div className="pm-price-row">
            {hasSale ? (
              <>
                <span className="pm-regular-price-strike">{regularPrice} {t('currency')}</span>
                <span className="pm-sale-price">{activePrice} {t('currency')}</span>
              </>
            ) : (
              <span className="pm-regular-price">{activePrice} {t('currency')}</span>
            )}
          </div>

          <p className="pm-description">
            <strong>{isRtl ? 'الوصف:' : 'Description:'}</strong>{' '}
            {isRtl ? item.descriptionAr || item.description : item.description}
          </p>
          <div className="pm-desc-underline" />

          {item.types && item.types.length > 0 && (
            <div className="pm-selector-row">
              <span className="pm-selector-label">{isRtl ? 'النوع' : 'TYPE'}</span>
              <div className="pm-type-options">
                {item.types.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`pm-type-pill ${selectedType === type ? 'is-active' : ''}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {item.colors && item.colors.length > 0 && (
            <div className="pm-selector-row">
              <span className="pm-selector-label">{isRtl ? 'اللون' : 'COLOR'}</span>
              <div className="pm-color-options">
                {item.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`pm-color-swatch ${selectedColor === color ? 'is-active' : ''}`}
                    style={{ background: color }}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="pm-footer">
            {!isCustom && isCustomer && (
              <div className="pm-qty">
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
              <button className="pm-cta" onClick={handleCta}>
                {isCustom
                  ? (isRtl ? 'طلب عرض سعر' : 'GET QUOTE')
                  : (isRtl ? 'أضف إلى العربة' : 'ADD TO CART')}
              </button>
            ) : (
              <div className="pm-login-hint">
                {isRtl ? 'للتسوق، يرجى التسجيل' : 'Login to buy'}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .pm-images {
          flex: 1.15;
          display: flex;
          flex-direction: row;
          background: var(--bg-main);
          min-height: 480px;
        }
        .pm-thumbs {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 18px 10px;
          overflow-y: auto;
          max-height: 90vh;
          background: rgba(0,0,0,0.15);
        }
        .pm-thumb {
          width: 58px;
          height: 58px;
          border-radius: 10px;
          overflow: hidden;
          border: 2px solid transparent;
          background: transparent;
          padding: 0;
          cursor: pointer;
          transition: border-color 0.2s ease, transform 0.2s ease;
          flex-shrink: 0;
        }
        .pm-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .pm-thumb.is-active {
          border-color: var(--text-main);
          transform: scale(1.04);
        }
        .pm-main-img {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .pm-main-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pm-details {
          flex: 1;
          padding: 40px 36px;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        .pm-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0 0 6px;
          letter-spacing: -0.01em;
        }
        .pm-title-underline,
        .pm-desc-underline {
          width: 64px;
          height: 2px;
          background: var(--text-main);
          opacity: 0.6;
          margin-bottom: 20px;
        }
        .pm-price-row {
          display: flex;
          align-items: baseline;
          gap: 14px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }
        .pm-regular-price {
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .pm-regular-price-strike {
          font-size: 1.1rem;
          color: var(--text-soft);
          text-decoration: line-through;
          text-decoration-thickness: 2px;
        }
        .pm-sale-price {
          font-size: 1.7rem;
          font-weight: 800;
          color: #ff4d4d;
        }
        .pm-description {
          color: var(--text-soft);
          line-height: 1.7;
          font-size: 0.95rem;
          margin: 0 0 14px;
        }
        .pm-description strong {
          color: var(--text-main);
          font-weight: 600;
        }

        .pm-selector-row {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--line-soft);
        }
        .pm-selector-label {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: var(--text-soft);
          text-transform: uppercase;
          min-width: 58px;
        }
        .pm-type-options,
        .pm-color-options {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .pm-type-pill {
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid var(--line-soft);
          background: var(--bg-main);
          color: var(--text-main);
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }
        .pm-type-pill.is-active {
          background: var(--text-main);
          color: var(--bg-main);
          border-color: var(--text-main);
        }
        .pm-color-swatch {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: 2px solid var(--line-soft);
          padding: 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pm-color-swatch.is-active {
          border-color: var(--text-main);
          transform: scale(1.08);
          box-shadow: 0 0 0 2px var(--bg-panel), 0 0 0 4px var(--text-main);
        }

        .pm-footer {
          margin-top: auto;
          padding-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .pm-qty {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 14px;
          padding: 6px 10px;
          background: var(--bg-main);
          border: 1px solid var(--line-soft);
          border-radius: 10px;
          width: fit-content;
          align-self: flex-end;
        }
        .pm-qty button {
          width: 30px;
          height: 30px;
          border: none;
          background: transparent;
          color: var(--text-main);
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pm-qty button:hover {
          background: rgba(255,255,255,0.08);
        }
        .pm-qty span {
          font-weight: 700;
          min-width: 28px;
          text-align: center;
          color: var(--text-main);
        }
        .pm-cta {
          width: 100%;
          padding: 18px;
          background: var(--text-main);
          color: var(--bg-main);
          border: none;
          border-radius: 14px;
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: transform 0.15s ease, opacity 0.15s ease;
        }
        .pm-cta:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .pm-login-hint {
          text-align: center;
          color: var(--text-soft);
          font-size: 0.9rem;
          padding: 14px;
        }

        @media (max-width: 820px) {
          .product-modal {
            flex-direction: column !important;
            max-height: 95vh;
          }
          .pm-images {
            min-height: 300px;
            max-height: 45vh;
          }
          .pm-thumbs {
            flex-direction: row;
            max-height: none;
            max-width: 100%;
            padding: 8px;
          }
          .pm-thumb {
            width: 52px;
            height: 52px;
          }
          .pm-details {
            padding: 24px 22px;
          }
          .pm-title {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </div>
  );
}
