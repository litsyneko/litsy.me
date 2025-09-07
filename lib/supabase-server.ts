import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const createServerClient = (cookieStore: any) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return (cookieStore as any).get?.(name)?.value ?? undefined
        },
        set(name: string, value: string, options: any) {
          if (typeof (cookieStore as any).set === 'function') {
            ;(cookieStore as any).set({ name, value, ...options })
          } else if (typeof (cookieStore as any).setCookie === 'function') {
            ;(cookieStore as any).setCookie(name, value, options)
          } else if (typeof (cookieStore as any).put === 'function') {
            ;(cookieStore as any).put(name, value, options)
          }
        },
        remove(name: string, options: any) {
          if (typeof (cookieStore as any).delete === 'function') {
            ;(cookieStore as any).delete(name, options)
          } else if (typeof (cookieStore as any).remove === 'function') {
            ;(cookieStore as any).remove(name, options)
          } else if (typeof (cookieStore as any).set === 'function') {
            // Fallback: overwrite the cookie with empty value and past expiry
            ;(cookieStore as any).set({ name, value: '', expires: new Date(0), ...options })
          }
        },
      },
    } as any
  )
}

export const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)