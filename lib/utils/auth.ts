import { AuthError } from '@supabase/supabase-js'

export function getAuthErrorMessage(error: AuthError | Error | any): string {
  if (!error) return '알 수 없는 오류가 발생했습니다.'

  const message = error.message || error.error_description || error.toString()

  // Supabase Auth 에러 메시지 변환
  switch (message) {
    case 'Invalid login credentials':
    case 'Invalid credentials':
      return '이메일 또는 비밀번호가 올바르지 않습니다.'
    
    case 'Email not confirmed':
      return '이메일 인증을 완료해주세요.'
    
    case 'User not found':
      return '해당 이메일로 등록된 계정이 없습니다.'
    
    case 'User already registered':
    case 'Email address already registered':
      return '이미 존재하는 이메일입니다.'
    
    case 'Password should be at least 6 characters':
      return '비밀번호는 최소 6자 이상이어야 합니다.'
    
    case 'Email rate limit exceeded':
      return '너무 많은 요청을 보내셨습니다. 잠시 후 다시 시도해주세요.'
    
    case 'Invalid email':
      return '유효하지 않은 이메일 주소입니다.'
    
    case 'Signup disabled':
      return '현재 회원가입이 비활성화되어 있습니다.'
    
    case 'Email link is invalid or has expired':
      return '이메일 링크가 유효하지 않거나 만료되었습니다.'
    
    case 'Token has expired or is invalid':
      return '토큰이 만료되었거나 유효하지 않습니다.'
    
    case 'Network request failed':
      return '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.'
    
    case 'Failed to fetch':
      return '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
    
    default:
      // Discord OAuth 관련 에러
      if (message.includes('discord') || message.includes('oauth')) {
        return 'Discord 로그인 중 오류가 발생했습니다. 다시 시도해주세요.'
      }
      
      // 일반적인 에러 메시지 정리
      if (message.length > 100) {
        return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      }
      
      return message
  }
}

export function isAuthError(error: any): error is AuthError {
  return error && typeof error === 'object' && 'message' in error
}

export function getErrorType(error: AuthError | Error | any): string {
  if (!error) return 'unknown'
  
  const message = error.message || error.error_description || error.toString()
  
  if (message.includes('credentials') || message.includes('login')) {
    return 'invalid_credentials'
  }
  
  if (message.includes('not confirmed') || message.includes('email')) {
    return 'email_not_confirmed'
  }
  
  if (message.includes('not found')) {
    return 'user_not_found'
  }
  
  if (message.includes('already registered') || message.includes('already exists')) {
    return 'email_exists'
  }
  
  if (message.includes('password') && message.includes('6 characters')) {
    return 'weak_password'
  }
  
  if (message.includes('rate limit')) {
    return 'rate_limit'
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'network_error'
  }
  
  return 'unknown'
}

// 추가 유틸리티 함수들
export function isEmailVerified(user: any): boolean {
  return !!(user?.email_confirmed_at)
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email
  
  const [localPart, domain] = email.split('@')
  if (localPart.length <= 2) return email
  
  const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1)
  return `${maskedLocal}@${domain}`
}

export function requiresEmailVerification(user: any): boolean {
  return !isEmailVerified(user)
}

export function getEmailVerificationMessage(user: any): string {
  if (!user) return '로그인이 필요합니다.'
  if (isEmailVerified(user)) return '이메일이 인증되었습니다.'
  return '이메일 인증을 완료해주세요.'
}

export function getOAuthRedirectUrl(provider: string, returnTo?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const callbackUrl = new URL('/auth/callback', baseUrl)
  
  if (returnTo) {
    callbackUrl.searchParams.set('return_to', returnTo)
  }
  
  return callbackUrl.toString()
}