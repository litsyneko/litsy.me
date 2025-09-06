'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Mail, LogIn, AlertCircle, Loader2, KeyRound } from 'lucide-react'
import { useSignInForm } from '@/hooks/useAuthForm'
import { useGuestGuard } from '@/hooks/useAuthGuard'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { getPostLoginRedirectPath } from '@/lib/utils/validation'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signInWithOAuth } = useAuth()
  const { isGuest, loading: authLoading } = useGuestGuard()
  const { formData, errors, loading, updateField, handleSubmit } = useSignInForm()
  
  const [showPassword, setShowPassword] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // URL 파라미터에서 리디렉션 경로와 메시지 확인
  const returnTo = searchParams.get('returnTo')
  const message = searchParams.get('message')
  const error = searchParams.get('error')

  useEffect(() => {
    if (message) {
      toast.success(decodeURIComponent(message))
    }
    if (error) {
      toast.error(decodeURIComponent(error))
    }
  }, [message, error])

  // Discord 로그인 처리
  const handleDiscordLogin = async () => {
    try {
      const redirectTo = returnTo ? getPostLoginRedirectPath(returnTo) : '/'
      const result = await signInWithOAuth('discord', redirectTo)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Discord 로그인 중 오류가 발생했습니다.')
    }
  }

  // 폼 제출 처리
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitMessage(null)

    const result = await handleSubmit()
    
    if (result.success) {
      setSubmitMessage({ type: 'success', message: result.message || '로그인되었습니다.' })
      toast.success(result.message || '로그인되었습니다.')
      
      // 리디렉션 처리
      const redirectPath = returnTo ? getPostLoginRedirectPath(returnTo) : '/'
      router.push(redirectPath)
    } else {
      setSubmitMessage({ type: 'error', message: result.error || '로그인 중 오류가 발생했습니다.' })
      toast.error(result.error || '로그인 중 오류가 발생했습니다.')
    }
  }

  // 로딩 중이면 로딩 화면 표시
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // 이미 로그인된 사용자는 리디렉션됨
  if (!isGuest) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/95 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 shadow-lg backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <LogIn className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">로그인</CardTitle>
            <CardDescription>
              계정에 로그인하여 서비스를 이용하세요
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Discord 로그인 버튼 */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 bg-[#5865F2] hover:bg-[#4752C4] text-white border-[#5865F2] hover:border-[#4752C4] transition-colors"
              onClick={handleDiscordLogin}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Discord로 로그인
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">또는</span>
              </div>
            </div>

            {/* 로그인 폼 */}
            <form onSubmit={onSubmit} className="space-y-4">
              {/* 이메일 */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={`pl-10 h-12 ${errors.email ? 'border-destructive' : ''}`}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* 비밀번호 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">비밀번호</Label>
                  <Link 
                    href="/auth/reset-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    비밀번호를 잊으셨나요?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호를 입력하세요"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className={`pr-10 h-12 ${errors.password ? 'border-destructive' : ''}`}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* 제출 메시지 */}
              {submitMessage && (
                <Alert className={submitMessage.type === 'success' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : 'border-destructive/50 bg-destructive/10'}>
                  <div className="flex items-center gap-2">
                    {submitMessage.type === 'success' ? (
                      <LogIn className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                    <AlertDescription className={submitMessage.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-destructive'}>
                      {submitMessage.message}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {/* 제출 버튼 */}
              <Button
                type="submit"
                className="w-full h-12"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    로그인
                  </>
                )}
              </Button>
            </form>

            {/* 회원가입 링크 */}
            <div className="text-center text-sm text-muted-foreground">
              아직 계정이 없으신가요?{' '}
              <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                회원가입하기
              </Link>
            </div>

            {/* 추가 링크들 */}
            <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
              <Link href="/auth/reset-password" className="hover:text-primary transition-colors flex items-center gap-1">
                <KeyRound className="w-3 h-3" />
                비밀번호 재설정
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}