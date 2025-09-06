'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Loader2, 
  AlertTriangle, 
  Trash2, 
  Lock, 
  Eye, 
  EyeOff, 
  Mail,
  Shield
} from 'lucide-react'
import { 
  AccountDeletionFlow,
  reauthenticateForDeletion 
} from '@/lib/utils/account-deletion'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

type Step = 'confirm' | 'password' | 'otp' | 'processing'

export default function AccountDeletion() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('confirm')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  
  // 폼 상태
  const [currentPassword, setCurrentPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [confirmText, setConfirmText] = useState('')
  
  // UI 상태
  const [showPassword, setShowPassword] = useState(false)
  
  // 계정 삭제 플로우 관리
  const [deletionFlow] = useState(() => new AccountDeletionFlow())

  const isDiscordAccount = user?.app_metadata?.provider === 'discord'
  const requiredConfirmText = '계정을 삭제합니다'

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentPassword) {
      setError('현재 비밀번호를 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await reauthenticateForDeletion(currentPassword)
      
      if (result.success) {
        // 재인증 성공 후 삭제 요청
        const deletionResult = await deletionFlow.requestDeletion()
        
        if (deletionResult.success) {
          setCurrentStep('otp')
          toast.success('계정 삭제 확인 이메일을 발송했습니다.')
        } else {
          setError(deletionResult.message)
        }
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('재인증 중 오류가 발생했습니다.')
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
    setCurrentStep('processing')

    try {
      const result = await deletionFlow.confirmDeletion(otpCode)
      
      if (result.success) {
        toast.success('계정이 성공적으로 삭제되었습니다.')
        
        // 로그아웃 및 로그인 페이지로 리디렉션
        await signOut()
        router.push('/auth?message=' + encodeURIComponent('계정이 삭제되었습니다.'))
      } else {
        setError(result.message)
        setCurrentStep('otp')
      }
    } catch (error) {
      setError('계정 삭제 중 오류가 발생했습니다.')
      setCurrentStep('otp')
    } finally {
      setLoading(false)
    }
  }

  const handleDiscordDeletion = async () => {
    if (confirmText !== requiredConfirmText) {
      setError(`'${requiredConfirmText}'를 정확히 입력해주세요.`)
      return
    }

    setLoading(true)
    setError(null)
    setCurrentStep('processing')

    try {
      const result = await deletionFlow.requestDeletion()
      
      if (result.success) {
        setCurrentStep('otp')
        toast.success('계정 삭제 확인 이메일을 발송했습니다.')
      } else {
        setError(result.message)
        setCurrentStep('confirm')
      }
    } catch (error) {
      setError('계정 삭제 요청 중 오류가 발생했습니다.')
      setCurrentStep('confirm')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    deletionFlow.reset()
    setCurrentStep('confirm')
    setCurrentPassword('')
    setOtpCode('')
    setConfirmText('')
    setError(null)
    setIsOpen(false)
  }

  const renderConfirmStep = () => (
    <div className="space-y-4">
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          <div className="space-y-2">
            <p className="font-medium">계정 삭제 시 다음 데이터가 영구적으로 삭제됩니다:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>프로필 정보 및 설정</li>
              <li>작성한 프로젝트 및 댓글</li>
              <li>모든 개인 데이터</li>
              <li>로그인 기록</li>
            </ul>
            <p className="font-medium text-red-900 dark:text-red-100">
              이 작업은 되돌릴 수 없습니다.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="confirm-text">
          계속하려면 "<span className="font-mono text-red-600">{requiredConfirmText}</span>"를 입력하세요
        </Label>
        <Input
          id="confirm-text"
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={requiredConfirmText}
          className="font-mono"
        />
      </div>

      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="flex-1"
        >
          취소
        </Button>
        <Button 
          variant="destructive" 
          onClick={isDiscordAccount ? handleDiscordDeletion : () => setCurrentStep('password')}
          disabled={confirmText !== requiredConfirmText || loading}
          className="flex-1"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>처리 중...</span>
            </div>
          ) : (
            '계정 삭제 진행'
          )}
        </Button>
      </div>
    </div>
  )

  const renderPasswordStep = () => (
    <form onSubmit={handlePasswordSubmit} className="space-y-4">
      <div className="text-center space-y-2">
        <Shield className="h-12 w-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-semibold">보안 확인</h3>
        <p className="text-sm text-muted-foreground">
          계정 삭제를 위해 현재 비밀번호를 입력해주세요.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="current-password">현재 비밀번호</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            id="current-password"
            type={showPassword ? "text" : "password"}
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
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1 top-1 h-8 w-8"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setCurrentStep('confirm')}
          className="flex-1"
        >
          이전
        </Button>
        <Button 
          type="submit" 
          variant="destructive"
          className="flex-1" 
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>확인 중...</span>
            </div>
          ) : (
            '비밀번호 확인'
          )}
        </Button>
      </div>
    </form>
  )

  const renderOTPStep = () => (
    <form onSubmit={handleOTPSubmit} className="space-y-4">
      <div className="text-center space-y-2">
        <Mail className="h-12 w-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-semibold">이메일 인증</h3>
        <p className="text-sm text-muted-foreground">
          계정 삭제 확인을 위해 이메일로 발송된 6자리 인증 코드를 입력해주세요.
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
          variant="destructive"
          className="flex-1" 
          disabled={loading || otpCode.length !== 6}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>삭제 중...</span>
            </div>
          ) : (
            '계정 삭제 확인'
          )}
        </Button>
      </div>
    </form>
  )

  const renderProcessingStep = () => (
    <div className="text-center space-y-4">
      <Loader2 className="h-16 w-16 text-red-500 mx-auto animate-spin" />
      <h3 className="text-xl font-semibold">계정 삭제 중...</h3>
      <p className="text-muted-foreground">
        계정과 모든 데이터를 삭제하고 있습니다. 잠시만 기다려주세요.
      </p>
    </div>
  )

  const getStepTitle = () => {
    switch (currentStep) {
      case 'confirm': return '계정 삭제 확인'
      case 'password': return '보안 확인'
      case 'otp': return '이메일 인증'
      case 'processing': return '처리 중'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          계정 삭제
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>{getStepTitle()}</span>
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'confirm' && '계정 삭제는 되돌릴 수 없습니다.'}
            {currentStep === 'password' && '보안을 위해 현재 비밀번호를 확인합니다.'}
            {currentStep === 'otp' && '이메일로 발송된 인증 코드를 입력해주세요.'}
            {currentStep === 'processing' && '계정 삭제를 처리하고 있습니다.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {currentStep === 'confirm' && renderConfirmStep()}
          {currentStep === 'password' && renderPasswordStep()}
          {currentStep === 'otp' && renderOTPStep()}
          {currentStep === 'processing' && renderProcessingStep()}
        </div>
      </DialogContent>
    </Dialog>
  )
}