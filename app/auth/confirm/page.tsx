'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { toast } from 'sonner'

function ConfirmPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)

  useEffect(() => {
    const confirmEmail = async () => {
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      const next = searchParams.get('next') || '/'

      if (!token_hash || !type) {
        setStatus('error')
        setMessage('잘못된 확인 링크입니다.')
        return
      }

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any,
        })

        if (error) {
          console.error('Email confirmation error:', error)
          
          if (error.message.includes('expired') || error.message.includes('invalid')) {
            setStatus('expired')
            setMessage('확인 링크가 만료되었거나 유효하지 않습니다.')
          } else {
            setStatus('error')
            setMessage(error.message || '이메일 확인 중 오류가 발생했습니다.')
          }
          return
        }

        if (data.user) {
          setStatus('success')
          setMessage('이메일이 성공적으로 확인되었습니다!')
          setEmail(data.user.email || '')
          
          // 3초 후 리디렉션
          setTimeout(() => {
            router.push(next)
          }, 3000)
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        setStatus('error')
        setMessage('예상치 못한 오류가 발생했습니다.')
      }
    }

    confirmEmail()
  }, [searchParams, router])

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error('이메일 주소를 찾을 수 없습니다.')
      return
    }

    setResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      })

      if (error) {
        toast.error(error.message || '이메일 재발송 중 오류가 발생했습니다.')
      } else {
        toast.success('확인 이메일을 재발송했습니다.')
      }
    } catch (error) {
      toast.error('예상치 못한 오류가 발생했습니다.')
    } finally {
      setResending(false)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
              <CardTitle>이메일 확인 중</CardTitle>
              <CardDescription>
                이메일 주소를 확인하고 있습니다. 잠시만 기다려주세요.
              </CardDescription>
            </CardHeader>
          </Card>
        )

      case 'success':
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-green-600 dark:text-green-400">확인 완료!</CardTitle>
              <CardDescription>
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  3초 후 자동으로 이동합니다.
                </AlertDescription>
              </Alert>
              <Button onClick={() => router.push('/')} className="w-full">
                지금 이동하기
              </Button>
            </CardContent>
          </Card>
        )

      case 'expired':
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <XCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle className="text-yellow-600 dark:text-yellow-400">링크 만료</CardTitle>
              <CardDescription>
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                <Mail className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  새로운 확인 이메일을 요청하거나 다시 회원가입을 진행해주세요.
                </AlertDescription>
              </Alert>
              
              {email && (
                <Button 
                  onClick={handleResendConfirmation} 
                  disabled={resending}
                  className="w-full"
                  variant="outline"
                >
                  {resending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      재발송 중...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      확인 이메일 재발송
                    </>
                  )}
                </Button>
              )}
              
              <div className="flex space-x-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/auth/signup">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    회원가입
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/auth/login">로그인</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 'error':
        return (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-red-600 dark:text-red-400">확인 실패</CardTitle>
              <CardDescription>
                {message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  이메일 확인에 실패했습니다. 다시 시도해주세요.
                </AlertDescription>
              </Alert>
              
              <div className="flex space-x-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/auth/signup">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    회원가입
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/auth/login">로그인</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {renderContent()}
      </motion.div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ConfirmPageContent />
    </Suspense>
  )
}