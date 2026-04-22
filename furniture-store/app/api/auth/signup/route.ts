import { supabaseAdmin, supabase } from '../../../../lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/signup
 *
 * Single-shot endpoint that creates the user AND (optionally) attaches profile
 * + address details in one server call. The frontend signup flow defers this
 * call to step 2 (Done/Skip) so the DB row only appears once the user has
 * either filled out details or explicitly opted to skip.
 *
 * Body: { email, password, fullName?, phoneNumber?, address? }
 *   - email + password are required.
 *   - fullName / phoneNumber go into users.full_name / users.phone_number.
 *   - address.{ houseNo, street, area, city, province, zipCode, country? }
 *     gets inserted into addresses with is_default: true. If no field on
 *     `address` is set, no addresses row is inserted.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const trim = (v: unknown, max = 200) => {
      if (typeof v !== 'string') return null;
      const t = v.trim();
      return t ? t.slice(0, max) : null;
    };

    const email = (body.email || '').toLowerCase().trim();
    const password = (body.password || '').trim();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Existence check (idempotent guard against accidental dup submits).
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // First user → admin (existing convention).
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    const role = (count === 0 || count === null) ? 'admin' : 'customer';

    const fullName = trim(body.fullName, 120);
    const phoneNumber = trim(body.phoneNumber, 40);

    const userRow: Record<string, any> = { email, password, role };
    if (fullName !== null) userRow.full_name = fullName;
    if (phoneNumber !== null) userRow.phone_number = phoneNumber;

    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert([userRow])
      .select()
      .single();

    if (error || !newUser) {
      console.error('Signup insert error:', error);
      return NextResponse.json(
        { error: error?.message || 'Failed to create account' },
        { status: 500 }
      );
    }

    // Optional address — only insert if at least one address field is set.
    const addr = body.address && typeof body.address === 'object' ? body.address : {};
    const addressRow = {
      user_id: newUser.id,
      house_no: trim(addr.houseNo, 40),
      street: trim(addr.street, 200),
      area: trim(addr.area, 120),
      city: trim(addr.city, 120),
      province: trim(addr.province, 120),
      zip_code: trim(addr.zipCode, 30),
      country: trim(addr.country, 80) || 'Kuwait',
      is_default: true,
    };
    const hasAnyAddress = ['house_no', 'street', 'area', 'city', 'province', 'zip_code']
      .some(k => (addressRow as any)[k]);
    if (hasAnyAddress) {
      const { error: addrErr } = await supabaseAdmin.from('addresses').insert([addressRow]);
      if (addrErr) {
        console.error('Signup address insert error:', addrErr);
        // Don't roll back the user — surface the warning so the client can
        // tell the user their account was created but the address didn't save.
        const { password: _, ...userSafe } = newUser;
        return NextResponse.json(
          { user: userSafe, warning: `Account created but address save failed: ${addrErr.message}` },
          { status: 207 }
        );
      }
    }

    const { password: _, ...userSafe } = newUser;
    return NextResponse.json({ user: userSafe });
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sign up' },
      { status: 500 }
    );
  }
}
