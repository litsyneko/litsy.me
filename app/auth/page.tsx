import AuthForm from '@/components/auth-form'

export const metadata = {
  title: '로그인 / 회원가입 | 릿시',
  description: ' 계정 로그인 및 회원가입 페이지 — 이메일, OAuth 로그인을 지원합니다.',
  keywords: ['로그인', '회원가입', 'Litsy', '계정']
}

// 페이지 기능: 계정 로그인 및 회원가입, 소셜 로그인(Discord) 지원

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/50 p-4 pt-20">
      <div className="w-full max-w-2xl">
        <AuthForm 
          initialMode="signin"
          redirectTo="/"
          showSocialLogin={true}
          className="mx-auto"
        />
      </div>
    </div>
  )
}
