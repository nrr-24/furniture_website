import { supabaseAdmin } from '../../../lib/supabase';
import { requireAdmin } from '../../../lib/serverAuth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  // Admin-only route
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  try {
    const arrayBuffer = await request.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'File body is empty' }, { status: 400 });
    }

    // Unique filename: timestamp + 8-char random + sanitized original name.
    const rand = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)).slice(0, 8);
    const safeName = filename.replace(/\s+/g, '_');
    const uniqueName = `${Date.now()}-${rand}-${safeName}`;

    console.log(`Uploading ${filename} as ${uniqueName} (${buffer.length} bytes)...`);

    const { data, error } = await supabaseAdmin.storage
      .from('product-images')
      .upload(uniqueName, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: getContentType(filename),
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      // Surface the actual error so the client can show a useful message
      // ("new row violates row-level security policy", "mime type not allowed",
      //  "The resource already exists", etc.).
      return NextResponse.json(
        {
          error: error.message || 'Failed to upload image',
          detail: (error as any).statusCode || (error as any).status || null,
          name: (error as any).name || null,
        },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error('Error uploading to Supabase Storage:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to upload image',
      },
      { status: 500 }
    );
  }
}

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const types: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    avif: 'image/avif',
    heic: 'image/heic',
    heif: 'image/heif',
    svg: 'image/svg+xml',
  };
  return types[ext || ''] || 'application/octet-stream';
}

const STORAGE_BUCKET = 'product-images';
const STORAGE_PUBLIC_PREFIX = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

/**
 * Pull the storage path (filename inside the bucket) out of a Supabase
 * public URL. Returns null for any URL that's NOT one of our uploads —
 * external image URLs, hand-typed paths, etc. — so we never accidentally
 * try to delete something we don't own.
 */
function extractStoragePath(rawUrl: string): string | null {
  try {
    const u = new URL(rawUrl);
    const idx = u.pathname.indexOf(STORAGE_PUBLIC_PREFIX);
    if (idx === -1) return null;
    const path = decodeURIComponent(u.pathname.slice(idx + STORAGE_PUBLIC_PREFIX.length));
    return path || null;
  } catch {
    return null;
  }
}

/**
 * DELETE /api/upload?url=<full public URL>
 *
 * Removes the file from the product-images bucket. Used when an admin
 * deletes an image from a product so we don't accumulate orphaned storage.
 *
 * - URL must be a Supabase public URL pointing into our bucket; external
 *   URLs return 200 with `skipped: true` (nothing to delete on our side).
 * - File-not-found is treated as success (idempotent — already gone).
 */
export async function DELETE(request: Request): Promise<NextResponse> {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');
  if (!rawUrl) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  const path = extractStoragePath(rawUrl);
  if (!path) {
    // Not one of our uploads — say so but don't 4xx; the caller can move on.
    return NextResponse.json({ skipped: true, reason: 'not a Supabase storage URL' });
  }

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) {
      // "Object not found" → already gone, treat as success (idempotent).
      const msg = error.message || '';
      if (/not.found/i.test(msg)) {
        return NextResponse.json({ ok: true, alreadyGone: true });
      }
      console.error('Storage delete error:', error);
      return NextResponse.json(
        { error: msg || 'Failed to delete image', detail: (error as any).statusCode || null },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, removed: data?.length ?? 0 });
  } catch (err) {
    console.error('Storage delete unexpected:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete image' },
      { status: 500 }
    );
  }
}
