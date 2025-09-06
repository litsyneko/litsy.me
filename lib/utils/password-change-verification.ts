import { supabase } from '@/lib/supabase'

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

export interface PasswordChangeRequest {
  success: boolean
  message: string
  tokenHash?: string
}

export interface PasswordChangeStatus {
  hasPendingRequest: boolean
  requestedAt: string | null
  expiresAt: string | null
}

export interface PasswordChangeConfirmation {
  success: boolean
  message: string
}

// 비밀번호 변경 요청 (이메일 인증 필요) - 단순화된 버전
export async function requestPasswordChangeWithEmailVerification(
  newPassword: string
): Promise<PasswordChangeRequest> {
  try {
    // 현재 사용자 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        message: '로그인이 필요합니다.'
      }
    }

    // 비밀번호 강도 검사
    const strengthCheck = checkPasswordStrength(newPassword)
    
    if (!strengthCheck.isStrong) {
      return {
        success: false,
        message: `비밀번호가 너무 약합니다: ${strengthCheck.feedback.join(', ')}`
      }
    }

    // 재인증 이메일 발송 (Supabase Auth의 reauthentication 기능 사용)
    const { error: otpError } = await supabase.auth.reauthenticate()
    
    if (otpError) {
      console.error('Reauthentication OTP error:', otpError)
      return {
        success: false,
        message: '인증 이메일 발송에 실패했습니다.'
      }
    }

    // 새 비밀번호를 임시 저장 (실제로는 세션 스토리지나 메모리에 저장)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pending_password_change', newPassword)
    }

    return {
      success: true,
      message: '이메일로 인증 코드를 발송했습니다.',
      tokenHash: 'pending' // 임시 토큰
    }
  } catch (error) {
    console.error('Password change request error:', error)
    return {
      success: false,
      message: '비밀번호 변경 요청 중 예상치 못한 오류가 발생했습니다.'
    }
  }
}

// 토큰으로 비밀번호 변경 확인 - 단순화된 버전
export async function confirmPasswordChangeWithToken(
  tokenHash: string
): Promise<PasswordChangeConfirmation> {
  try {
    // 임시 저장된 새 비밀번호 가져오기
    const newPassword = typeof window !== 'undefined' 
      ? sessionStorage.getItem('pending_password_change')
      : null

    if (!newPassword) {
      return {
        success: false,
        message: '저장된 비밀번호 정보를 찾을 수 없습니다.'
      }
    }

    // Supabase Auth를 사용하여 비밀번호 업데이트
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      console.error('Password update error:', error)
      return {
        success: false,
        message: '비밀번호 변경에 실패했습니다.'
      }
    }

    // 임시 저장된 비밀번호 삭제
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pending_password_change')
    }

    return {
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    }
  } catch (error) {
    console.error('Password change confirmation error:', error)
    return {
      success: false,
      message: '비밀번호 변경 확인 중 예상치 못한 오류가 발생했습니다.'
    }
  }
}

// 비밀번호 변경 상태 확인 - 단순화된 버전
export async function getPasswordChangeStatus(): Promise<PasswordChangeStatus | null> {
  try {
    // 세션 스토리지에서 대기 중인 요청 확인
    const hasPending = typeof window !== 'undefined' 
      ? sessionStorage.getItem('pending_password_change') !== null
      : false

    return {
      hasPendingRequest: hasPending,
      requestedAt: hasPending ? new Date().toISOString() : null,
      expiresAt: hasPending ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null // 15분 후 만료
    }
  } catch (error) {
    console.error('Password change status error:', error)
    return null
  }
}

// OTP 코드로 재인증 확인
export async function verifyReauthenticationOTP(
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token,
      type: 'email'
    })

    if (error) {
      console.error('OTP verification error:', error)
      return {
        success: false,
        message: getOTPErrorMessage(error.message)
      }
    }

    return {
      success: true,
      message: '재인증이 완료되었습니다.'
    }
  } catch (error) {
    console.error('OTP verification error:', error)
    return {
      success: false,
      message: 'OTP 인증 중 오류가 발생했습니다.'
    }
  }
}

// 기존 비밀번호로 재인증 (민감한 작업 전)
export async function reauthenticateWithPassword(
  currentPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user?.email) {
      return {
        success: false,
        message: '사용자 정보를 확인할 수 없습니다.'
      }
    }

    // 현재 비밀번호로 재로그인 시도
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    })

    if (error) {
      return {
        success: false,
        message: '현재 비밀번호가 올바르지 않습니다.'
      }
    }

    return {
      success: true,
      message: '재인증이 완료되었습니다.'
    }
  } catch (error) {
    console.error('Password reauthentication error:', error)
    return {
      success: false,
      message: '재인증 중 오류가 발생했습니다.'
    }
  }
}

// OTP 에러 메시지 변환
function getOTPErrorMessage(errorMessage: string): string {
  switch (errorMessage) {
    case 'Token has expired or is invalid':
      return 'OTP 코드가 만료되었거나 유효하지 않습니다.'
    case 'Invalid token':
      return 'OTP 코드가 올바르지 않습니다.'
    case 'Too many requests':
      return '너무 많은 요청을 보내셨습니다. 잠시 후 다시 시도해주세요.'
    default:
      return 'OTP 인증에 실패했습니다.'
  }
}

// 비밀번호 변경 플로우 전체 관리
export class PasswordChangeFlow {
  private tokenHash: string | null = null
  private pendingRequest: boolean = false

  // 1단계: 비밀번호 변경 요청
  async requestChange(newPassword: string): Promise<{ success: boolean; message: string }> {
    const result = await requestPasswordChangeWithEmailVerification(newPassword)
    
    if (result.success && result.tokenHash) {
      this.tokenHash = result.tokenHash
      this.pendingRequest = true
    }
    
    return {
      success: result.success,
      message: result.message
    }
  }

  // 2단계: OTP 인증
  async verifyOTP(otpCode: string): Promise<{ success: boolean; message: string }> {
    const otpResult = await verifyReauthenticationOTP(otpCode)
    
    if (!otpResult.success) {
      return otpResult
    }

    // OTP 인증 성공 후 토큰으로 비밀번호 변경 완료
    if (this.tokenHash) {
      const confirmResult = await confirmPasswordChangeWithToken(this.tokenHash)
      
      if (confirmResult.success) {
        this.reset()
      }
      
      return confirmResult
    }

    return {
      success: false,
      message: '비밀번호 변경 토큰을 찾을 수 없습니다.'
    }
  }

  // 상태 초기화
  reset(): void {
    this.tokenHash = null
    this.pendingRequest = false
  }

  // 현재 상태 확인
  get hasPendingRequest(): boolean {
    return this.pendingRequest
  }
}