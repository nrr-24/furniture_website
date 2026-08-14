import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { createHesabeCheckout, hesabeConfigured } from '../../../../lib/hesabe';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payment/hesabe  { orderId }
 *
 * Looks up the (pending) order, starts a Hesabe checkout for its server-side
 * total, and returns the URL to redirect the customer to. The amount is taken
 * from the DB — never from the client — so it can't be tampered with.
 */
export async function POST(request: Request) {
  if (!hesabeConfigured()) {
    return NextResponse.json({ error: 'Payment gateway is not configured.' }, { status: 503 });
  }

  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, total_amount, status')
      .eq('id', orderId)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (order.status === 'paid') {
      return NextResponse.json({ error: 'Order is already paid' }, { status: 409 });
    }
    if (!order.total_amount || Number(order.total_amount) <= 0) {
      return NextResponse.json({ error: 'Order total is invalid' }, { status: 400 });
    }

    // Absolute base for the callback. Prefer an explicit env, else the request
    // origin (correct on Vercel behind its proxy).
    const origin = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/+$/, '');
    const callback = `${origin}/api/payment/hesabe/callback`;

    const url = await createHesabeCheckout({
      amount: Number(order.total_amount),
      orderReferenceNumber: order.id,
      responseUrl: callback,
      failureUrl: callback,
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error('Hesabe start error:', err);
    return NextResponse.json({ error: 'Failed to start payment' }, { status: 500 });
  }
}
