import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabase';
import { parseHesabeCallback } from '../../../../../lib/hesabe';

export const dynamic = 'force-dynamic';

/**
 * Hesabe redirects the customer back here after payment (to responseUrl and
 * failureUrl) with an encrypted `data` param. We decrypt it, verify the result
 * AND that the paid amount matches the order, update the order, then redirect
 * the browser to the confirmation page.
 *
 * Hesabe may use GET (query) or POST (form) depending on account config, so we
 * handle both.
 */
async function handle(request: Request): Promise<NextResponse> {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/+$/, '');

  let data: string | null = null;
  try {
    const url = new URL(request.url);
    data = url.searchParams.get('data');
    if (!data && request.method === 'POST') {
      const form = await request.formData().catch(() => null);
      data = (form?.get('data') as string) || null;
    }
  } catch { /* ignore */ }

  if (!data) {
    return NextResponse.redirect(`${origin}/?payment=error`, { status: 303 });
  }

  let result;
  try {
    result = parseHesabeCallback(data);
  } catch (err) {
    console.error('Hesabe callback decrypt error:', err);
    return NextResponse.redirect(`${origin}/?payment=error`, { status: 303 });
  }

  const orderId = result.orderReferenceNumber;
  if (!orderId) {
    return NextResponse.redirect(`${origin}/?payment=error`, { status: 303 });
  }

  // Re-fetch the order and confirm the amount actually matches what we charged.
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, total_amount, status')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) {
    return NextResponse.redirect(`${origin}/?payment=error`, { status: 303 });
  }

  const amountMatches =
    result.amount != null &&
    Math.abs(Number(result.amount) - Number(order.total_amount)) < 0.01;

  const success = result.ok && amountMatches;

  // Idempotent: if already paid, just show the confirmation.
  if (order.status !== 'paid') {
    await supabaseAdmin
      .from('orders')
      .update({ status: success ? 'paid' : 'failed' })
      .eq('id', orderId);

    // Best-effort: store payment metadata if those columns exist. Wrapped so a
    // missing column never breaks the status update above.
    if (success) {
      try {
        await supabaseAdmin
          .from('orders')
          .update({ payment_id: result.paymentId, payment_method: result.method })
          .eq('id', orderId);
      } catch { /* columns optional */ }
    }
  }

  const suffix = success ? 'success' : 'failed';
  return NextResponse.redirect(`${origin}/order/${orderId}?payment=${suffix}`, { status: 303 });
}

export async function GET(request: Request) { return handle(request); }
export async function POST(request: Request) { return handle(request); }
