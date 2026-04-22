import { NextResponse } from 'next/server';
import { supabaseAdmin } from './supabase';

/**
 * Server-side admin guard for API routes.
 *
 * Reads `x-user-id` from the request, looks up the user in the DB, and
 * confirms `role === 'admin'`. Rejects the request with the appropriate
 * status on any failure. On success returns `{ ok: true, userId }` and the
 * route can proceed.
 *
 * Usage:
 *   const guard = await requireAdmin(request);
 *   if (!guard.ok) return guard.response;
 *
 * This uses the service-role supabaseAdmin client internally so it can read
 * the users table regardless of RLS. It does NOT validate a session token —
 * that's a known gap (see authClient.ts). But it beats an unauthenticated
 * write endpoint: an attacker needs to discover an admin's uuid to spoof.
 */
export async function requireAdmin(
  request: Request
): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }
> {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Unauthorized — missing x-user-id header' },
        { status: 401 }
      ),
    };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('requireAdmin DB lookup error:', error);
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Auth check failed', detail: error.message },
          { status: 500 }
        ),
      };
    }

    if (!data) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Unauthorized — unknown user' },
          { status: 401 }
        ),
      };
    }

    if (data.role !== 'admin') {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Forbidden — admin role required' },
          { status: 403 }
        ),
      };
    }

    return { ok: true, userId };
  } catch (err) {
    console.error('requireAdmin unexpected error:', err);
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Auth check failed', detail: err instanceof Error ? err.message : String(err) },
        { status: 500 }
      ),
    };
  }
}
