import { AuthError } from '@supabase/supabase-js'
import { AuthErrorType, AUTH_ERROR_MESSAGES } from '../types/auth'

/**
 * Supabase 인증 오류를 사용자 친화적 메시지로 변환
 */
export function getAuthErrorMessage(error: AuthError | Error | string): string {
  if (typeof error === 'string') {
    return error
  }

  const message = error.message.toLowerCase()

  // Supabase 오류 메시지 매핑
  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return AUTH_ERROR_MESSAGES[AuthErrorType.INVALID_CREDENTIALS]
  }
  
  if (message.includes('email not confirmed') || message.includes('email_not_confirmed')) {
    return AUTH_ERROR_MESSAGES[AuthErrorType.EMAIL_NOT_CONFIRMED]
  }
  
  if (message.includes('user not found')) {
    return AUTH_ERROR_MESSAGES[AuthErrorType.USER_NOT_FOUND]
  }
  
  if (message.includes('user already registered') || message.includes('email already exists')) {
    return AUTH_ERROR_MESSAGES[AuthErrorType.EMAIL_ALREADY_EXISTS]
  }
  
  if (message.includes('password') && (message.includes('weak') || message.includes('short'))) {
    return AUTH_ERROR_MESSAGES[AuthErrorType.WEAK_PASSWORD]
  }
  
  if (message.includes('oauth') || message.includes('discord')) {
    return AUTH_ERROR_MESSAGES[AuthErrorType.OAUTH_ERROR]
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return AUTH_ERROR_MESSAGES[AuthErrorType.NETWORK_ERROR]
  }

  // 기본 오류 메시지
  return AUTH_ERROR_MESSAGES[AuthErrorType.UNKNOWN_ERROR]
}

/**
 * 이메일 유효성 검사
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 비밀번호 강도 검사
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6
}

/**
 * 사용자명 유효성 검사
 */
export function isValidUsername(username: string): boolean {
  // 3-20자, 영문자, 숫자, 언더스코어, 하이픈만 허용
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/
  return usernameRegex.test(username)
}

/**
 * 표시 이름 유효성 검사
 */
export function isValidDisplayName(displayName: string): boolean {
  // 1-50자, 공백 허용
  return displayName.trim().length >= 1 && displayName.trim().length <= 50
}

/**
 * 사용자 아바타 URL 생성 (Gravatar 또는 기본 아바타)
 */
export function generateAvatarUrl(email: string, username?: string): string {
  if (username) {
    // 사용자명 기반 기본 아바타
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&size=128`
  }
  
  // 이메일 기반 Gravatar
  const hash = btoa(email.toLowerCase().trim()).replace(/[^a-zA-Z0-9]/g, '')
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=128`
}

/**
 * 사용자 표시 이름 생성 (우선순위: display_name > username > email)
 */
export function getUserDisplayName(user: {
  display_name?: string | null
  username?: string | null
  email?: string | null
}): string {
  if (user.display_name) return user.display_name
  if (user.username) return user.username
  if (user.email) return user.email.split('@')[0]
  return 'Anonymous'
}

/**
 * 리디렉션 URL 생성
 */
export function getRedirectUrl(path?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${baseUrl}${path || '/'}`
}

/**
 * OAuth 리디렉션 URL 생성
 */
export function getOAuthRedirectUrl(): string {
  return getRedirectUrl('/auth/callback')
}

/**
 * 이메일 확인 리디렉션 URL 생성
 */
export function getEmailConfirmRedirectUrl(): string {
  return getRedirectUrl('/auth/confirm')
}

/**
 * 비밀번호 재설정 리디렉션 URL 생성
 */
export function getPasswordResetRedirectUrl(): string {
  return getRedirectUrl('/auth/reset-password')
}

/**
 * 로그인 후 리디렉션 경로 결정
 */
export function getPostLoginRedirectPath(returnTo?: string): string {
  // 허용된 경로만 리디렉션
  const allowedPaths = ['/', '/blog', '/about', '/contact', '/profile']
  
  if (returnTo && allowedPaths.some(path => returnTo.startsWith(path))) {
    return returnTo
  }
  
  return '/'
}

/**
 * 세션 만료 확인
 */
export function isSessionExpired(expiresAt?: number): boolean {
  if (!expiresAt) return true
  return Date.now() / 1000 > expiresAt
}

/**
 * 사용자 권한 확인
 */
export function hasPermission(user: any, permission: string): boolean {
  // 기본적으로 인증된 사용자는 기본 권한을 가짐
  const basicPermissions = ['read', 'comment', 'profile']
  
  if (basicPermissions.includes(permission)) {
    return !!user
  }
  
  // 관리자 권한 확인 (추후 확장 가능)
  if (permission === 'admin') {
    return user?.email === 'admin@example.com' // 임시 구현
  }
  
  return false
}

/**
 * 이메일 확인 상태 체크
 */
export function isEmailVerified(user: any): boolean {
  return !!(user?.email_confirmed_at || user?.email_verified)
}

/**
 * 이메일 확인 필요 여부 체크
 */
export function requiresEmailVerification(user: any): boolean {
  return !!user && !isEmailVerified(user)
}

/**
 * 이메일 확인 링크 만료 시간 계산 (24시간)
 */
export function getEmailConfirmationExpiry(): Date {
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + 24)
  return expiry
}

/**
 * 이메일 재발송 쿨다운 체크 (1분)
 */
export function canResendEmail(lastSentAt?: Date): boolean {
  if (!lastSentAt) return true
  
  const now = new Date()
  const timeDiff = now.getTime() - lastSentAt.getTime()
  const oneMinute = 60 * 1000
  
  return timeDiff >= oneMinute
}

/**
 * 이메일 확인 상태에 따른 메시지 생성
 */
export function getEmailVerificationMessage(user: any): string {
  if (!user) {
    return '로그인이 필요합니다.'
  }
  
  if (isEmailVerified(user)) {
    return '이메일이 확인되었습니다.'
  }
  
  return `${user.email}로 발송된 확인 이메일을 확인해주세요.`
}

/**
 * 이메일 도메인 추출
 */
export function getEmailDomain(email: string): string {
  return email.split('@')[1] || ''
}

/**
 * 이메일 마스킹 (개인정보 보호)
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return email
  
  const maskedLocal = localPart.length > 2 
    ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1]
    : localPart[0] + '*'
    
  return `${maskedLocal}@${domain}`
}