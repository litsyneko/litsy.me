'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { checkPasswordStrength, validatePasswordResetToken } from '@/lib/utils/password-reset'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

function ResetPasswordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isValidSession, setIsValidSession] = useState(false)

  // 비밀번호 강도 체크 (개선된 버전)
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      return
    }

    const strengthCheck = checkPasswordStrength(password)
    setPasswordStrength(strengthCheck.score)
  }, [password])

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // URL에서 토큰 확인
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')
        
        // URL 쿼리에서도 확인
        const urlParams = new URLSearchParams(window.location.search)
        const tokenHash = urlParams.get('token_hash')
        const resetType = urlParams.get('type')
        
        if (type === 'recovery' || resetType === 'recovery') {
          if (accessToken && refreshToken) {
            // 토큰을 사용하여 세션 설정
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (error) {
              console.error('Session setting error:', error)
              setError('비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.')
              return
            }
            
            if (data.session) {
              setIsValidSession(true)
              toast.success('비밀번호 재설정 준비가 완료되었습니다.')
            }
          } else if (tokenHash) {
            // token_hash를 사용한 확인 방식
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'recovery'
            })
            
            if (error) {
              console.error('Token verification error:', error)
              setError('비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.')
              return
            }
            
            if (data.session) {
              setIsValidSession(true)
              toast.success('비밀번호 재설정 준비가 완료되었습니다.')
            }
          } else {
            setError('비밀번호 재설정 토큰을 찾을 수 없습니다.')
          }
        } else {
          setError('잘못된 비밀번호 재설정 링크입니다.')
        }
      } catch (err) {
        console.error('Password reset error:', err)
        setError('비밀번호 재설정 처리 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    handlePasswordReset()
  }, [])

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    if (password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.')
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (passwordStrength < 3) {
      setError('더 강력한 비밀번호를 사용해주세요.')
      return
    }

    setUpdating(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('Password update error:', error)
        setError('비밀번호 업데이트에 실패했습니다.')
        return
      }

      setSuccess(true)
      toast.success('비밀번호가 성공적으로 변경되었습니다!')
      
      // 3초 후 로그인 페이지로 리디렉션
      setTimeout(() => {
        router.push('/auth?message=' + encodeURIComponent('비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.'))
      }, 3000)
    } catch (err) {
      console.error('Password update error:', err)
      setError('비밀번호 업데이트 중 오류가 발생했습니다.')
    } finally {
      setUpdating(false)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/95 p-4">
        <Card className="w-full max-w-md border-border/50 shadow-lg backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">처리 중...</CardTitle>
            <CardDescription>
              비밀번호 재설정 링크를 확인하고 있습니다.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/95 p-4">
        <Card className="w-full max-w-md border-border/50 shadow-lg backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold">재설정 실패</CardTitle>
            <CardDescription>
              비밀번호 재설정에 문제가 발생했습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {error}
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col gap-2">
              <Button onClick={() => router.push('/auth?tab=recovery')} className="w-full">
                다시 재설정 요청하기
              </Button>
              <Button onClick={() => router.push('/auth')} variant="outline" className="w-full">
                로그인 페이지로 이동
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/95 p-4">
        <Card className="w-full max-w-md border-border/50 shadow-lg backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">변경 완료</CardTitle>
            <CardDescription>
              비밀번호가 성공적으로 변경되었습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                새 비밀번호로 로그인할 수 있습니다.
              </AlertDescription>
            </Alert>
            
            <div className="text-center text-sm text-muted-foreground">
              곧 로그인 페이지로 이동합니다...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/95 p-4">
        <Card className="w-full max-w-md border-border/50 shadow-lg backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle className="text-2xl font-bold">세션 만료</CardTitle>
            <CardDescription>
              비밀번호 재설정 세션이 유효하지 않습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                새로운 비밀번호 재설정 링크를 요청해주세요.
              </AlertDescription>
            </Alert>
            
            <Button onClick={() => router.push('/auth?tab=recovery')} className="w-full">
              새 재설정 링크 요청하기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/95 p-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">새 비밀번호 설정</CardTitle>
          <CardDescription>
            새로운 비밀번호를 입력해주세요.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">새 비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="새 비밀번호를 입력하세요 (최소 8자)"
                  className="pl-10 pr-10 h-12"
                  minLength={8}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1 h-10 w-10"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              {password && (
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
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">비밀번호 확인</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  className="pl-10 pr-10 h-12"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-1 top-1 h-10 w-10"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-medium" 
              disabled={updating || passwordStrength < 3}
            >
              {updating ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>변경 중...</span>
                </div>
              ) : (
                '비밀번호 변경'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => router.push('/auth')}
              className="text-primary hover:underline"
            >
              로그인 페이지로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordPageContent />
    </Suspense>
  )
}