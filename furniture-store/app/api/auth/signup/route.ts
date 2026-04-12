import { supabase } from '../../../../lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Check if this is the first user (make them admin)
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const role = (count === 0 || count === null) ? 'admin' : 'customer';

    // Insert new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        email: cleanEmail,
        password: cleanPassword,
        role,
      }])
      .select()
      .single();

    if (error || !newUser) {
      console.error('Signup insert error:', error);
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    // Strip password from response
    const { password: _, ...userSafe } = newUser;
    return NextResponse.json({ user: userSafe });

  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ error: 'Failed to sign up' }, { status: 500 });
  }
}
