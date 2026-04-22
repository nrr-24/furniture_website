import { supabaseAdmin } from '../../../../lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/auth/delete
 *
 * Body: { userId }
 *
 * Self-service account deletion. The schema's foreign keys don't have
 * ON DELETE CASCADE, so we have to clean up dependent rows in order
 * before removing the user:
 *   1. order_items / shipping (depend on orders)
 *   2. payments / cart_items (depend on user)
 *   3. orders (depend on user)
 *   4. addresses (depend on user; shipping must be gone first)
 *   5. user
 *
 * If any step errors we surface it to the client and abort — partial deletes
 * leave the account in a broken state.
 *
 * NOTE on auth: this route accepts userId from the body, matching the rest of
 * the app's session-less pattern. A user could theoretically pass another
 * user's id; the long-term fix is server-side sessions (Supabase Auth + cookies).
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const userId = body?.userId;
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Confirm the user exists first so we don't return success for a no-op.
    const { data: user, error: lookupErr } = await supabaseAdmin
      .from('users').select('id, role').eq('id', userId).maybeSingle();
    if (lookupErr) {
      return NextResponse.json({ error: lookupErr.message }, { status: 500 });
    }
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Don't allow the only admin to delete themselves — would leave the site
    // unmanageable. (If you want this, change role to customer first.)
    if (user.role === 'admin') {
      const { count } = await supabaseAdmin
        .from('users').select('id', { count: 'exact', head: true }).eq('role', 'admin');
      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the only admin account' },
          { status: 400 }
        );
      }
    }

    // 1. Collect order IDs so we can clean their dependents first.
    const { data: orders } = await supabaseAdmin
      .from('orders').select('id').eq('user_id', userId);
    const orderIds = (orders || []).map((o: any) => o.id).filter(Boolean);

    if (orderIds.length > 0) {
      const oi = await supabaseAdmin.from('order_items').delete().in('order_id', orderIds);
      if (oi.error) return NextResponse.json({ error: `order_items delete: ${oi.error.message}` }, { status: 500 });

      const sh = await supabaseAdmin.from('shipping').delete().in('order_id', orderIds);
      if (sh.error) return NextResponse.json({ error: `shipping delete: ${sh.error.message}` }, { status: 500 });
    }

    // 2. Payments + cart items — rows that reference the user directly.
    const pay = await supabaseAdmin.from('payments').delete().eq('user_id', userId);
    if (pay.error) return NextResponse.json({ error: `payments delete: ${pay.error.message}` }, { status: 500 });

    const cart = await supabaseAdmin.from('cart_items').delete().eq('user_id', userId);
    if (cart.error) return NextResponse.json({ error: `cart_items delete: ${cart.error.message}` }, { status: 500 });

    // 3. Orders themselves (now that order_items + shipping for them are gone).
    if (orderIds.length > 0) {
      const ord = await supabaseAdmin.from('orders').delete().in('id', orderIds);
      if (ord.error) return NextResponse.json({ error: `orders delete: ${ord.error.message}` }, { status: 500 });
    }

    // 4. Addresses — safe now that no shipping row references them.
    const addr = await supabaseAdmin.from('addresses').delete().eq('user_id', userId);
    if (addr.error) return NextResponse.json({ error: `addresses delete: ${addr.error.message}` }, { status: 500 });

    // 5. The user row itself.
    const usr = await supabaseAdmin.from('users').delete().eq('id', userId);
    if (usr.error) return NextResponse.json({ error: `users delete: ${usr.error.message}` }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Delete account error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
