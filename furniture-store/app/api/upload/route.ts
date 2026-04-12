import { supabaseAdmin } from '../../../lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  if (!request.body) {
    return NextResponse.json({ error: 'Image body is required' }, { status: 400 });
  }

  try {
    // Read the request body as an ArrayBuffer
    const arrayBuffer = await request.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Generate a unique filename to avoid collisions
    const uniqueName = `${Date.now()}-${filename}`;

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
