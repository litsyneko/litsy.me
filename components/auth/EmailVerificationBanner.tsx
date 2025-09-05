'use client'

import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Mail, RefreshCw, X, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { isEmailVerified, maskEmail } from '@/lib/utils/auth'

interface EmailVerificationBannerProps {
  className?: string
  dismissible?: boolean
  onDismiss?: () => void
}

export function EmailVerificationBanner({ 
  className = '', 
  dismissible = false,
  onDismiss 
}: EmailVerificationBannerProps) {
  const { user, resendConfirmation } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  // 이메일이 이미 확인되었거나 사용자가 없으면 표시하지 않음
  if (!user || isEmailVerified(user) || isDismissed) {
    return null
  }

  const handleResendEmail = async () => {
    if (!user.email) return

    setIsResending(true)
    try {
      const result = await resendConfirmation(user.email)
      
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('이메일 재발송 중 오류가 발생했습니다.')
    } finally {
      setIsResending(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  return (
    <Alert className={`border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 ${className}`}>
      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      <div className="flex-1">
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium mb-1">이메일 확인이 필요합니다</p>
              <p className="text-sm">
                {maskEmail(user.email || '')}로 발송된 확인 이메일을 확인해주세요.
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={handleResendEmail}
                disabled={isResending}
                className="bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-800"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    발송 중...
                  </>
                ) : (
                  <>
                    <Mail className="w-3 h-3 mr-1" />
                    재발송
                  </>
                )}
              </Button>
              {dismissible && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-amber-600 hover:text-amber-800 hover:bg-amber-200 dark:text-amber-400 dark:hover:text-amber-200 dark:hover:bg-amber-800"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </AlertDescription>
      </div>
    </Alert>
  )
}

export default EmailVerificationBanner