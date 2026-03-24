import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const USERS_FILENAME = 'users-data.json';

// Fetch users for Admin Dashboard
export async function GET() {
  try {
    const { blobs } = await list({ prefix: USERS_FILENAME });
    if (blobs.length === 0) return NextResponse.json({ users: [] });

    const dataStore = await fetch(blobs[0].url, { cache: 'no-store' });
    const users: any[] = await dataStore.json();
    
    // Strip passwords before sending to front-end admin dashboard
    const safeUsers = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });

    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    console.error('Fetch Users Error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// Modify user roles or delete users
export async function POST(request: Request) {
  try {
    const { action, userId, role } = await request.json();
    
    if (!action || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const { blobs } = await list({ prefix: USERS_FILENAME });
    if (blobs.length === 0) return NextResponse.json({ error: 'No users found' }, { status: 404 });

    const dataStore = await fetch(blobs[0].url, { cache: 'no-store' });
    let users: any[] = await dataStore.json();

    if (action === 'delete') {
      users = users.filter(u => u.id !== userId);
    } else if (action === 'updateRole') {
      users = users.map(u => u.id === userId ? { ...u, role: role || 'customer' } : u);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await put(USERS_FILENAME, JSON.stringify(users), {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Update Users Error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
