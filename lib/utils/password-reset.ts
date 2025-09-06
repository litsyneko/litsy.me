import { supabase } from '@/lib/supabase'

export interface PasswordResetRequest {
  canRequest: boolean
  reason: string
  waitTimeMinutes: number
}

export interface PasswordResetStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  lastRequestAt: string | null
  lastSuccessAt: string | null
}

// 비밀번호 재설정 요청 가능 여부 확인
export async function canRequestPasswordReset(
  email: string,
  ipAddress?: string
): Promise<PasswordResetRequest> {
  try {
    const { data, error } = await (supabase as any)
      .rpc('can_request_password_reset', {
        p_email: email,
        p_ip_address: ipAddress || null
      })
      .single()

    if (error) {
      console.error('Error checking password reset eligibility:', error)
      return {
        canRequest: false,
        reason: '요청 확인 중 오류가 발생했습니다.',
        waitTimeMinutes: 15
      }
    }

    return {
      canRequest: (data as any).can_request,
      reason: (data as any).reason,
      waitTimeMinutes: (data as any).wait_time_minutes || 0
    }
  } catch (error) {
    console.error('Error checking password reset eligibility:', error)
    return {
      canRequest: false,
      reason: '요청 확인 중 오류가 발생했습니다.',
      waitTimeMinutes: 15
    }
  }
}

// 비밀번호 재설정 요청 로깅
export async function logPasswordResetRequest(
  email: string,
  success: boolean = true,
  errorMessage?: string
): Promise<string | null> {
  try {
    // 클라이언트에서 IP 주소와 User Agent 수집
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : null

    const { data, error } = await supabase
      .rpc('log_password_reset_request', {
        p_email: email,
        p_ip_address: null, // 클라이언트에서는 IP 주소를 직접 얻을 수 없음
        p_user_agent: userAgent,
        p_success: success,
        p_error_message: errorMessage || null
      })

    if (error) {
      console.error('Error logging password reset request:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error logging password reset request:', error)
    return null
  }
}

// 비밀번호 재설정 통계 조회
export async function getPasswordResetStats(
  userId?: string,
  days: number = 30
): Promise<PasswordResetStats | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_password_reset_stats', {
        p_user_id: userId || null,
        p_days: days
      })
      .single()

    if (error) {
      console.error('Error getting password reset stats:', error)
      return null
    }

    return {
      totalRequests: data.total_requests,
      successfulRequests: data.successful_requests,
      failedRequests: data.failed_requests,
      lastRequestAt: data.last_request_at,
      lastSuccessAt: data.last_success_at
    }
  } catch (error) {
    console.error('Error getting password reset stats:', error)
    return null
  }
}

// 비밀번호 강도 검사
export function checkPasswordStrength(password: string): {
  score: number
  feedback: string[]
  isStrong: boolean
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('최소 8자 이상이어야 합니다')
  }

  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('소문자를 포함해야 합니다')
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('대문자를 포함해야 합니다')
  }

  if (/[0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('숫자를 포함해야 합니다')
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('특수문자를 포함해야 합니다')
  }

  // 일반적인 패턴 검사
  if (password.length > 0) {
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('같은 문자를 3번 이상 연속으로 사용하지 마세요')
      score = Math.max(0, score - 1)
    }

    if (/123|abc|qwe|asd|zxc/i.test(password)) {
      feedback.push('연속된 문자나 키보드 패턴을 피해주세요')
      score = Math.max(0, score - 1)
    }

    if (/password|123456|qwerty|admin/i.test(password)) {
      feedback.push('일반적인 비밀번호는 사용하지 마세요')
      score = Math.max(0, score - 2)
    }
  }

  return {
    score,
    feedback,
    isStrong: score >= 4 && feedback.length === 0
  }
}

// 비밀번호 재설정 이메일 발송 (개선된 버전)
export async function sendPasswordResetEmail(email: string): Promise<{
  success: boolean
  message: string
  canRetryAt?: Date
}> {
  try {
    // 먼저 요청 가능 여부 확인
    const eligibility = await canRequestPasswordReset(email)
    
    if (!eligibility.canRequest) {
      const retryAt = eligibility.waitTimeMinutes > 0 
        ? new Date(Date.now() + eligibility.waitTimeMinutes * 60 * 1000)
        : undefined

      return {
        success: false,
        message: eligibility.reason,
        canRetryAt: retryAt
      }
    }

    // 비밀번호 재설정 이메일 발송
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) {
      // 실패 로깅
      await logPasswordResetRequest(email, false, error.message)
      
      return {
        success: false,
        message: getPasswordResetErrorMessage(error.message)
      }
    }

    // 성공 로깅
    await logPasswordResetRequest(email, true)

    return {
      success: true,
      message: '비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요.'
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    
    // 실패 로깅
    await logPasswordResetRequest(email, false, errorMessage)
    
    return {
      success: false,
      message: '비밀번호 재설정 요청 중 오류가 발생했습니다.'
    }
  }
}

// 비밀번호 재설정 에러 메시지 변환
function getPasswordResetErrorMessage(errorMessage: string): string {
  switch (errorMessage) {
    case 'User not found':
      return '등록되지 않은 이메일 주소입니다.'
    case 'Email rate limit exceeded':
      return '너무 많은 요청을 보내셨습니다. 잠시 후 다시 시도해주세요.'
    case 'Invalid email':
      return '유효하지 않은 이메일 주소입니다.'
    case 'Email not confirmed':
      return '이메일 인증이 완료되지 않은 계정입니다.'
    default:
      return '비밀번호 재설정 요청 중 오류가 발생했습니다.'
  }
}

// 비밀번호 재설정 링크 유효성 검사
export function validatePasswordResetToken(): {
  isValid: boolean
  tokenType: string | null
  error?: string
} {
  try {
    // URL 해시에서 토큰 확인
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const type = hashParams.get('type')
    
    // URL 쿼리에서도 확인
    const urlParams = new URLSearchParams(window.location.search)
    const tokenHash = urlParams.get('token_hash')
    const resetType = urlParams.get('type')
    
    if (type === 'recovery' || resetType === 'recovery') {
      if (accessToken || tokenHash) {
        return {
          isValid: true,
          tokenType: 'recovery'
        }
      }
    }
    
    return {
      isValid: false,
      tokenType: null,
      error: '유효한 비밀번호 재설정 토큰을 찾을 수 없습니다.'
    }
  } catch (error) {
    return {
      isValid: false,
      tokenType: null,
      error: '토큰 검증 중 오류가 발생했습니다.'
    }
  }
}