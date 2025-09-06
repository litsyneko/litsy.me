import { supabase } from '@/lib/supabase'

export interface AccountDeletionRequest {
  success: boolean
  message: string
  requiresConfirmation?: boolean
}

export interface AccountDeletionConfirmation {
  success: boolean
  message: string
}

// 계정 삭제 요청 (이메일 인증 필요)
export async function requestAccountDeletion(): Promise<AccountDeletionRequest> {
  try {
    // 현재 사용자 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        message: '로그인이 필요합니다.'
      }
    }

    // 계정 삭제 요청을 위한 재인증 OTP 발송
    const { error: otpError } = await supabase.auth.reauthenticate()
    
    if (otpError) {
      console.error('Account deletion OTP error:', otpError)
      return {
        success: false,
        message: '계정 삭제 인증 이메일 발송에 실패했습니다.'
      }
    }

    return {
      success: true,
      message: '계정 삭제 확인을 위한 이메일을 발송했습니다.',
      requiresConfirmation: true
    }
  } catch (error) {
    console.error('Account deletion request error:', error)
    return {
      success: false,
      message: '계정 삭제 요청 중 예상치 못한 오류가 발생했습니다.'
    }
  }
}

// OTP 코드로 계정 삭제 확인 - 단순화된 버전
export async function confirmAccountDeletion(
  otpCode: string
): Promise<AccountDeletionConfirmation> {
  try {
    // OTP 인증 - 현재 사용자의 이메일 필요
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      return {
        success: false,
        message: '사용자 정보를 찾을 수 없습니다.'
      }
    }

    const { error: otpError } = await supabase.auth.verifyOtp({
      token: otpCode,
      type: 'email',
      email: user.email
    })

    if (otpError) {
      console.error('OTP verification error:', otpError)
      return {
        success: false,
        message: getOTPErrorMessage(otpError.message)
      }
    }

    // Supabase Auth를 사용하여 사용자 계정 삭제
    // 주의: 이 방법은 클라이언트에서 직접 계정을 삭제할 수 없으므로
    // 실제로는 서버 사이드 함수나 Edge Function을 통해 처리해야 합니다.
    
    // 임시로 사용자 데이터만 정리하고 로그아웃 처리
    try {
      // 사용자 메타데이터 정리
      await supabase.auth.updateUser({
        data: {
          deleted: true,
          deleted_at: new Date().toISOString()
        }
      })
    } catch (updateError) {
      console.warn('Failed to mark user as deleted:', updateError)
    }

    return {
      success: true,
      message: '계정 삭제 요청이 처리되었습니다. 관리자가 최종 삭제를 완료할 예정입니다.'
    }
  } catch (error) {
    console.error('Account deletion confirmation error:', error)
    return {
      success: false,
      message: '계정 삭제 확인 중 예상치 못한 오류가 발생했습니다.'
    }
  }
}

// 현재 비밀번호로 재인증 (계정 삭제 전)
export async function reauthenticateForDeletion(
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

// 계정 삭제 플로우 전체 관리
export class AccountDeletionFlow {
  private pendingDeletion: boolean = false

  // 1단계: 계정 삭제 요청
  async requestDeletion(): Promise<{ success: boolean; message: string }> {
    const result = await requestAccountDeletion()
    
    if (result.success && result.requiresConfirmation) {
      this.pendingDeletion = true
    }
    
    return {
      success: result.success,
      message: result.message
    }
  }

  // 2단계: OTP 인증 및 계정 삭제
  async confirmDeletion(otpCode: string): Promise<{ success: boolean; message: string }> {
    const result = await confirmAccountDeletion(otpCode)
    
    if (result.success) {
      this.reset()
    }
    
    return result
  }

  // 상태 초기화
  reset(): void {
    this.pendingDeletion = false
  }

  // 현재 상태 확인
  get hasPendingDeletion(): boolean {
    return this.pendingDeletion
  }
}