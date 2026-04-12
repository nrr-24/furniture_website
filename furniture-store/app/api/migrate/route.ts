import { list } from '@vercel/blob';
import { supabaseAdmin } from '../../../lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DATA_FILENAME = 'furniture-data.json';
const USERS_FILENAME = 'users-data.json';

/**
 * One-time migration endpoint: GET /api/migrate
 * Reads existing data from Vercel Blob and inserts into Supabase tables.
 * Safe to call multiple times — uses upsert logic.
 */
export async function GET() {
  const results = { products: 0, users: 0, errors: [] as string[] };

  try {
    // ── Migrate Products ──
    const { blobs: productBlobs } = await list({ prefix: DATA_FILENAME });
    if (productBlobs.length > 0) {
      const dataStore = await fetch(`${productBlobs[0].url}?t=${Date.now()}`, { cache: 'no-store' });
      const items: any[] = await dataStore.json();

      if (items && items.length > 0) {
        const rows = items.map((item: any) => ({
          name: item.name || null,
          name_ar: item.nameAr || null,
          description: item.description || null,
          description_ar: item.descriptionAr || null,
          price: item.price || 0,
          image_url: item.image || null,
          category: item.category || null,
        }));

        const { data, error } = await supabaseAdmin.from('products').insert(rows).select();
        if (error) {
          results.errors.push(`Products insert error: ${error.message}`);
        } else {
          results.products = data?.length || 0;
        }
      }
    }

    // ── Migrate Users ──
    const { blobs: userBlobs } = await list({ prefix: USERS_FILENAME });
    if (userBlobs.length > 0) {
      const dataStore = await fetch(`${userBlobs[0].url}?t=${Date.now()}`, { cache: 'no-store' });
      const users: any[] = await dataStore.json();

      if (users && users.length > 0) {
        const rows = users.map((user: any) => ({
          email: user.email,
          password: user.password,
          role: user.role || 'customer',
        }));

        const { data, error } = await supabaseAdmin.from('users').insert(rows).select();
        if (error) {
          results.errors.push(`Users insert error: ${error.message}`);
        } else {
          results.users = data?.length || 0;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migrated ${results.products} products and ${results.users} users to Supabase.`,
      errors: results.errors,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message, results },
      { status: 500 }
    );
  }
}
