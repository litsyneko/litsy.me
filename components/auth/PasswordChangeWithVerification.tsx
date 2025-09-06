'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  Eye, 
  EyeOff, 
  Mail,
  Shield
} from 'lucide-react'
import { 
  PasswordChangeFlow,
  getPasswordChangeStatus,
  checkPasswordStrength 
} from '@/lib/utils/password-change-verification'
import { toast } from 'sonner'

type Step = 'current-password' | 'new-password' | 'otp-verification' | 'success'

export default function PasswordChangeWithVerification() {
  const [currentStep, setCurrentStep] = useState<Step>('current-password')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 폼 상태
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  
  // UI 상태
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([])
  
  // 비밀번호 변경 플로우 관리
  const [passwordFlow] = useState(() => new PasswordChangeFlow())

  // 비밀번호 강도 체크
  useEffect(() => {
    if (newPassword) {
      const strength = checkPasswordStrength(newPassword)
      setPasswordStrength(strength.score)
      setPasswordFeedback(strength.feedback)
    } else {
      setPasswordStrength(0)
      setPasswordFeedback([])
    }
  }, [newPassword])

  // 기존 요청 상태 확인
  useEffect(() => {
    const checkExistingRequest = async () => {
      const status = await getPasswordChangeStatus()
      if (status?.hasPendingRequest) {
        setCurrentStep('otp-verification')
        toast.info('진행 중인 비밀번호 변경 요청이 있습니다.')
      }
    }
    
    checkExistingRequest()
  }, [])

  const handleCurrentPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentPassword) {
      setError('현재 비밀번호를 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { reauthenticateWithPassword } = await import('@/lib/utils/password-change-verification')
      const result = await reauthenticateWithPassword(currentPassword)
      
      if (result.success) {
        setCurrentStep('new-password')
        toast.success('현재 비밀번호가 확인되었습니다.')
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('재인증 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      return
    }

    if (passwordStrength < 4) {
      setError('더 강력한 비밀번호를 사용해주세요.')
      return
    }

    if (newPassword === currentPassword) {
      setError('새 비밀번호는 현재 비밀번호와 달라야 합니다.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await passwordFlow.requestChange(newPassword)
      
      if (result.success) {
        setCurrentStep('otp-verification')
        toast.success('인증 이메일을 발송했습니다.')
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('비밀번호 변경 요청 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otpCode || otpCode.length !== 6) {
      setError('6자리 인증 코드를 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await passwordFlow.verifyOTP(otpCode)
      
      if (result.success) {
        setCurrentStep('success')
        toast.success('비밀번호가 성공적으로 변경되었습니다!')
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('OTP 인증 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    passwordFlow.reset()
    setCurrentStep('current-password')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setOtpCode('')
    setError(null)
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return 'bg-red-500'
      case 2: return 'bg-orange-500'
      case 3: return 'bg-yellow-500'
      case 4: return 'bg-blue-500'
      case 5: return 'bg-green-500'
      default: return 'bg-gray-300'
    }
  }

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return ''
      case 1: return '매우 약함'
      case 2: return '약함'
      case 3: return '보통'
      case 4: return '강함'
      case 5: return '매우 강함'
      default: return ''
    }
  }

  const renderCurrentPasswordStep = () => (
    <form onSubmit={handleCurrentPasswordSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current-password">현재 비밀번호</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            id="current-password"
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="현재 비밀번호를 입력하세요"
            className="pl-10 pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-1 top-1 h-8 w-8"
          >
            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>확인 중...</span>
          </div>
        ) : (
          '현재 비밀번호 확인'
        )}
      </Button>
    </form>
  )

  const renderNewPasswordStep = () => (
    <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-password">새 비밀번호</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            id="new-password"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호를 입력하세요"
            className="pl-10 pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-1 top-1 h-8 w-8"
          >
            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        
        {newPassword && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>비밀번호 강도</span>
              <span className={`font-medium ${
                passwordStrength < 3 ? "text-red-500" : 
                passwordStrength < 4 ? "text-yellow-500" : "text-green-500"
              }`}>
                {getPasswordStrengthText()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                style={{ width: `${(passwordStrength / 5) * 100}%` }}
              ></div>
            </div>
            {passwordFeedback.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <p>개선 사항:</p>
                <ul className="list-disc list-inside ml-2">
                  {passwordFeedback.map((feedback, index) => (
                    <li key={index}>{feedback}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="새 비밀번호를 다시 입력하세요"
            className="pl-10 pr-10"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-1 top-1 h-8 w-8"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
        )}
      </div>

      <div className="flex space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setCurrentStep('current-password')}
          className="flex-1"
        >
          이전
        </Button>
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={loading || passwordStrength < 4}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>요청 중...</span>
            </div>
          ) : (
            '이메일 인증 요청'
          )}
        </Button>
      </div>
    </form>
  )

  const renderOTPStep = () => (
    <form onSubmit={handleOTPSubmit} className="space-y-4">
      <div className="text-center space-y-2">
        <Mail className="h-12 w-12 text-primary mx-auto" />
        <h3 className="text-lg font-semibold">이메일 인증</h3>
        <p className="text-sm text-muted-foreground">
          이메일로 발송된 6자리 인증 코드를 입력해주세요.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="otp-code">인증 코드</Label>
        <Input
          id="otp-code"
          type="text"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456"
          className="text-center text-2xl tracking-widest"
          maxLength={6}
          required
        />
      </div>

      <div className="flex space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleReset}
          className="flex-1"
        >
          취소
        </Button>
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={loading || otpCode.length !== 6}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>인증 중...</span>
            </div>
          ) : (
            '인증 완료'
          )}
        </Button>
      </div>
    </form>
  )

  const renderSuccessStep = () => (
    <div className="text-center space-y-4">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
      <h3 className="text-xl font-semibold">비밀번호 변경 완료</h3>
      <p className="text-muted-foreground">
        비밀번호가 성공적으로 변경되었습니다.
      </p>
      <Button onClick={handleReset} className="w-full">
        새로운 비밀번호 변경
      </Button>
    </div>
  )

  const getStepTitle = () => {
    switch (currentStep) {
      case 'current-password': return '현재 비밀번호 확인'
      case 'new-password': return '새 비밀번호 설정'
      case 'otp-verification': return '이메일 인증'
      case 'success': return '변경 완료'
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 'current-password': return '보안을 위해 현재 비밀번호를 확인합니다.'
      case 'new-password': return '새로운 비밀번호를 설정해주세요.'
      case 'otp-verification': return '이메일로 발송된 인증 코드를 입력해주세요.'
      case 'success': return '비밀번호가 안전하게 변경되었습니다.'
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>{getStepTitle()}</CardTitle>
        <CardDescription>{getStepDescription()}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {currentStep === 'current-password' && renderCurrentPasswordStep()}
        {currentStep === 'new-password' && renderNewPasswordStep()}
        {currentStep === 'otp-verification' && renderOTPStep()}
        {currentStep === 'success' && renderSuccessStep()}

        {/* 진행 상황 표시 */}
        <div className="flex justify-center space-x-2 pt-4">
          {['current-password', 'new-password', 'otp-verification', 'success'].map((step, index) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full ${
                currentStep === step 
                  ? 'bg-primary' 
                  : ['current-password', 'new-password', 'otp-verification', 'success'].indexOf(currentStep) > index
                  ? 'bg-primary/50'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}