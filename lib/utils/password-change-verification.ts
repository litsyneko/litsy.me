// This file is client-safe: it contains password strength checks and client-side flow helpers.
// Server-side Clerk calls have been moved to an API route (app/api/profile/password/route.ts).

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
  // 비밀번호 강도 검사
    const strengthCheck = checkPasswordStrength(newPassword)
    
    if (!strengthCheck.isStrong) {
      return {
        success: false,
        message: `비밀번호가 너무 약합니다: ${strengthCheck.feedback.join(', ')}`
      }
    }

    // With Clerk, password change is typically a direct update.
    // The "email verification" part would be handled by Clerk's own email verification flow if needed.
    // For this direct migration, we assume the user is authenticated and can change their password.
    // The actual update will happen in confirmPasswordChangeWithToken.
    
    // We will store the new password in a temporary variable or pass it directly to confirmPasswordChangeWithToken
    // For simplicity in this migration, we'll assume confirmPasswordChangeWithToken will receive the new password directly.
    // The `tokenHash` and `sessionStorage` are no longer needed.

    // Delegate actual password change flow to server API
    const resp = await fetch('/api/profile/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword })
    })

    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}))
      return { success: false, message: body.message || '서버에서 비밀번호 변경을 시작하지 못했습니다.' }
    }

    return { success: true, message: '비밀번호 변경을 진행할 수 있습니다.' }
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
  newPassword: string // New parameter
): Promise<PasswordChangeConfirmation> {
  try {
    // Call server API to perform the password update (server will call Clerk)
    const resp = await fetch('/api/profile/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword })
    })

    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}))
      return { success: false, message: body.message || '비밀번호 변경에 실패했습니다.' }
    }

    return { success: true, message: '비밀번호가 성공적으로 변경되었습니다.' }
  } catch (error) {
    console.error('Password update error:', error)
    return {
      success: false,
      message: `비밀번호 변경에 실패했습니다: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

// Check status of any pending password change requests (client wrapper)
export async function getPasswordChangeStatus(): Promise<PasswordChangeStatus> {
  try {
    const resp = await fetch('/api/profile/password/status')
    if (!resp.ok) return { hasPendingRequest: false, requestedAt: null, expiresAt: null }
    const body = await resp.json()
    return { hasPendingRequest: !!body.hasPendingRequest, requestedAt: body.requestedAt || null, expiresAt: body.expiresAt || null }
  } catch (error) {
    console.error('getPasswordChangeStatus error:', error)
    return { hasPendingRequest: false, requestedAt: null, expiresAt: null }
  }
}

// 비밀번호 변경 상태 확인 - 단순화된 버전


// 비밀번호 변경 플로우 전체 관리
export class PasswordChangeFlow {
  // The state (tokenHash, pendingRequest) is no longer directly managed here
  // as the flow is simplified to direct password change.

  // 1단계: 비밀번호 변경 요청 (실제로는 인증 확인 및 강도 검사)
  async requestChange(newPassword: string): Promise<{ success: boolean; message: string }> {
    const result = await requestPasswordChangeWithEmailVerification(newPassword)
    // No tokenHash or pendingRequest state to manage here
    return result
  }

  // 2단계: 비밀번호 변경 확인 (실제 비밀번호 업데이트)
  async confirmChange(newPassword: string): Promise<{ success: boolean; message: string }> { // Renamed from verifyOTP, takes newPassword directly
    const result = await confirmPasswordChangeWithToken(newPassword) // Pass newPassword directly
    // No state to reset here, as it's a direct operation
    return result
  }

  // 상태 초기화 (if needed for external management)
  reset(): void {
    // No internal state to reset
  }

  // 현재 상태 확인 (if needed for external management)
  get hasPendingRequest(): boolean {
    return false // No pending request state managed internally
  }
}