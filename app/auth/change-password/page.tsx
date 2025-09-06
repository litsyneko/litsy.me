'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, Shield } from 'lucide-react'
import { confirmPasswordChangeWithToken } from '@/lib/utils/password-change-verification'
import { toast } from 'sonner'

function ChangePasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handlePasswordChange = async () => {
      try {
        // URL에서 토큰 해시 가져오기
        const tokenHash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        
        if (!tokenHash || type !== 'reauthentication') {
          setError('유효하지 않은 비밀번호 변경 링크입니다.')
          return
        }

        // 토큰으로 비밀번호 변경 확인
        const result = await confirmPasswordChangeWithToken(tokenHash)
        
        if (result.success) {
          setSuccess(true)
          toast.success('비밀번호가 성공적으로 변경되었습니다!')
          
          // 3초 후 로그인 페이지로 리디렉션
          setTimeout(() => {
            router.push('/auth?message=' + encodeURIComponent('비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.'))
          }, 3000)
        } else {
          setError(result.message)
        }
      } catch (err) {
        console.error('Password change error:', err)
        setError('비밀번호 변경 처리 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    handlePasswordChange()
  }, [router, searchParams])

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
              비밀번호 변경을 처리하고 있습니다.
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
            <CardTitle className="text-2xl font-bold">변경 실패</CardTitle>
            <CardDescription>
              비밀번호 변경에 문제가 발생했습니다.
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
              <Button onClick={() => router.push('/profile')} className="w-full">
                프로필로 이동
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

  return null
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/95 p-4">
        <Card className="w-full max-w-md border-border/50 shadow-lg backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">로딩 중...</CardTitle>
            <CardDescription>
              페이지를 불러오고 있습니다.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <ChangePasswordContent />
    </Suspense>
  )
}