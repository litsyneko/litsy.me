'use client'

import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContext'

/**
 * 인증 컨텍스트를 사용하는 훅
 * AuthProvider 내부에서만 사용 가능
 */
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

/**
 * 사용자 인증 상태만 확인하는 간단한 훅
 */
export function useUser() {
  const { user, profile, loading } = useAuth()
  
  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isEmailVerified: user?.email_confirmed_at !== null
  }
}

/**
 * 세션 정보를 확인하는 훅
 */
export function useSession() {
  const { session, loading } = useAuth()
  
  return {
    session,
    loading,
    isActive: !!session,
    expiresAt: session?.expires_at,
    accessToken: session?.access_token
  }
}