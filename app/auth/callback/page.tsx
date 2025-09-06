'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getPostLoginRedirectPath } from '@/lib/utils/validation'

function AuthCallbackPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL에서 OAuth 에러 확인 (Discord OAuth 에러 처리)
        const urlParams = new URLSearchParams(window.location.search)
        const oauthError = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')
        
        if (oauthError) {
          console.error('OAuth error:', oauthError, errorDescription)
          setStatus('error')
          
          // Discord OAuth 에러 처리 및 로깅
          try {
            const { handleDiscordOAuthError, logDiscordOAuthError } = await import('@/lib/discord')
            
            // 에러 로깅
            await logDiscordOAuthError({
              error: oauthError,
              error_description: errorDescription || undefined,
              state: urlParams.get('state') || undefined
            })
            
            // 사용자 친화적인 에러 메시지 표시
            const errorMessage = handleDiscordOAuthError({
              error: oauthError,
              error_description: errorDescription || undefined
            })
            
            setMessage(errorMessage)
          } catch (errorHandlingError) {
            console.error('Failed to handle Discord OAuth error:', errorHandlingError)
            setMessage(errorDescription || 'Discord 로그인 중 오류가 발생했습니다.')
          }
          
          return
        }

        // Supabase Auth 세션 처리
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setMessage('인증 처리 중 오류가 발생했습니다.')
          return
        }

        if (data.session) {
          const user = data.session.user
          const isDiscordUser = user.app_metadata?.provider === 'discord'
          
          setStatus('success')
          
          if (isDiscordUser) {
            setMessage(`Discord 계정으로 로그인되었습니다. 사용자 정보를 동기화하는 중...`)
            
            // Discord 사용자 정보 동기화
            try {
              const { syncDiscordUserInfo } = await import('@/lib/discord')
              const syncSuccess = await syncDiscordUserInfo(user.id)
              
              if (syncSuccess) {
                setMessage(`Discord 계정으로 로그인되었습니다. 환영합니다!`)
              } else {
                setMessage(`Discord 계정으로 로그인되었습니다. (정보 동기화 실패)`)
              }
            } catch (syncError) {
              console.error('Failed to sync Discord user info:', syncError)
              setMessage(`Discord 계정으로 로그인되었습니다. (정보 동기화 오류)`)
            }
          } else {
            setMessage('로그인이 완료되었습니다.')
          }
          
          // 리디렉션 처리
          const returnTo = searchParams.get('returnTo') || searchParams.get('return_to')
          const redirectPath = returnTo ? getPostLoginRedirectPath(returnTo) : '/'
          
          // 잠시 성공 메시지를 보여준 후 리디렉션
          setTimeout(() => {
            router.push(redirectPath)
          }, 2000)
        } else {
          setStatus('error')
          setMessage('인증 세션을 찾을 수 없습니다.')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('예상치 못한 오류가 발생했습니다.')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  const handleRetry = () => {
    router.push('/auth/login')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/95 p-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            {status === 'loading' && <Loader2 className="w-6 h-6 text-primary animate-spin" />}
            {status === 'success' && <CheckCircle className="w-6 h-6 text-green-600" />}
            {status === 'error' && <AlertCircle className="w-6 h-6 text-destructive" />}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && '인증 처리 중...'}
            {status === 'success' && '로그인 완료'}
            {status === 'error' && '인증 실패'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && '잠시만 기다려주세요.'}
            {status === 'success' && '곧 페이지로 이동합니다.'}
            {status === 'error' && '다시 시도해주세요.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <Alert className={
              status === 'success' 
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                : status === 'error'
                ? 'border-destructive/50 bg-destructive/10'
                : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
            }>
              <div className="flex items-center gap-2">
                {status === 'success' && <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />}
                {status === 'error' && <AlertCircle className="w-4 h-4 text-destructive" />}
                {status === 'loading' && <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />}
                <AlertDescription className={
                  status === 'success' 
                    ? 'text-green-800 dark:text-green-200'
                    : status === 'error'
                    ? 'text-destructive'
                    : 'text-blue-800 dark:text-blue-200'
                }>
                  {message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {status === 'error' && (
            <div className="flex flex-col gap-2">
              <Button onClick={handleRetry} className="w-full">
                다시 로그인하기
              </Button>
              <Button onClick={handleGoHome} variant="outline" className="w-full">
                홈으로 이동
              </Button>
            </div>
          )}

          {status === 'loading' && (
            <div className="flex justify-center">
              <div className="animate-pulse text-sm text-muted-foreground">
                인증 정보를 확인하고 있습니다...
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex justify-center">
              <div className="text-sm text-muted-foreground">
                자동으로 페이지로 이동합니다...
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <AuthCallbackPageContent />
    </Suspense>
  )
}