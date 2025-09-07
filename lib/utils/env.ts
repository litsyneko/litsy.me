/**
 * 환경 변수 검증 유틸리티
 */

interface RequiredEnvVars {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  NEXT_PUBLIC_SITE_URL: string
}

interface OptionalEnvVars {
  SUPABASE_JWT_SECRET?: string
  POSTGRES_URL?: string
}

/**
 * 필수 환경 변수 검증
 */
export function validateRequiredEnvVars(): RequiredEnvVars {
  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL
  }

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    )
  }

  return requiredVars as RequiredEnvVars
}

/**
 * Supabase URL 유효성 검사
 */
export function isValidSupabaseUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.hostname.includes('supabase.co') || parsedUrl.hostname.includes('localhost')
  } catch {
    return false
  }
}

/**
 * 개발 환경 확인
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * 프로덕션 환경 확인
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * 환경 변수 로깅 (개발 환경에서만)
 */
export function logEnvStatus(): void {
  if (!isDevelopment()) return
  // Keep only a minimal development indicator to avoid printing secrets.
  console.log('🔧 Environment Variables: development mode (variables not displayed)')
}

/**
 * 클라이언트 사이드 환경 변수 검증
 */
export function validateClientEnvVars(): void {
  const clientVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL
  }

  const missingVars = Object.entries(clientVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    console.error('❌ Missing client environment variables:', missingVars)
    throw new Error(`Missing client environment variables: ${missingVars.join(', ')}`)
  }

  // Supabase URL 유효성 검사
  if (!isValidSupabaseUrl(clientVars.NEXT_PUBLIC_SUPABASE_URL!)) {
    throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL format')
  }
}