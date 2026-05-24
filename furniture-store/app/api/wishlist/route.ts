import { supabase } from '../../../lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/wishlist?userId=... — list the user's wishlisted product IDs.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const { data, error } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Wishlist fetch error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
    }
    return NextResponse.json({ productIds: (data || []).map((r: any) => r.product_id) });
  } catch (e) {
    console.error('Wishlist GET error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/wishlist  body: { userId, productId } — add (idempotent).
export async function POST(request: Request) {
  try {
    const { userId, productId } = await request.json();
    if (!userId || !productId) return NextResponse.json({ error: 'userId and productId required' }, { status: 400 });

    const { error } = await supabase
      .from('wishlists')
      .upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id,product_id' });

    if (error) {
      console.error('Wishlist add error:', error.message);
      return NextResponse.json({ error: 'Failed to add' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Wishlist POST error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/wishlist?userId=...&productId=... — remove.
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');
    if (!userId || !productId) return NextResponse.json({ error: 'userId and productId required' }, { status: 400 });

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Wishlist remove error:', error.message);
      return NextResponse.json({ error: 'Failed to remove' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Wishlist DELETE error:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
