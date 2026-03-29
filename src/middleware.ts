import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const apiToken = process.env.API_TOKEN;

  // No token configured → skip auth entirely (local dev)
  if (!apiToken) {
    return NextResponse.next();
  }

  // Allow same-origin browser requests (UI fetches)
  const secFetchSite = request.headers.get('sec-fetch-site');
  if (secFetchSite === 'same-origin' || secFetchSite === 'same-site') {
    return NextResponse.next();
  }

  // Check Authorization header for external requests (agent, curl, scripts)
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${apiToken}`) {
    return NextResponse.next();
  }

  return NextResponse.json(
    { error: 'Unauthorized', message: 'Valid API token required. Use header: Authorization: Bearer <token>' },
    { status: 401 }
  );
}

export const config = {
  matcher: '/api/:path*',
};
