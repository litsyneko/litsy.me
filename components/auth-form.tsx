"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Phone, 
  User, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthFormProps {
  initialMode?: "signin" | "signup" | "recovery"
  redirectTo?: string
  showSocialLogin?: boolean
  className?: string
}

export default function AuthForm({ 
  initialMode = "signin", 
  redirectTo = "/",
  showSocialLogin = true,
  className 
}: AuthFormProps) {
  const [activeTab, setActiveTab] = useState(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [nickname, setNickname] = useState("")
  const [usernameField, setUsernameField] = useState("")
  const [phone, setPhone] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [useEmailLogin, setUseEmailLogin] = useState(true) // true: email+password, false: magic link
  
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // 비밀번호 강도 체크
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    
    setPasswordStrength(strength)
  }, [password])

  // URL 파라미터에서 메시지 읽기
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')
    const messageParam = urlParams.get('message')
    
    if (errorParam) {
      setMessage({ type: 'error', text: decodeURIComponent(errorParam) })
      setTimeout(() => {
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('error')
        window.history.replaceState({}, '', newUrl.toString())
      }, 100)
    }
    
    if (messageParam) {
      setMessage({ type: 'success', text: decodeURIComponent(messageParam) })
      setTimeout(() => {
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('message')
        window.history.replaceState({}, '', newUrl.toString())
      }, 100)
    }
  }, [])

  // 이미 로그인된 사용자 리다이렉트
  useEffect(() => {
    if (user && !authLoading) {
      router.push(redirectTo)
    }
  }, [user, authLoading, router, redirectTo])

  // 메시지 자동 삭제
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 7000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setMessage({ type: 'error', text: '이메일과 비밀번호를 모두 입력해주세요.' })
      return
    }

    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: '유효한 이메일 주소를 입력해주세요.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        let errorMessage = error.message
        switch (error.message) {
          case 'Invalid login credentials':
            errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다."
            break
          case 'Email not confirmed':
            errorMessage = "이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요."
            break
          case 'Too many requests':
            errorMessage = "너무 많은 요청을 보내셨습니다. 잠시 후 다시 시도해주세요."
            break
          case 'User not found':
            errorMessage = "등록되지 않은 이메일입니다. 회원가입을 진행해주세요."
            break
        }
        setMessage({ type: 'error', text: errorMessage })
      } else if (data.user) {
        setMessage({ type: 'success', text: '성공적으로 로그인되었습니다!' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: '로그인 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setMessage({ type: 'error', text: '이메일을 입력해주세요.' })
      return
    }

    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: '유효한 이메일 주소를 입력해주세요.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`
        }
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ 
          type: 'success', 
          text: '이메일을 확인하세요. 로그인 링크가 전송되었습니다.' 
        })
        setEmail('')
      }
    } catch (err) {
      setMessage({ type: 'error', text: '매직링크 전송 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setMessage({ type: 'error', text: '이메일과 비밀번호를 모두 입력해주세요.' })
      return
    }

    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: '유효한 이메일 주소를 입력해주세요.' })
      return
    }

    if (password.length < 8) {
      setMessage({ type: 'error', text: '비밀번호는 최소 8자 이상이어야 합니다.' })
      return
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: '비밀번호가 일치하지 않습니다.' })
      return
    }

    if (passwordStrength < 3) {
      setMessage({ type: 'error', text: '더 강력한 비밀번호를 사용해주세요.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // username availability check
      if (usernameField) {
        const res = await fetch(`/api/username?username=${encodeURIComponent(usernameField)}`)
        const json = await res.json()
        if (!json.available) {
          setMessage({ type: 'error', text: '이미 사용 중인 username 입니다. 다른 값을 시도하세요.' })
          setLoading(false)
          return
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim() || null,
            phone: phone.trim() || null,
            nickname: nickname.trim() || null,
            username: usernameField.trim() || null
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`
        }
      })

      if (error) {
        let errorMessage = error.message
        switch (error.message) {
          case 'User already registered':
            errorMessage = "이미 등록된 이메일입니다. 로그인을 시도해보세요."
            break
          case 'Password should be at least 6 characters':
            errorMessage = "비밀번호는 최소 6자 이상이어야 합니다."
            break
          case 'Unable to validate email address: invalid format':
            errorMessage = "유효하지 않은 이메일 형식입니다."
            break
          case 'Signup is disabled':
            errorMessage = "현재 회원가입이 비활성화되어 있습니다."
            break
        }
        setMessage({ type: 'error', text: errorMessage })
      } else {
        setMessage({ 
          type: 'success', 
          text: '가입 확인 이메일을 보냈습니다. 이메일에서 확인 링크를 클릭하세요.' 
        })
        
        // 폼 초기화
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setFullName('')
        setPhone('')
        
        // 로그인 탭으로 전환
        setTimeout(() => {
          setActiveTab('signin')
          setMessage({ 
            type: 'info', 
            text: '이메일 확인 후 로그인해주세요.' 
          })
        }, 3000)
      }
    } catch (err) {
      setMessage({ type: 'error', text: '회원가입 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setMessage({ type: 'error', text: '이메일을 입력해주세요.' })
      return
    }

    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: '유효한 이메일 주소를 입력해주세요.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ 
          type: 'success', 
          text: '비밀번호 재설정 이메일을 보냈습니다. 이메일을 확인하세요.' 
        })
        setEmail('')
      }
    } catch (err) {
      setMessage({ type: 'error', text: '비밀번호 재설정 중 오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'discord' | 'github' | 'google') => {
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`
        }
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
        setLoading(false)
      }
      // OAuth는 리다이렉트되므로 로딩 상태를 해제하지 않음
    } catch (err) {
      setMessage({ type: 'error', text: `${provider} 로그인 중 오류가 발생했습니다.` })
      setLoading(false)
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("w-full max-w-2xl mx-auto p-4", className)}
    >
      <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-xl">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center justify-center mb-2">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-bold text-center">
                {activeTab === 'signin' ? '로그인' : 
                 activeTab === 'signup' ? '회원가입' : '비밀번호 재설정'}
              </CardTitle>
            </div>
          </div>
          <CardDescription className="text-center text-base text-muted-foreground">
            {activeTab === 'signin' ? '계정에 로그인하세요' : 
             activeTab === 'signup' ? '새 계정을 만들어보세요' : '새로운 비밀번호를 설정하세요'}
          </CardDescription>

          {message && (
            <Alert className={cn(
              "border-l-4 !flex !items-center !gap-3 !grid-cols-none",
              message.type === 'error' && "border-l-red-500 bg-red-50 dark:bg-red-950/50",
              message.type === 'success' && "border-l-green-500 bg-green-50 dark:bg-green-950/50",
              message.type === 'info' && "border-l-blue-500 bg-blue-50 dark:bg-blue-950/50"
            )}>
              {message.type === 'error' && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
              {message.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
              {message.type === 'info' && <AlertCircle className="h-4 w-4 text-blue-500 shrink-0" />}
              <AlertDescription className="text-sm font-medium !col-start-auto !text-foreground">
                {message.text}
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "signin" | "signup" | "recovery")} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="signin" className="text-sm font-medium">로그인</TabsTrigger>
              <TabsTrigger value="signup" className="text-sm font-medium">회원가입</TabsTrigger>
              <TabsTrigger value="recovery" className="text-sm font-medium">비밀번호 재설정</TabsTrigger>
            </TabsList>

            {/* 로그인 탭 */}
            <TabsContent value="signin" className="space-y-4">
              {/* 로그인 방식 선택 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button
                  type="button"
                  variant={useEmailLogin ? "default" : "outline"}
                  onClick={() => setUseEmailLogin(true)}
                  className="h-10"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  비밀번호 로그인
                </Button>
                <Button
                  type="button"
                  variant={!useEmailLogin ? "default" : "outline"}
                  onClick={() => setUseEmailLogin(false)}
                  className="h-10"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  매직링크 로그인
                </Button>
              </div>

              {useEmailLogin ? (
                <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일을 입력하세요"
                        className="pl-10 h-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium">비밀번호</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요"
                        className="pl-10 pr-10 h-10"
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

                  <Button 
                    type="submit" 
                    className="w-full h-10 text-base font-medium" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>로그인 중...</span>
                      </div>
                    ) : (
                      '로그인'
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email" className="text-sm font-medium">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="magic-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일을 입력하세요"
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-medium" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>전송 중...</span>
                      </div>
                    ) : (
                      '매직링크 전송'
                    )}
                  </Button>
                </form>
              )}

              {useEmailLogin && (
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setActiveTab('recovery')}
                    className="text-primary hover:underline"
                  >
                    비밀번호를 잊으셨나요?
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* 회원가입 탭 */}
            <TabsContent value="signup" className="space-y-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">이메일 *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일을 입력하세요"
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium">이름</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="이름을 입력하세요 (선택사항)"
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone" className="text-sm font-medium">전화번호</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="전화번호를 입력하세요 (선택사항)"
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-nickname" className="text-sm font-medium">닉네임</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-nickname"
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="닉네임을 입력하세요 (선택사항)"
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-sm font-medium">username</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="signup-username"
                        type="text"
                        value={usernameField}
                        onChange={(e) => setUsernameField(e.target.value)}
                        placeholder="username을 입력하세요 (예: litsy25)"
                        className="pl-10 h-12"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">username은 공개 식별자입니다.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-medium">비밀번호 *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="비밀번호를 입력하세요 (최소 8자)"
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
                        <span className={cn(
                          "font-medium",
                          passwordStrength < 3 ? "text-red-500" : 
                          passwordStrength < 4 ? "text-yellow-500" : "text-green-500"
                        )}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn("h-2 rounded-full transition-all", getPasswordStrengthColor())}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password" className="text-sm font-medium">비밀번호 확인 *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="signup-confirm-password"
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

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-medium" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>가입 중...</span>
                    </div>
                  ) : (
                    '회원가입'
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* 비밀번호 재설정 탭 */}
            <TabsContent value="recovery" className="space-y-6">
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recovery-email" className="text-sm font-medium">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="recovery-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="가입한 이메일을 입력하세요"
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-medium" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>전송 중...</span>
                    </div>
                  ) : (
                    '재설정 링크 전송'
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setActiveTab('signin')}
                  className="text-primary hover:underline"
                >
                  로그인으로 돌아가기
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* 소셜 로그인 */}
          {showSocialLogin && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground font-medium">
                    또는 소셜 계정으로
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('discord')}
                disabled={loading}
                className="w-full h-12 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Discord로 로그인
              </Button>
            </>
          )}

          {/* 회원가입/로그인 전환 */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {activeTab === 'signin' ? (
                <>
                  아직 계정이 없으신가요?{' '}
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setActiveTab('signup')}
                    className="p-0 h-auto text-primary hover:underline font-medium"
                  >
                    회원가입하기
                  </Button>
                </>
              ) : activeTab === 'signup' ? (
                <>
                  이미 계정이 있으신가요?{' '}
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setActiveTab('signin')}
                    className="p-0 h-auto text-primary hover:underline font-medium"
                  >
                    로그인하기
                  </Button>
                </>
              ) : null}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
