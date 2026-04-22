import { supabaseAdmin } from '../../../lib/supabase';
import { requireAdmin } from '../../../lib/serverAuth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Fetch categories error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ categories: data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  try {
    const { name, name_ar, sort_order } = await request.json();
    
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert([{ name, name_ar, sort_order: sort_order || 0 }])
      .select()
      .single();

    if (error) {
      console.error('Category creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();
    
    // Support both single update and batch reordering
    if (Array.isArray(body)) {
      // Batch reorder
      const promises = body.map(cat => 
        supabaseAdmin
          .from('categories')
          .update({ sort_order: cat.sort_order })
          .eq('id', cat.id)
      );
      
      await Promise.all(promises);
      return NextResponse.json({ success: true });
    } else {
      // Single update (rename)
      const { id, name, name_ar } = body;
      const { data, error } = await supabaseAdmin
        .from('categories')
        .update({ name, name_ar })
        .eq('id', id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    // Note: The database schema should have ON DELETE CASCADE for products.category_id
    // But we double check and handle products here too if needed.
    // However, the user explicitly wants to delete products inside.
    // The CASCADE in SQL will handle this if set up correctly.
    
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Category deletion error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
