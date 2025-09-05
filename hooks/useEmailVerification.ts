'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { isEmailVerified, requiresEmailVerification, getEmailVerificationMessage } from '@/lib/utils/auth'

/**
 * 이메일 인증 상태를 관리하는 훅
 */
export function useEmailVerification() {
  const { user, resendConfirmation } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [lastResendAt, setLastResendAt] = useState<Date | null>(null)

  const isVerified = user ? isEmailVerified(user) : false
  const needsVerification = user ? requiresEmailVerification(user) : false
  const verificationMessage = getEmailVerificationMessage(user)

  // 재발송 쿨다운 체크 (60초)
  const canResend = !lastResendAt || (Date.now() - lastResendAt.getTime()) > 60000

  const resendEmail = async () => {
    if (!user?.email || !canResend || isResending) {
      return { success: false, error: '재발송할 수 없습니다.' }
    }

    setIsResending(true)
    try {
      const result = await resendConfirmation(user.email)
      
      if (result.success) {
        setLastResendAt(new Date())
      }
      
      return result
    } catch (error) {
      return {
        success: false,
        error: '이메일 재발송 중 오류가 발생했습니다.'
      }
    } finally {
      setIsResending(false)
    }
  }

  // 쿨다운 시간 계산
  const getCooldownSeconds = () => {
    if (!lastResendAt || canResend) return 0
    return Math.ceil((60000 - (Date.now() - lastResendAt.getTime())) / 1000)
  }

  return {
    user,
    isVerified,
    needsVerification,
    verificationMessage,
    isResending,
    canResend,
    cooldownSeconds: getCooldownSeconds(),
    resendEmail
  }
}

/**
 * 이메일 인증이 필요한 페이지에서 사용하는 가드 훅
 */
export function useEmailVerificationGuard(redirectTo?: string) {
  const { user, isVerified, needsVerification } = useEmailVerification()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    if (needsVerification && redirectTo) {
      setShouldRedirect(true)
    }
  }, [needsVerification, redirectTo])

  return {
    user,
    isVerified,
    needsVerification,
    shouldRedirect,
    canAccess: !needsVerification
  }
}

export default useEmailVerification