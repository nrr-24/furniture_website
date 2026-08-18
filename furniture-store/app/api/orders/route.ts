import { supabase } from '../../../lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');

    // Original (pre-migration-safe) projection used for the profile list.
    const listSelect = `
        id,
        total_amount,
        status,
        created_at,
        order_items (
          id,
          quantity,
          price,
          products ( id, name, image_url )
        )`;

    // Richer projection for the confirmation page (needs the migration columns).
    const detailSelect = `
        id,
        total_amount,
        subtotal,
        discount_amount,
        promo_code,
        status,
        created_at,
        order_items (
          id,
          quantity,
          price,
          selected_color,
          selected_type,
          products ( id, name, image_url )
        )`;

    let query = supabase
      .from('orders')
      .select(orderId ? detailSelect : listSelect)
      .order('created_at', { ascending: false });

    if (orderId) {
      query = query.eq('id', orderId);
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else {
      return NextResponse.json({ error: 'User ID or Order ID is required' }, { status: 400 });
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Fetch Orders Error:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    console.error('Orders API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/orders — create an order from the cart.
// Body: { userId, items:[{productId, quantity, price, selectedColor?, selectedType?}],
//         subtotal, discount?, promoCode?, addressId? }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, items, subtotal, discount = 0, promoCode = null, addressId = null } = body || {};

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Recompute totals server-side so the client can't spoof the price.
    const computedSubtotal = items.reduce(
      (sum: number, it: any) => sum + Number(it.price) * Number(it.quantity),
      0
    );
    const safeDiscount = Math.min(Math.max(Number(discount) || 0, 0), computedSubtotal);
    const total = Math.max(0, computedSubtotal - safeDiscount);

    // 1. Create the order. Extra columns (subtotal/discount/promo) are added by
    //    scripts/shop-migration.sql. `address_id` is only included when an
    //    address is actually supplied — the column is optional (it depends on
    //    an `addresses` table that may not exist), so sending null when there's
    //    no address would fail on setups without that column.
    const orderRow: Record<string, unknown> = {
      user_id: userId,
      total_amount: total,
      subtotal: computedSubtotal,
      discount_amount: safeDiscount,
      promo_code: promoCode,
      status: 'pending',
    };
    if (addressId) orderRow.address_id = addressId;

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert(orderRow)
      .select('id')
      .single();

    if (orderErr || !order) {
      console.error('Create order error:', orderErr?.message, orderErr);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // 2. Insert order items.
    const rows = items.map((it: any) => ({
      order_id: order.id,
      product_id: it.productId,
      quantity: Number(it.quantity),
      price: Number(it.price),
      selected_color: it.selectedColor ?? null,
      selected_type: it.selectedType ?? null,
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(rows);
    if (itemsErr) {
      console.error('Create order items error:', itemsErr.message, itemsErr);
      // Roll back the order so we don't leave an empty order behind.
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: 'Failed to save order items' }, { status: 500 });
    }

    return NextResponse.json({ orderId: order.id, total });
  } catch (error) {
    console.error('Create Order API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
