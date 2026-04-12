import { supabase } from '../../../lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch Addresses Error:', error);
      return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
    }

    return NextResponse.json({ addresses: addresses || [] });
  } catch (error) {
    console.error('Addresses API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, addressData, action, addressId } = await request.json();

    if (action === 'delete') {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // Set other addresses to non-default if this one is default
    if (addressData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    if (addressId) {
      // Update
      const { data, error } = await supabase
        .from('addresses')
        .update(addressData)
        .eq('id', addressId)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json({ success: true, address: data });
    } else {
      // Create
      const { data, error } = await supabase
        .from('addresses')
        .insert([{ ...addressData, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, address: data });
    }

  } catch (error) {
    console.error('Save Address Error:', error);
    return NextResponse.json({ error: 'Failed to save address' }, { status: 500 });
  }
}
