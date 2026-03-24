import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const USERS_FILENAME = 'users-data.json';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // 1. Fetch existing users
    const { blobs } = await list({ prefix: USERS_FILENAME });
    let users: any[] = [];
    
    if (blobs.length > 0) {
      const dataStore = await fetch(blobs[0].url, { cache: 'no-store' });
      users = await dataStore.json();
    }

    // 2. Check if email exists
    if (users.find(u => u.email === email)) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // 3. Create new user
    const newUser = {
      id: Math.random().toString(36).substring(2, 9),
      email,
      password, // Storing raw string mock due to serverless constraints without bcrypt
      role: users.length === 0 ? 'admin' : 'customer' // First user is always admin
    };

    users.push(newUser);

    // 4. Save to DB
    await put(USERS_FILENAME, JSON.stringify(users), {
      access: 'public',
      addRandomSuffix: false,
    });

    // Strip password from response
    const { password: _, ...userSafe } = newUser;
    return NextResponse.json({ user: userSafe });

  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ error: 'Failed to sign up' }, { status: 500 });
  }
}
