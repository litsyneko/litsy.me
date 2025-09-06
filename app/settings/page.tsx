"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  Mail, 
  Shield,
  Palette,
  Globe,
  Volume2,
  VolumeX
} from "lucide-react"
import { motion } from "framer-motion"

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  
  // 설정 상태들
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [language, setLanguage] = useState("ko")

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

  const themeOptions = [
    { value: "light", label: "라이트", icon: Sun },
    { value: "dark", label: "다크", icon: Moon },
    { value: "system", label: "시스템", icon: Monitor }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 pt-20 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
              <Settings className="h-8 w-8" />
              <span>설정</span>
            </h1>
            <p className="text-muted-foreground">애플리케이션 설정을 관리하세요</p>
          </div>

          <div className="space-y-6">
            {/* 테마 설정 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>테마</span>
                </CardTitle>
                <CardDescription>
                  애플리케이션의 외관을 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {themeOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={`p-4 border rounded-lg transition-all hover:bg-muted/50 ${
                          theme === option.value 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <Icon className="h-6 w-6" />
                          <span className="text-sm font-medium">{option.label}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 알림 설정 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>알림</span>
                </CardTitle>
                <CardDescription>
                  알림 수신 방법을 설정하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>이메일 알림</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      중요한 업데이트를 이메일로 받습니다
                    </p>
                  </div>
                  <Switch 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center space-x-2">
                      <Bell className="h-4 w-4" />
                      <span>푸시 알림</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      브라우저 알림을 받습니다
                    </p>
                  </div>
                  <Switch 
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center space-x-2">
                      {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      <span>알림 소리</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      알림 시 소리를 재생합니다
                    </p>
                  </div>
                  <Switch 
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 언어 설정 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>언어</span>
                </CardTitle>
                <CardDescription>
                  애플리케이션 언어를 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="language">언어 선택</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="언어를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 보안 설정 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>보안</span>
                </CardTitle>
                <CardDescription>
                  계정 보안을 관리하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/profile')}
                  className="w-full md:w-auto"
                >
                  프로필 관리
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/auth/reset-password')}
                  className="w-full md:w-auto"
                >
                  비밀번호 변경
                </Button>
              </CardContent>
            </Card>

            {/* 앱 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>앱 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">버전</Label>
                    <p className="text-muted-foreground">v1.0.0</p>
                  </div>
                  <div>
                    <Label className="font-medium">마지막 업데이트</Label>
                    <p className="text-muted-foreground">2024년 1월</p>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-wrap gap-2">
                  <Button variant="link" size="sm" className="h-auto p-0">
                    개인정보처리방침
                  </Button>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    서비스 약관
                  </Button>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    도움말
                  </Button>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    문의하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export const metadata = {
  title: '설정 | 릿시 포트폴리오',
  description: '애플리케이션 설정 페이지 — 테마, 알림, 언어 등 개인화 가능한 설정을 제공합니다.',
  keywords: ['Litsy', '설정', '환경설정', 'preferences'],
  robots: 'noindex'
}
