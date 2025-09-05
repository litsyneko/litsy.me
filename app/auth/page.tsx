import AuthForm from '@/components/auth-form'

export const metadata = {
  title: '로그인 / 회원가입',
}

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
