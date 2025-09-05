import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase'
import { validateRequiredEnvVars } from './utils/env'

// 환경 변수 검증
const envVars = validateRequiredEnvVars()

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

// 서버 전용 Supabase 클라이언트: 서비스 키 사용 (DB 쓰기/관리 작업에 사용)
export const supabaseServer = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  global: { headers: { 'X-Client-Info': 'supabase-js-server' } }
})

export default supabaseServer
