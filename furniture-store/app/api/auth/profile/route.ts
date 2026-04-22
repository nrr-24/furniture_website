import { supabaseAdmin } from '../../../../lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/auth/profile
 *
 * Used by the signup flow's step 2 to attach optional profile + address
 * details to a freshly-created user. Trusts the `userId` in the body
 * (consistent with the rest of the app's session-less pattern). Every
 * field is optional; we update / insert only what's actually provided.
 *
 * Returns the updated user row (without password). Address is inserted
 * as a side-effect; if the user supplied no address fields we skip the
 * addresses insert entirely.
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

    // Confirm the user actually exists before touching anything.
    const { data: existing, error: lookupErr } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    if (lookupErr) {
      console.error('Profile user lookup error:', lookupErr);
      return NextResponse.json({ error: lookupErr.message }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const trim = (v: unknown, max = 200) => {
      if (typeof v !== 'string') return null;
      const t = v.trim();
      return t ? t.slice(0, max) : null;
    };

    const fullName = trim(body.fullName, 120);
    const phoneNumber = trim(body.phoneNumber, 40);

    const userUpdates: Record<string, any> = {};
    if (fullName !== null) userUpdates.full_name = fullName;
    if (phoneNumber !== null) userUpdates.phone_number = phoneNumber;

    let updatedUser: any = null;
    if (Object.keys(userUpdates).length > 0) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update(userUpdates)
        .eq('id', userId)
        .select()
        .single();
      if (error) {
        console.error('Profile user update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      updatedUser = data;
    }

    // Optional address — only insert if at least one address field is set.
    const addr = body.address && typeof body.address === 'object' ? body.address : {};
    const addressRow = {
      user_id: userId,
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
        console.error('Profile address insert error:', addrErr);
        // Don't fail the whole call — the user profile may still have updated.
        return NextResponse.json(
          {
            warning: `Profile saved but address insert failed: ${addrErr.message}`,
            user: updatedUser,
          },
          { status: 207 }
        );
      }
    }

    // If we never updated the user, fetch it so the client gets the canonical row.
    if (!updatedUser) {
      const { data } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      updatedUser = data;
    }

    if (updatedUser && 'password' in updatedUser) delete (updatedUser as any).password;

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error('Profile route error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
