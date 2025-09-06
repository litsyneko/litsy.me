"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ImageUpload from "@/components/image-upload"
import PasswordChangeWithVerification from "@/components/auth/PasswordChangeWithVerification"
import AccountDeletion from "@/components/auth/AccountDeletion"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  CheckCircle, 
  XCircle,
  Camera,
  Save
} from "lucide-react"
import { motion } from "framer-motion"
import { 
  updateUserProfile, 
  getUserProfileData, 
  calculateProfileCompleteness,
  checkUsernameAvailability 
} from "@/lib/utils/profile-management"

 // metadata removed due to "use client" directive conflict

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth()
  const router = useRouter()
  const [nickname, setNickname] = useState(user?.user_metadata?.nickname || user?.user_metadata?.name || "")
  const [username, setUsername] = useState(user?.user_metadata?.username || "")
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || "")
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [profileCompleteness, setProfileCompleteness] = useState({ percentage: 0, missingFields: [] as string[] })

  // 사용자 정보가 변경될 때 state 업데이트
  useEffect(() => {
    if (user) {
      setNickname(user.user_metadata?.nickname || user.user_metadata?.name || "")
      setUsername(user.user_metadata?.username || "")
      setAvatarUrl(user.user_metadata?.avatar_url || "")
      
      // 프로필 완성도 계산
      const completeness = calculateProfileCompleteness(user)
      setProfileCompleteness(completeness)
    }
  }, [user])

  // 로그인하지 않은 사용자 리다이렉트
  if (!loading && !user) {
    router.push('/auth')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const getUserInitials = (email: string) => {
  // 닉네임 또는 이메일에서 이니셜을 만든다
  const name = nickname || email
  return name?.charAt(0)?.toUpperCase() || '?'
  }

  const getUserDisplayName = (user: any) => {
  // 닉네임 우선, 없으면 username, 없으면 이메일 프리픽스
  if (user.user_metadata?.nickname) return user.user_metadata.nickname
  if (user.user_metadata?.username) return user.user_metadata.username
  if (user.user_metadata?.name) return user.user_metadata.name
  return user.email?.split('@')[0] || 'User'
  }

  const getAccountType = (user: any) => {
    // Discord OAuth로 로그인한 경우
    if (user.app_metadata?.provider === 'discord' || user.user_metadata?.provider === 'discord') {
      return 'discord'
    }
    // 이메일/매직링크로 로그인한 경우
    return 'email'
  }

  const isDiscordAccount = getAccountType(user) === 'discord'

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setMessage(null)

    try {
      const result = await updateUserProfile({
        nickname: nickname.trim() || undefined,
        username: username.trim() || undefined,
        avatar_url: avatarUrl || undefined
      })

      if (result.success) {
        // refresh local auth state
        await refreshUser()
        setMessage({ type: 'success', text: result.message })
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (err) {
      setMessage({ type: 'error', text: '프로필 업데이트 중 오류가 발생했습니다.' })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 pt-20 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">프로필</h1>
            <p className="text-muted-foreground">계정 정보를 관리하세요</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">프로필 정보</TabsTrigger>
              <TabsTrigger value="security">보안</TabsTrigger>
            </TabsList>

            {/* 프로필 정보 탭 */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage 
                          src={avatarUrl || user?.user_metadata?.avatar_url} 
                          alt={getUserDisplayName(user)}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                          {getUserInitials(user?.email || '')}
                        </AvatarFallback>
                      </Avatar>
                      <ImageUpload 
                        currentImageUrl={avatarUrl || user?.user_metadata?.avatar_url}
                        onImageUpdate={setAvatarUrl}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{getUserDisplayName(user)}</CardTitle>
                      <CardDescription className="text-base">{user?.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {message && (
                    <Alert className={`${message.type === 'error' ? 'border-red-500' : 'border-green-500'} !flex !items-center !gap-3 !grid-cols-none`}>
                      {message.type === 'error' ? 
                        <XCircle className="h-4 w-4 text-red-500 shrink-0" /> : 
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      }
                      <AlertDescription className="!col-start-auto !text-foreground">
                        {message.text}
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    {/* 계정 타입 표시 */}
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <Label className="text-sm font-medium">계정 타입</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isDiscordAccount ? (
                          <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                            </svg>
                            <span className="text-sm font-medium text-primary">Discord 계정</span>
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">이메일 계정</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nickname">닉네임</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="nickname"
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="닉네임을 입력하세요"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="username">username</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="username을 입력하세요 (예: litsy25)"
                            className="pl-10"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {isDiscordAccount 
                            ? "Discord로 로그인한 계정은 username 변경 제한이 있을 수 있습니다." 
                            : "username은 공개 식별자입니다."
                          }
                        </p>
                      </div>
                    </div>

                    <Button type="submit" disabled={updating} className="w-full md:w-auto">
                      {updating ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>업데이트 중...</span>
                        </div>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          프로필 저장
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* 계정 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>계정 정보</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">가입일</Label>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(user?.created_at || '')}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">마지막 로그인</Label>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate((user as any)?.last_sign_in_at || user?.created_at || '')}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">이메일 인증 상태</Label>
                    <div className="flex items-center space-x-2">
                      {user?.email_confirmed_at ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">인증 완료</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600">인증 필요</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 보안 탭 */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>비밀번호 변경</CardTitle>
                  <CardDescription>
                    보안을 위해 정기적으로 비밀번호를 변경하세요. 이메일 인증이 필요합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isDiscordAccount ? (
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <p className="text-sm text-muted-foreground">
                        Discord 계정은 Discord에서 비밀번호를 관리합니다.
                      </p>
                    </div>
                  ) : (
                    <PasswordChangeWithVerification />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">위험 구역</CardTitle>
                  <CardDescription>
                    이 작업들은 되돌릴 수 없습니다. 신중하게 진행하세요.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                      계정 삭제
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                      계정과 모든 데이터가 영구적으로 삭제됩니다.
                    </p>
                    <AccountDeletion />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
