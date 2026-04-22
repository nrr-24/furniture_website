import { supabaseAdmin } from '../../../lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Public endpoint — anyone can submit a contact message. We trim + validate
// server-side and cap string lengths so a flooder can't dump megabytes.

const MAX_LEN = {
  name: 120,
  email: 200,
  phone: 40,
  clientNumber: 40,
  message: 4000,
  category: 60,
  productName: 200,
};

const ALLOWED_CATEGORIES = new Set([
  'business_letter',
  'consultation',
  'quote',
  'after_sales',
  'general',
  'other',
]);

function str(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

function optionalStr(v: unknown, max: number): string | null {
  if (v == null) return null;
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const category = str(body.category, MAX_LEN.category);
    const fullName = str(body.fullName, MAX_LEN.name);
    const email = str(body.email, MAX_LEN.email);
    const phone = str(body.phone, MAX_LEN.phone);
    const message = str(body.message, MAX_LEN.message);
    const clientNumber = optionalStr(body.clientNumber, MAX_LEN.clientNumber);
    const productId = optionalStr(body.productId, 64);
    const productName = optionalStr(body.productName, MAX_LEN.productName);

    // Required fields
    const missing: string[] = [];
    if (!category) missing.push('category');
    if (!fullName) missing.push('fullName');
    if (!email) missing.push('email');
    if (!phone) missing.push('phone');
    if (!message) missing.push('message');
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    if (!ALLOWED_CATEGORIES.has(category!)) {
      return NextResponse.json({ error: `Invalid category: ${category}` }, { status: 400 });
    }

    if (!EMAIL_RE.test(email!)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('contact_messages').insert([
      {
        category,
        full_name: fullName,
        email,
        phone,
        client_number: clientNumber,
        message,
        product_id: productId,
        product_name: productName,
      },
    ]);

    if (error) {
      console.error('Contact insert error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact route error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
