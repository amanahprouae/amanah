import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  console.log(`[MIDDLEWARE] 🚀 Starting: ${request.method} ${request.nextUrl.pathname}`);

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            // ✅ Fixed: Use the existing response object instead of creating new ones
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    // This refreshes the auth session if needed and ensures
    // auth cookies are written to the response.
    await supabase.auth.getUser();
    console.log(`[MIDDLEWARE] ✅ Completed in ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error(`[MIDDLEWARE] ❌ Error:`, error);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on everything except:
     * - static assets
     * - images
     * - favicon
     * - auth/confirm (one-time OTP token route — middleware must not call
     *   getUser() here because it can consume the token_hash before the
     *   route handler gets to call verifyOtp())
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/confirm|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};