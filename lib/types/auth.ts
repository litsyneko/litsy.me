import type { Session } from '@supabase/supabase-js'
import type { AuthUser, UserProfile } from '../supabase'

export interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, metadata: { username: string; display_name: string }) => Promise<AuthResponse>
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signInWithOAuth: (provider: 'discord', redirectTo?: string) => Promise<AuthResponse>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResponse>
  resendConfirmation: (email: string) => Promise<AuthResponse>
  
  // 유틸리티 함수들
  getUserDisplayName: () => string
  getUserAvatar: () => string | null
  isEmailVerified: () => boolean
  refreshSession: () => Promise<void>
  refreshUser: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export interface AuthResponse {
  success: boolean
  error?: string
  message?: string
}

export interface SignUpData {
  email: string
  password: string
  confirmPassword: string
  username: string
  displayName: string
}

export interface SignInData {
  email: string
  password: string
}

export interface ResetPasswordData {
  email: string
}

export interface UpdatePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// 오류 타입 정의
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_NOT_CONFIRMED = 'email_not_confirmed',
  USER_NOT_FOUND = 'user_not_found',
  EMAIL_ALREADY_EXISTS = 'email_already_exists',
  WEAK_PASSWORD = 'weak_password',
  OAUTH_ERROR = 'oauth_error',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error'
}

export const AUTH_ERROR_MESSAGES: Record<AuthErrorType, string> = {
  [AuthErrorType.INVALID_CREDENTIALS]: '이메일 또는 비밀번호가 올바르지 않습니다.',
  [AuthErrorType.EMAIL_NOT_CONFIRMED]: '이메일 인증을 완료해주세요.',
  [AuthErrorType.USER_NOT_FOUND]: '해당 이메일로 등록된 계정이 없습니다.',
  [AuthErrorType.EMAIL_ALREADY_EXISTS]: '이미 존재하는 이메일입니다.',
  [AuthErrorType.WEAK_PASSWORD]: '비밀번호는 최소 6자 이상이어야 합니다.',
  [AuthErrorType.OAUTH_ERROR]: 'Discord 로그인 중 오류가 발생했습니다.',
  [AuthErrorType.NETWORK_ERROR]: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
  [AuthErrorType.UNKNOWN_ERROR]: '알 수 없는 오류가 발생했습니다.'
}

// 폼 유효성 검사 스키마 (Zod 사용)
export interface ValidationSchema {
  email: string
  password: string
  confirmPassword?: string
  username?: string
  displayName?: string
}

// 라우트 보호 관련 타입
export interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

// OAuth 프로바이더 타입
export type OAuthProvider = 'discord'

export interface OAuthConfig {
  provider: OAuthProvider
  options?: {
    redirectTo?: string
    scopes?: string
  }
}