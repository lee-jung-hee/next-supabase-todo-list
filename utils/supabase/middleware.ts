// utils/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs before routes that need Supabase or are protected by Supabase Auth.
 * Keeps browser/server cookies in sync to prevent random logouts.
 */
export async function updateSession(request: NextRequest) {
  // Always start from a response bound to the incoming request
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // NOTE: use publishable key in latest SDK, not "anon"
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        // Pass through all cookies from the request
        getAll() {
          return request.cookies.getAll();
        },
        // Keep request/response cookies in sync when SDK refreshes auth cookies
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // Recreate a response bound to the same request
          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT:
  // Do not add custom logic before getClaims(); it can cause hard-to-debug logouts.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Optional: protect routes (redirect if not logged in)
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // IMPORTANT:
  // Always return the same response object (or, if you must create a new one,
  // you must copy cookies from supabaseResponse to the new response).
  return supabaseResponse;
}
