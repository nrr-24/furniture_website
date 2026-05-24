'use client';

import Link from 'next/link';
import { useLanguage } from '../../data/LanguageContext';
import { useWishlist } from '../../data/WishlistContext';
import { useFurniture } from '../../data/FurnitureContext';
import { useCart } from '../../data/CartContext';
import { FALLBACK_IMAGE } from '../../data/furnitureData';
import Footer from '../../components/layout/Footer';

export default function WishlistPage() {
  const { t, isRtl } = useLanguage();
  const { wishlist, toggleWishlist } = useWishlist();
  const { items, initialized } = useFurniture();
  const { addToCart } = useCart();

  if (!initialized) return null;

  const products = items.filter((it) => wishlist.includes(it.id));
  const cur = t('currency');

  return (
    <main className="app-content wl-page" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="wl-wrap">
        <header className="wl-head">
          <span className="section-kicker">{isRtl ? 'المحفوظة' : 'SAVED'}</span>
          <h1 className="wl-title">{isRtl ? 'قائمة المفضلة' : 'My Wishlist'}</h1>
          <p className="wl-count">
            {products.length} {isRtl ? 'عنصر' : products.length === 1 ? 'item' : 'items'}
          </p>
        </header>

        {products.length === 0 ? (
          <div className="wl-empty">
            <i className="bi bi-heart"></i>
            <p>{isRtl ? 'قائمة المفضلة فارغة.' : 'Your wishlist is empty.'}</p>
            <Link href="/shop" className="wl-shop-btn">{isRtl ? 'تصفح المجموعة' : 'Browse the Collection'}</Link>
          </div>
        ) : (
          <div className="wl-grid">
            {products.map((p) => (
              <div key={p.id} className="wl-card">
                <Link href={`/shop/product/${p.id}`} className="wl-card-img">
                  <img src={p.image || FALLBACK_IMAGE} alt={isRtl ? p.nameAr || p.name : p.name} />
                </Link>
                <button
                  className="wl-remove"
                  onClick={() => toggleWishlist(p.id)}
                  aria-label={isRtl ? 'إزالة' : 'Remove from wishlist'}
                >
                  <i className="bi bi-heart-fill"></i>
                </button>
                <div className="wl-card-body">
                  <Link href={`/shop/product/${p.id}`} className="wl-name">{isRtl ? p.nameAr || p.name : p.name}</Link>
                  <p className="wl-price">{(p.salePrice ?? p.price).toLocaleString()} <span>{cur}</span></p>
                  <button
                    className="wl-add"
                    onClick={() => addToCart({
                      productId: p.id,
                      name: isRtl ? p.nameAr || p.name : p.name,
                      price: p.salePrice ?? p.price,
                      image: p.image,
                      selectedColor: p.colors?.[0] ?? null,
                      selectedType: p.types?.[0] ?? null,
                    })}
                  >
                    {isRtl ? 'أضف إلى العربة' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />

      <style jsx>{`
        .wl-page { background: var(--bg-main); color: var(--text-main); }
        .wl-wrap { flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: clamp(32px, 5vw, 64px) clamp(20px, 5vw, 60px); }
        .wl-head { text-align: center; margin-bottom: 40px; }
        .wl-title { font-family: var(--font-serif); font-weight: 500; font-size: clamp(2rem, 4vw, 3rem); margin: 4px 0 8px; }
        .wl-count { color: var(--text-soft); font-size: 0.9rem; }
        .wl-empty { text-align: center; padding: 80px 20px; color: var(--text-soft); }
        .wl-empty i { font-size: 3rem; display: block; margin-bottom: 16px; opacity: 0.4; }
        .wl-empty p { font-size: 1.05rem; margin-bottom: 24px; }
        .wl-shop-btn {
          display: inline-flex; padding: 14px 28px; border-radius: var(--r-pill);
          background: var(--text-main); color: var(--bg-main); text-decoration: none;
          font-size: 0.82rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
        }
        .wl-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; }
        .wl-card { position: relative; background: var(--bg-panel); border: 1px solid var(--line-soft); border-radius: var(--r-card); overflow: hidden; transition: var(--transition-smooth); }
        .wl-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-card); }
        .wl-card-img { display: block; aspect-ratio: 4 / 3; overflow: hidden; background: var(--surface-soft); }
        .wl-card-img img { width: 100%; height: 100%; object-fit: cover; }
        .wl-remove {
          position: absolute; top: 12px; inset-inline-end: 12px;
          width: 36px; height: 36px; border-radius: 50%; border: none;
          background: var(--bg-main); color: #a8553a; cursor: pointer;
          display: flex; align-items: center; justify-content: center; font-size: 1rem;
          box-shadow: 0 2px 10px rgba(42,32,24,0.15);
        }
        .wl-card-body { padding: 16px 18px 20px; }
        .wl-name { display: block; color: var(--text-main); text-decoration: none; font-size: 0.92rem; font-weight: 500; margin-bottom: 6px; }
        .wl-price { font-size: 1.05rem; font-weight: 700; margin: 0 0 14px; }
        .wl-price span { font-size: 0.76rem; font-weight: 600; opacity: 0.75; }
        .wl-add {
          width: 100%; padding: 12px; border-radius: var(--r-pill); border: 1px solid var(--text-main);
          background: transparent; color: var(--text-main); cursor: pointer;
          font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
          transition: var(--transition-smooth);
        }
        .wl-add:hover { background: var(--text-main); color: var(--bg-main); }
        @media (max-width: 991px) { .wl-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 520px) { .wl-grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}
