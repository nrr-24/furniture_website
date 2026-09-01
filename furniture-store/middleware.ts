import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Landing-page-only mode.
 *
 * Every public page is redirected to "/" so visitors only ever see the home
 * landing page. Static assets and Next internals are excluded by the matcher
 * below; API routes plus the owner's admin + login pages stay reachable so the
 * site keeps working and can still be managed.
 *
 * To restore the full site later, delete this file (and re-add the nav items
 * in components/layout/Navbar.tsx).
 */
const ALLOWED_PREFIXES = ['/api', '/admin', '/login'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === '/') return NextResponse.next();
  if (ALLOWED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = '/';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  // Run on everything except Next internals and static asset files.
  matcher: [
    '/((?!_next/|images/|fonts/|favicon.ico|icon.svg|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico|css|js|woff2?|ttf|map)).*)',
  ],
};
