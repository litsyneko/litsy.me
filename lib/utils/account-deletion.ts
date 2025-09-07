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
    const resp = await fetch('/api/profile/delete', { method: 'POST' })
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}))
      return { success: false, message: body.message || '계정 삭제를 시작하지 못했습니다.' }
    }
    return { success: true, message: '계정 삭제를 진행할 수 있습니다.', requiresConfirmation: true }
  } catch (error) {
    console.error('Account deletion request error:', error)
    return { success: false, message: '계정 삭제 요청 중 예상치 못한 오류가 발생했습니다.' }
  }
}

// OTP 코드로 계정 삭제 확인 - RPC 호출로 변경
export async function confirmAccountDeletion(): Promise<AccountDeletionConfirmation> {
  try {
    const resp = await fetch('/api/profile/delete', { method: 'DELETE' })
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}))
      return { success: false, message: body.message || '계정 삭제에 실패했습니다.' }
    }
    return { success: true, message: '계정이 성공적으로 삭제되었습니다.' }
  } catch (error) {
    console.error('Account deletion confirmation error:', error)
    return { success: false, message: `계정 삭제 확인 중 예상치 못한 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}` }
  }
}

// Reauthenticate user before deletion if needed. Client-side wrapper that
// calls server endpoint to verify current authentication/reauth state.
export async function reauthenticateForDeletion(): Promise<{ success: boolean; message: string }> {
  try {
    const resp = await fetch('/api/profile/delete', { method: 'POST' })
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}))
      return { success: false, message: body.message || '재인증에 실패했습니다.' }
    }
    return { success: true, message: '재인증 완료' }
  } catch (error) {
    console.error('reauthenticateForDeletion error:', error)
    return { success: false, message: '서버 오류' }
  }
}

// 현재 비밀번호로 재인증 (계정 삭제 전)


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

  // 2단계: 계정 삭제
  async confirmDeletion(): Promise<{ success: boolean; message: string }> { // Removed otpCode parameter
    const result = await confirmAccountDeletion() // Removed otpCode argument
    
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