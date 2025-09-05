"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isValidSession, setIsValidSession] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkSessionAndHandleErrors = async () => {
      // URL 해시에서 에러 확인
      const hash = window.location.hash
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1))
        const error = hashParams.get('error')
        const errorCode = hashParams.get('error_code')
        const errorDescription = hashParams.get('error_description')

        if (error) {
          let errorMessage = "알 수 없는 오류가 발생했습니다."
          
          switch (errorCode) {
            case 'otp_expired':
              errorMessage = "이메일 링크가 만료되었습니다. 새로운 비밀번호 재설정 링크를 요청해주세요."
              break
            case 'access_denied':
              errorMessage = "접근이 거부되었습니다. 올바른 링크를 사용했는지 확인해주세요."
              break
            default:
              errorMessage = errorDescription ? decodeURIComponent(errorDescription) : errorMessage
          }
          
          setError(errorMessage)
          return
        }

        // 유효한 토큰이 있는지 확인
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (error) {
              setError("세션 설정에 실패했습니다: " + error.message)
            } else if (data.session) {
              setIsValidSession(true)
            }
          } catch (err) {
            setError("세션 처리 중 오류가 발생했습니다.")
          }
        }
      }

      // 현재 세션 확인
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsValidSession(true)
      } else if (!error) {
        setError("유효하지 않은 세션입니다. 새로운 비밀번호 재설정 링크를 요청해주세요.")
      }
    }

    checkSessionAndHandleErrors()
  }, [])

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      setError("모든 필드를 입력해주세요.")
      return
    }
    
    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.")
      return
    }
    
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }
    
    setError(null)
    setMessage(null)
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      })
      
      if (error) {
        setError(error.message)
      } else {
        setMessage("비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.")
        
        // 로그아웃 후 로그인 페이지로 이동
        await supabase.auth.signOut()
        setTimeout(() => {
          router.push('/auth?message=' + encodeURIComponent('비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.'))
        }, 2000)
      }
    } catch (err: any) {
      setError("비밀번호 변경 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  if (!isValidSession && error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto p-8 bg-card border rounded-xl shadow-lg backdrop-blur-sm"
        >
          <h1 className="text-2xl font-bold mb-6 text-center text-foreground">
            비밀번호 재설정 오류
          </h1>
          
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <Button
              onClick={() => router.push('/auth')}
              className="w-full"
            >
              로그인 페이지로 이동
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              페이지 새로고침
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto p-8 bg-card border rounded-xl shadow-lg backdrop-blur-sm"
      >
        <h1 className="text-2xl font-bold mb-8 text-center text-foreground">
          비밀번호 재설정
        </h1>
        
        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div>
            <Label htmlFor="password" className="text-foreground">새 비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="새 비밀번호를 입력하세요 (최소 6자)"
              className="mt-2"
              minLength={6}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="confirmPassword" className="text-foreground">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              className="mt-2"
              minLength={6}
              required
            />
          </div>
          
          <Button type="submit" className="w-full py-3" disabled={loading}>
            {loading ? "변경 중..." : "비밀번호 변경"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => router.push('/auth')}
            className="text-primary hover:underline"
          >
            로그인 페이지로 돌아가기
          </Button>
        </div>
        
        {message && <p className="mt-6 text-sm text-green-600 dark:text-green-400 text-center">{message}</p>}
        {error && <p className="mt-6 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
      </motion.div>
    </div>
  )
}
