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
