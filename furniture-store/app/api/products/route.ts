import { supabaseAdmin } from '../../../lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Handle mutations for furniture products (Add, Update, Delete)
// Using supabaseAdmin (service role) to bypass RLS for administrative actions.

export async function POST(request: Request) {
  try {
    const item = await request.json();
    
    // Ensure we use category_id and sort_order
    const dbRow = {
      ...item,
      sort_order: item.sort_order || 0
    };

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([dbRow])
      .select()
      .single();

    if (error) {
      console.error('Product creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    
    // Support batch reorder
    if (Array.isArray(body)) {
      const promises = body.map(item => 
        supabaseAdmin
          .from('products')
          .update({ sort_order: item.sort_order, category_id: item.category_id })
          .eq('id', item.id)
      );
      await Promise.all(promises);
      return NextResponse.json({ success: true });
    }

    const { id, updates } = body;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Product update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ids = searchParams.get('ids')?.split(',');
    
    if (!id && !ids) return NextResponse.json({ error: 'ID or IDs required' }, { status: 400 });

    const query = supabaseAdmin.from('products').delete();
    
    if (ids) {
      query.in('id', ids);
    } else {
      query.eq('id', id);
    }

    const { error } = await query;

    if (error) {
      console.error('Product deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
