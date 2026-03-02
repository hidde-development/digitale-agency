import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? 'localhost';
  const subdomain = hostname.split('.')[0];

  const slug =
    subdomain === 'localhost' || subdomain === 'www'
      ? 'default'
      : subdomain;

  const response = NextResponse.next();
  response.headers.set('x-tenant-slug', slug);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logos/).*)'],
};
