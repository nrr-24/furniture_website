import { supabaseAdmin } from '../../../lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Diagnostic check for the admin client
    if (!supabaseAdmin || supabaseAdmin.auth === undefined) {
      console.error('Supabase Admin client failed to initialize');
      return NextResponse.json({ error: 'Storage client initialization failed' }, { status: 500 });
    }

    try {
      // Read the request body as an ArrayBuffer
    const arrayBuffer = await request.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'File body is empty' }, { status: 400 });
    }

    // Generate a unique filename to avoid collisions (e.g., multiple parallel
    // uploads of the same filename arriving in the same millisecond).
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
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error('Error uploading to Supabase Storage:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
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
    svg: 'image/svg+xml',
  };
  return types[ext || ''] || 'application/octet-stream';
}
