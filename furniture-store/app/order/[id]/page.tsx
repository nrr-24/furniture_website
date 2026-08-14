'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../data/LanguageContext';
import { useCart } from '../../../data/CartContext';
import { FALLBACK_IMAGE } from '../../../data/furnitureData';
import Footer from '../../../components/layout/Footer';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  selected_color?: string | null;
  selected_type?: string | null;
  products?: { id: string; name: string; image_url: string } | null;
}
interface Order {
  id: string;
  total_amount: number;
  subtotal?: number;
  discount_amount?: number;
  promo_code?: string | null;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, isRtl } = useLanguage();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/orders?orderId=${id}`)
      .then((r) => r.json())
      .then((j) => { if (active) { setOrder(j.orders?.[0] ?? null); setLoading(false); } })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  // Once we confirm the order is paid, empty the cart (kept until now so a
  // failed payment wouldn't lose it).
  const isPaid = order?.status === 'paid';
  const isFailed = order?.status === 'failed';
  useEffect(() => {
    if (isPaid) clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaid]);

  const retryPayment = async () => {
    setRetrying(true);
    try {
      const res = await fetch('/api/payment/hesabe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id }),
      });
      const j = await res.json();
      if (res.ok && j.url) { window.location.href = j.url; return; }
    } catch { /* fall through */ }
    setRetrying(false);
  };

  const cur = t('currency');
  const shortId = id.slice(0, 8).toUpperCase();

  return (
    <main className="app-content oc-page" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="oc-wrap">
        {loading ? (
          <p className="oc-loading">{isRtl ? 'جارٍ التحميل...' : 'Loading...'}</p>
        ) : !order ? (
          <div className="oc-card oc-empty">
            <i className="bi bi-exclamation-circle"></i>
            <h1>{isRtl ? 'لم يتم العثور على الطلب' : 'Order not found'}</h1>
            <Link href="/shop" className="oc-btn">{isRtl ? 'تسوق الآن' : 'Continue Shopping'}</Link>
          </div>
        ) : (
          <div className="oc-card">
            {isFailed ? (
              <>
                <div className="oc-check" aria-hidden="true" style={{ background: '#fdecec', color: '#b91c1c' }}>
                  <i className="bi bi-x-lg"></i>
                </div>
                <span className="section-kicker" style={{ color: '#b91c1c' }}>{isRtl ? 'فشل الدفع' : 'PAYMENT FAILED'}</span>
                <h1 className="oc-title">{isRtl ? 'لم تكتمل عملية الدفع' : "Your payment didn't go through"}</h1>
                <p className="oc-sub">
                  {isRtl
                    ? `لم يتم الدفع للطلب رقم #${shortId}. يمكنك المحاولة مرة أخرى.`
                    : `Order #${shortId} wasn't paid. You can try again.`}
                </p>
                <button onClick={retryPayment} disabled={retrying} className="oc-btn" style={{ border: 'none', cursor: 'pointer' }}>
                  {retrying ? (isRtl ? 'جارٍ التحويل...' : 'Redirecting…') : (isRtl ? 'إعادة المحاولة' : 'Try payment again')}
                </button>
              </>
            ) : (
              <>
                <div className="oc-check" aria-hidden="true"><i className="bi bi-check-lg"></i></div>
                <span className="section-kicker">{isRtl ? 'تم تأكيد الطلب' : 'ORDER CONFIRMED'}</span>
                <h1 className="oc-title">{isRtl ? 'شكراً لطلبك!' : 'Thank you for your order!'}</h1>
                <p className="oc-sub">
                  {isPaid
                    ? (isRtl
                        ? `تم الدفع بنجاح لطلبك رقم #${shortId}. سنتواصل معك قريباً لتأكيد التفاصيل.`
                        : `Payment received for order #${shortId}. We'll be in touch shortly to confirm the details.`)
                    : (isRtl
                        ? `تم استلام طلبك رقم #${shortId}. سنتواصل معك قريباً لتأكيد التفاصيل.`
                        : `Your order #${shortId} has been received. We'll be in touch shortly to confirm the details.`)}
                </p>
              </>
            )}

            <div className="oc-items">
              {order.order_items?.map((it) => (
                <div key={it.id} className="oc-item">
                  <img src={it.products?.image_url || FALLBACK_IMAGE} alt={it.products?.name || ''} />
                  <div className="oc-item-info">
                    <span className="oc-item-name">{it.products?.name}</span>
                    {(it.selected_color || it.selected_type) && (
                      <span className="oc-item-variant">
                        {[it.selected_type, it.selected_color].filter(Boolean).join(' · ')}
                      </span>
                    )}
                    <span className="oc-item-qty">×{it.quantity}</span>
                  </div>
                  <span className="oc-item-price">{(it.price * it.quantity).toLocaleString()} {cur}</span>
                </div>
              ))}
            </div>

            <div className="oc-totals">
              {order.subtotal != null && (
                <div className="oc-row"><span>{isRtl ? 'المجموع الفرعي' : 'Subtotal'}</span><span>{Number(order.subtotal).toLocaleString()} {cur}</span></div>
              )}
              {order.discount_amount != null && Number(order.discount_amount) > 0 && (
                <div className="oc-row oc-row-discount">
                  <span>{isRtl ? 'الخصم' : 'Discount'}{order.promo_code ? ` (${order.promo_code})` : ''}</span>
                  <span>−{Number(order.discount_amount).toLocaleString()} {cur}</span>
                </div>
              )}
              <div className="oc-row oc-row-total"><span>{isRtl ? 'الإجمالي' : 'Total'}</span><span>{Number(order.total_amount).toLocaleString()} {cur}</span></div>
            </div>

            <div className="oc-actions">
              <Link href="/shop" className="oc-btn">{isRtl ? 'مواصلة التسوق' : 'Continue Shopping'}</Link>
              <Link href="/profile" className="oc-btn oc-btn-ghost">{isRtl ? 'طلباتي' : 'My Orders'}</Link>
            </div>
          </div>
        )}
      </div>
      <Footer />

      <style jsx>{`
        .oc-page { background: var(--bg-main); color: var(--text-main); }
        .oc-wrap { flex: 1; display: flex; align-items: center; justify-content: center; padding: clamp(32px, 6vw, 80px) 20px; }
        .oc-loading { color: var(--text-soft); }
        .oc-card {
          width: 100%; max-width: 560px; background: var(--bg-panel);
          border: 1px solid var(--line-soft); border-radius: var(--r-card);
          padding: clamp(28px, 5vw, 48px); text-align: center;
          box-shadow: var(--shadow-card);
        }
        .oc-check {
          width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 20px;
          background: var(--text-main); color: var(--bg-main);
          display: flex; align-items: center; justify-content: center; font-size: 2rem;
        }
        .oc-title { font-family: var(--font-serif); font-weight: 500; font-size: clamp(1.6rem, 3.5vw, 2.2rem); margin: 8px 0 12px; }
        .oc-sub { color: var(--text-soft); font-size: 0.95rem; line-height: 1.6; margin: 0 0 28px; }
        .oc-items { display: flex; flex-direction: column; gap: 12px; text-align: left; margin-bottom: 24px; }
        :global([dir="rtl"]) .oc-items { text-align: right; }
        .oc-item { display: flex; align-items: center; gap: 14px; padding: 12px; background: var(--bg-main); border: 1px solid var(--line-soft); border-radius: 16px; }
        .oc-item img { width: 56px; height: 56px; border-radius: 10px; object-fit: cover; }
        .oc-item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .oc-item-name { font-weight: 600; font-size: 0.92rem; }
        .oc-item-variant { font-size: 0.76rem; color: var(--text-soft); }
        .oc-item-qty { font-size: 0.78rem; color: var(--text-soft); }
        .oc-item-price { font-weight: 700; font-size: 0.92rem; white-space: nowrap; }
        .oc-totals { border-top: 1px solid var(--line-soft); padding-top: 18px; margin-bottom: 26px; }
        .oc-row { display: flex; justify-content: space-between; font-size: 0.92rem; color: var(--text-soft); margin-bottom: 8px; }
        .oc-row-discount { color: #a8553a; }
        .oc-row-total { color: var(--text-main); font-weight: 700; font-size: 1.15rem; font-family: var(--font-serif); border-top: 1px solid var(--line-soft); padding-top: 12px; margin-top: 4px; }
        .oc-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .oc-btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 14px 26px; border-radius: var(--r-pill); text-decoration: none;
          background: var(--text-main); color: var(--bg-main);
          font-size: 0.82rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
          transition: var(--transition-smooth);
        }
        .oc-btn:hover { background: var(--accent-deep); }
        .oc-btn-ghost { background: transparent; color: var(--text-main); border: 1px solid var(--text-main); }
        .oc-btn-ghost:hover { background: var(--surface-soft); color: var(--text-main); }
        .oc-empty i { font-size: 2.5rem; color: var(--text-soft); display: block; margin-bottom: 12px; }
        .oc-empty h1 { font-family: var(--font-serif); font-weight: 500; margin-bottom: 20px; }
      `}</style>
    </main>
  );
}
