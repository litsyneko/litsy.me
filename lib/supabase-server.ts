import { createClient } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

import type { Database } from './supabase'
import { validateRequiredEnvVars } from './utils/env'

// 환경 변수 검증
const envVars = validateRequiredEnvVars()

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

// 서버 전용 Supabase 클라이언트: 서비스 키 사용 (DB 쓰기/관리 작업에 사용)
// 이 클라이언트는 민감한 작업에 사용되므로, 클라이언트 측에 노출되지 않도록 주의
export const supabaseServiceRole = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  global: { headers: { 'X-Client-Info': 'supabase-js-server-service-role' } }
})

// 서버 컴포넌트 및 API 라우트에서 사용될 Supabase 클라이언트 (세션 관리 포함)
export function createSupabaseServerClient() {
  const cookieStore = cookies() as any

  return createServerClient<Database>(
    supabaseUrl,
    envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // 서비스 키 대신 anon key 사용
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `cookies().set()` method can only be called from a Server Component
            // or Server Action. If this error is thrown, it's probably because you're
            // calling this from a Client Component or manually trying to call `supabase.auth.signOut()`.
            // For more information: https://nextjs.org/docs/app/api-reference/functions/cookies#cookiesetname-value-options
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `cookies().set()` method can only be called from a Server Component
            // or Server Action. If this error is thrown, it's probably because you're
            // calling this from a Client Component or manually trying to call `supabase.auth.signOut()`.
            // For more information: https://nextjs.org/docs/app/api-reference/functions/cookies#cookiesetname-value-options
          }
        },
      },
    }
  )
}

// 기존 supabaseServer를 서비스 역할 클라이언트로 대체
export const supabaseServer = supabaseServiceRole;

export default supabaseServiceRole;
