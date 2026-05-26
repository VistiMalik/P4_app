import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, type JWTPayload  } from "jose";

// JWT secret key - should match the one in the login API
const JWT_SECRET = process.env.JWT_SECRET || 'dms-dashboard-secret-key';
const secret = new TextEncoder().encode(JWT_SECRET);
type TokenPayload = JWTPayload & {
  ip?: string;
};

// Fixed verification of jwt
async function verifyToken(token: string, request: NextRequest): Promise<boolean> {
  try {
    const result = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    const payload = result.payload as TokenPayload;
    if (payload.ip != request.headers.get('x-forwarded-for')?.split(',')[0]) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  // Paths that don't require authentication
  const publicPaths = ['/login', '/api/auth/login'];
  
  // Check if the requested path is a public path
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith('/api/auth/')
  );
  
  // Check if it's an API route (except auth-related routes)
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/') && 
                     !request.nextUrl.pathname.startsWith('/api/auth/');
  
  // Get auth cookie
  const authToken = request.cookies.get('auth_token')?.value;
  
  // If it's a public path, allow access
  if (isPublicPath) {
    // If user is already logged in and trying to access login page, redirect to dashboard
    if (authToken && await verifyToken(authToken, request) && request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    return NextResponse.next();
  }
  
  // For protected routes, check if user is authenticated
  if (!authToken || !(await verifyToken(authToken, request))) {
    // For API routes, return 401 Unauthorized
    if (isApiRoute) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // For other routes, redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If user is authenticated and trying to access a protected route, allow access
  return NextResponse.next();
}

// Configure the middleware to apply to all routes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}; 