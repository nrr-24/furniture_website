/**
 * Client-side auth helpers.
 *
 * The app stores the logged-in user in localStorage under `smartwood_user`
 * (see AuthContext). These helpers pull the user id out for forwarding to
 * server-side API routes via an `x-user-id` header — the server then
 * verifies the role against the DB before allowing mutations.
 *
 * NOTE: this is a defense-in-depth layer, not a proper session — a user
 * id header is spoofable by any client that knows a real admin's id. The
 * long-term fix is to move to Supabase Auth + HTTP-only session cookies.
 */

export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('smartwood_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id ?? null;
  } catch {
    return null;
  }
}

/** Headers to attach to admin-only API calls. */
export function authHeaders(): Record<string, string> {
  const id = getCurrentUserId();
  return id ? { 'x-user-id': id } : {};
}
