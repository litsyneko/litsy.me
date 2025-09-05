'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase, getUserDisplayName, getUserAvatar, isEmailVerified, UserProfile, getCurrentUserProfile } from '@/lib/supabase'
import { AuthUser } from '@/lib/supabase'
import { AuthContextType, AuthResponse } from '@/lib/types/auth'
import { getAuthErrorMessage } from '@/lib/utils/auth'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // 세션 상태 업데이트 - 단순화
  const updateAuthState = async (session: Session | null) => {
    setSession(session)
    setUser(session?.user as AuthUser || null)
    setLoading(false)
  }

  // 회원가입
  const signUp = async (email: string, password: string, metadata: { username: string; display_name: string }): Promise<AuthResponse> => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: metadata.username,
            display_name: metadata.display_name
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      })

      if (error) {
        return {
          success: false,
          error: getAuthErrorMessage(error)
        }
      }

      if (data.user && !data.session) {
        return {
          success: true,
          message: '회원가입이 완료되었습니다. 이메일을 확인하여 계정을 활성화해주세요.'
        }
      }

      return {
        success: true,
        message: '회원가입이 완료되었습니다.'
      }
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error as Error)
      }
    } finally {
      setLoading(false)
    }
  }

  // 로그인
  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return {
          success: false,
          error: getAuthErrorMessage(error)
        }
      }

      return {
        success: true,
        message: '로그인이 완료되었습니다.'
      }
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error as Error)
      }
    } finally {
      setLoading(false)
    }
  }

  // OAuth 로그인
  const signInWithOAuth = async (provider: 'discord', redirectTo?: string): Promise<AuthResponse> => {
    try {
      // 현재 경로를 저장하여 로그인 후 돌아올 수 있도록 함
      const currentPath = redirectTo || window.location.pathname
      const callbackUrl = new URL('/auth/callback', window.location.origin)
      callbackUrl.searchParams.set('return_to', currentPath)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl.toString(),
          // Discord OAuth 최적화 설정
          scopes: 'identify email',
          queryParams: {
            // 이미 로그인된 경우 자동 승인
            prompt: 'none'
          }
        }
      })

      if (error) {
        console.error(`${provider} OAuth error:`, error)
        
        // Discord 특화 에러 처리
        if (provider === 'discord') {
          const { handleDiscordOAuthError, logDiscordOAuthError } = await import('@/lib/discord')
          
          // 에러 로깅
          await logDiscordOAuthError({
            error: error.message,
            error_description: error.message
          })
          
          return {
            success: false,
            error: handleDiscordOAuthError({ error: error.message })
          }
        }
        
        return {
          success: false,
          error: getAuthErrorMessage(error)
        }
      }

      // OAuth 리디렉션이 성공적으로 시작됨
      return {
        success: true,
        message: `${provider} 로그인을 진행합니다...`
      }
    } catch (error) {
      console.error(`${provider} OAuth unexpected error:`, error)
      
      // Discord 에러 로깅
      if (provider === 'discord') {
        try {
          const { logDiscordOAuthError } = await import('@/lib/discord')
          await logDiscordOAuthError({
            error: 'unexpected_error',
            error_description: error instanceof Error ? error.message : 'Unknown error'
          })
        } catch (logError) {
          console.error('Failed to log Discord OAuth error:', logError)
        }
      }
      
      return {
        success: false,
        error: `${provider} 로그인 중 예상치 못한 오류가 발생했습니다.`
      }
    }
  }

  // 로그아웃
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
      }
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 비밀번호 재설정
  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        return {
          success: false,
          error: getAuthErrorMessage(error)
        }
      }

      return {
        success: true,
        message: '비밀번호 재설정 링크를 이메일로 발송했습니다.'
      }
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error as Error)
      }
    }
  }

  // 이메일 재발송
  const resendConfirmation = async (email: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      })

      if (error) {
        return {
          success: false,
          error: getAuthErrorMessage(error)
        }
      }

      return {
        success: true,
        message: '확인 이메일을 재발송했습니다.'
      }
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error as Error)
      }
    }
  }

  // 유틸리티 함수들
  const getUserDisplayNameFromContext = (): string => {
    return getUserDisplayName(user)
  }

  const getUserAvatarFromContext = (): string | null => {
    return getUserAvatar(user)
  }

  const isEmailVerifiedFromContext = (): boolean => {
    return isEmailVerified(user)
  }

  const refreshSession = async (): Promise<void> => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Session refresh error:', error)
      } else {
        await updateAuthState(session)
      }
    } catch (error) {
      console.error('Unexpected session refresh error:', error)
    }
  }

  const refreshUser = async (): Promise<void> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('User refresh error:', error)
      } else {
        setUser(user as AuthUser)
      }
    } catch (error) {
      console.error('Unexpected user refresh error:', error)
    }
  }

  // 초기 세션 확인 및 인증 상태 변경 리스너 설정
  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session)
    })

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        await updateAuthState(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    resendConfirmation,
    getUserDisplayName: getUserDisplayNameFromContext,
    getUserAvatar: getUserAvatarFromContext,
    isEmailVerified: isEmailVerifiedFromContext,
    refreshSession,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}