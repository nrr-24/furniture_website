import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';


const DATA_FILENAME = 'furniture-data.json';

export async function GET(request: Request) {
    try {
        const { blobs } = await list({ prefix: DATA_FILENAME });

        if (blobs.length > 0) {
            // Fetch the contents from the Blob URL with cache bypass
            const dataStore = await fetch(`${blobs[0].url}?t=${Date.now()}`, { cache: 'no-store' });
            const jsonData = await dataStore.json();
            return NextResponse.json({ items: jsonData });
        }

        // Return null or empty if file doesn't exist yet
        return NextResponse.json({ items: null });
    } catch (error) {
        console.error('Error fetching data from Vercel Blob:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.text();

        // Using addRandomSuffix: false acts as a traditional file overwrite database
        const blob = await put(DATA_FILENAME, body, {
            access: 'public',
            addRandomSuffix: false,
        });

        return NextResponse.json({ success: true, url: blob.url });
    } catch (error) {
        console.error('Error saving data to Vercel Blob:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
