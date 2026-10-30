import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextResponse } from 'next/server';

// Next.js 16: proxy.js uses "proxy" or default export instead of "middleware"
export async function proxy(request) {
  const { isAuthenticated } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    return NextResponse.redirect(
      new URL('/api/auth/login?post_login_redirect_url=/dashboard', request.url)
    );
  }
}

export const config = {
  matcher: '/dashboard/:path*',
};
