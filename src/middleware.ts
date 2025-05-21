import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = new URL(req.url);
  const path = url.pathname;

  const publicRoutes = ['/', '/sign-in', '/sign-up'];
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  if (isPublicRoute || path.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', path);
    return NextResponse.redirect(signInUrl);
  }

  if (userId && publicRoutes.includes(path)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
