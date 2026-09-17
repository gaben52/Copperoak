// Supabase client for Server Components, Server Actions, and Route Handlers.
// Next.js 14's `cookies()` is synchronous (this becomes `await cookies()` if the project is
// ever upgraded to Next 15+, where it was changed to return a Promise).
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component that can't set cookies directly — safe to ignore
            // as long as the middleware below is refreshing the session on every request.
          }
        },
      },
    }
  );
}
