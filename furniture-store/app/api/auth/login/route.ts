import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const USERS_FILENAME = 'users-data.json';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const { blobs } = await list({ prefix: USERS_FILENAME });
    
    if (blobs.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const dataStore = await fetch(blobs[0].url, { cache: 'no-store' });
    const users: any[] = await dataStore.json();

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const { password: _, ...userSafe } = user;
    return NextResponse.json({ user: userSafe });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Failed to log in' }, { status: 500 });
  }
}
