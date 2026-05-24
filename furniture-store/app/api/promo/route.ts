import { supabase } from '../../../lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/promo?code=WELCOME10 — validate a promo code.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = (searchParams.get('code') || '').trim();
    if (!code) {
      return NextResponse.json({ valid: false, error: 'No code provided' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('promo_codes')
      .select('code, discount_type, discount_value, active')
      .ilike('code', code)
      .maybeSingle();

    if (error) {
      console.error('Promo lookup error:', error.message);
      return NextResponse.json({ valid: false, error: 'Lookup failed' }, { status: 500 });
    }
    if (!data || !data.active) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired code' }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      code: data.code,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
    });
  } catch (e) {
    console.error('Promo API error:', e);
    return NextResponse.json({ valid: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
