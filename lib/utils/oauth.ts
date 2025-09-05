import { supabase } from '../supabase'
import { getOAuthRedirectUrl } from './auth'
import type { OAuthProvider, AuthResponse } from '../types/auth'

/**
 * OAuth 로그인 설정
 */
export const OAUTH_PROVIDERS = {
  discord: {
    name: 'Discord',
    icon: '🎮',
    color: '#5865F2'
  }
} as const

/**
 * Discord OAuth 로그인
 */
export async function signInWithDiscord(): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: getOAuthRedirectUrl(),
        scopes: 'identify email'
      }
    })

    if (error) {
      console.error('Discord OAuth error:', error)
      return {
        success: false,
        error: 'Discord 로그인 중 오류가 발생했습니다.'
      }
    }

    return {
      success: true,
      message: 'Discord 로그인을 진행합니다...'
    }
  } catch (error) {
    console.error('Discord OAuth error:', error)
    return {
      success: false,
      error: 'Discord 로그인 중 오류가 발생했습니다.'
    }
  }
}

/**
 * OAuth 프로바이더별 로그인 함수
 */
export async function signInWithOAuth(provider: OAuthProvider): Promise<AuthResponse> {
  switch (provider) {
    case 'discord':
      return signInWithDiscord()
    default:
      return {
        success: false,
        error: '지원하지 않는 로그인 방식입니다.'
      }
  }
}

/**
 * OAuth 콜백 처리
 */
export async function handleOAuthCallback(): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('OAuth callback error:', error)
      return {
        success: false,
        error: '로그인 처리 중 오류가 발생했습니다.'
      }
    }

    if (!data.session) {
      return {
        success: false,
        error: '로그인 세션을 찾을 수 없습니다.'
      }
    }

    return {
      success: true,
      message: '로그인이 완료되었습니다.'
    }
  } catch (error) {
    console.error('OAuth callback error:', error)
    return {
      success: false,
      error: '로그인 처리 중 오류가 발생했습니다.'
    }
  }
}

/**
 * OAuth 사용자 정보 동기화
 */
export async function syncOAuthUserData(userId: string, provider: string, userData: any): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        provider,
        username: userData.user_name || userData.username,
        display_name: userData.full_name || userData.global_name || userData.display_name,
        avatar: userData.avatar_url,
        email: userData.email,
        email_verified: true, // OAuth 로그인은 이메일이 검증된 것으로 간주
        metadata: userData,
        last_synced: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Failed to sync OAuth user data:', error)
    }
  } catch (error) {
    console.error('Failed to sync OAuth user data:', error)
  }
}

/**
 * Discord 사용자 정보 파싱
 */
export function parseDiscordUserData(user: any) {
  return {
    user_name: user.user_metadata?.user_name,
    username: user.user_metadata?.preferred_username,
    full_name: user.user_metadata?.full_name,
    global_name: user.user_metadata?.global_name,
    display_name: user.user_metadata?.name,
    avatar_url: user.user_metadata?.avatar_url,
    email: user.email
  }
}