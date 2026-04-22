import { supabaseAdmin } from '../../../../lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/check-email?email=foo@bar.com
 *
 * Returns { exists: boolean } so the signup flow can validate availability
 * during step 1 (credentials) WITHOUT creating the user. The actual user row
 * is created later, on step 2's Done/Skip submit.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get('email') || '').toLowerCase().trim();

  if (!email) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('check-email error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ exists: !!data });
  } catch (err) {
    console.error('check-email unexpected:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
