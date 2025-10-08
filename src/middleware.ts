import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  const publicPaths = ['/', '/auth/callback']; // Paths that don't require authentication

  // If user is not logged in and trying to access a protected route (not a public path)
  if (!session && !publicPaths.includes(req.nextUrl.pathname)) {
    // Redirect to the root page, which now handles login
    const redirectUrl = new URL('/', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in and trying to access the root path, let src/app/page.tsx handle the redirect to a board.
  // Otherwise, allow access.
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /api (API routes, if you have any unprotected ones)
     * - Any other explicitly public route not handled by the root page's conditional rendering
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
