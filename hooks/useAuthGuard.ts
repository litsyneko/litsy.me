'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './useAuth'

/**
 * 인증이 필요한 페이지를 보호하는 훅
 */
export function useAuthGuard(options: {
  redirectTo?: string
  requireEmailVerification?: boolean
} = {}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { redirectTo = '/auth/login', requireEmailVerification = false } = options

  useEffect(() => {
    if (loading) return

    // 인증되지 않은 사용자
    if (!user) {
      router.push(redirectTo)
      return
    }

    // 이메일 인증이 필요한 경우
    if (requireEmailVerification && !user.email_confirmed_at) {
      router.push('/auth/verify-email')
      return
    }
  }, [user, loading, router, redirectTo, requireEmailVerification])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isEmailVerified: user?.email_confirmed_at !== null
  }
}

/**
 * 이미 로그인한 사용자를 다른 페이지로 리디렉션하는 훅
 */
export function useGuestGuard(redirectTo: string = '/') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  return {
    user,
    loading,
    isGuest: !user
  }
}

/**
 * 특정 권한이 필요한 페이지를 보호하는 훅
 */
export function usePermissionGuard(permission: string, redirectTo: string = '/') {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/auth/login')
      return
    }

    // 기본 권한 확인 (추후 확장 가능)
    const hasPermission = checkUserPermission(user, profile, permission)
    
    if (!hasPermission) {
      router.push(redirectTo)
    }
  }, [user, profile, loading, router, permission, redirectTo])

  return {
    user,
    profile,
    loading,
    hasPermission: checkUserPermission(user, profile, permission)
  }
}

/**
 * 사용자 권한 확인 함수
 */
function checkUserPermission(user: any, profile: any, permission: string): boolean {
  if (!user) return false

  // 기본 권한
  const basicPermissions = ['read', 'comment', 'profile']
  if (basicPermissions.includes(permission)) {
    return true
  }

  // 관리자 권한 (추후 확장)
  if (permission === 'admin') {
    return profile?.email === 'admin@example.com' // 임시 구현
  }

  return false
}