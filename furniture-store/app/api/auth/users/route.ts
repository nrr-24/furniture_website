import { supabase } from '../../../../lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Fetch users for Admin Dashboard
export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, full_name, phone_number, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fetch Users Error:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error('Fetch Users Error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// Modify user roles, info, or delete users
export async function POST(request: Request) {
  try {
    const { action, userId, role, full_name, phone_number } = await request.json();

    if (!action || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (action === 'delete') {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
      }
    } else if (action === 'updateRole') {
      const { error } = await supabase
        .from('users')
        .update({ role: role || 'customer' })
        .eq('id', userId);

      if (error) {
        console.error('Update role error:', error);
        return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
      }
    } else if (action === 'updateInfo') {
      const { error } = await supabase
        .from('users')
        .update({ 
          full_name: full_name,
          phone_number: phone_number 
        })
        .eq('id', userId);

      if (error) {
        console.error('Update info error:', error);
        return NextResponse.json({ error: 'Failed to update info' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Update Users Error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
