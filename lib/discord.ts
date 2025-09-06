export type DiscordUserLike = {
  id?: string
  username?: string | null
  discriminator?: string | null
  avatar?: string | null
  global_name?: string | null
}

export function getDiscordDisplayName(user: DiscordUserLike | Record<string, any>) {
  const u = user as DiscordUserLike & Record<string, any>
  // priority: global_name > username (strip discriminator)
  const global = u.global_name || u.display_name || null
  let username = u.username || null
  if (username && username.includes('#')) username = username.split('#')[0]
  if (global) return username ? `${global} (@${username})` : global
  return username || null
}

// Return username without discriminator (e.g. 'litsy25#0123' -> 'litsy25')
export function getDiscordUsername(user: DiscordUserLike | Record<string, any> | string | null) {
  if (!user) return null
  if (typeof user === 'string') {
    return user.includes('#') ? user.split('#')[0] : user
  }
  const u = user as DiscordUserLike & Record<string, any>
  let username = u.username || u.preferred_username || u.handle || null
  if (!username && u.user_metadata) username = u.user_metadata.username || u.user_metadata.preferred_username || null
  if (username && typeof username === 'string' && username.includes('#')) return username.split('#')[0]
  return username || null
}

export function getDiscordAvatarUrl(user: DiscordUserLike | Record<string, any>, format = 'png') {
  const u = user as DiscordUserLike & Record<string, any>
  if (u.avatar) {
    const isAnimated = u.avatar.startsWith('a_')
    const ext = isAnimated ? 'gif' : format
    return `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}`
  }
  // fallback to default avatar index
  // discriminator may be null for newer accounts; fallback to id % 5
  const idx = u.discriminator ? (parseInt(u.discriminator) % 5) : (u.id ? (parseInt(u.id) % 5) : 0)
  return `https://cdn.discordapp.com/embed/avatars/${idx}.png`
}

// Discord OAuth 에러 처리 관련 타입 및 함수들
export interface DiscordOAuthError {
  error: string
  error_description?: string
  state?: string
}

export function handleDiscordOAuthError(error: DiscordOAuthError): string {
  switch (error.error) {
    case 'access_denied':
      return 'Discord 로그인이 취소되었습니다.'
    case 'invalid_request':
      return 'Discord 로그인 요청이 올바르지 않습니다.'
    case 'invalid_client':
      return 'Discord 앱 설정에 문제가 있습니다.'
    case 'invalid_grant':
      return 'Discord 인증 코드가 만료되었습니다. 다시 시도해주세요.'
    case 'unsupported_response_type':
      return 'Discord 로그인 방식이 지원되지 않습니다.'
    case 'invalid_scope':
      return 'Discord 권한 요청에 문제가 있습니다.'
    case 'server_error':
      return 'Discord 서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.'
    case 'temporarily_unavailable':
      return 'Discord 서비스가 일시적으로 사용할 수 없습니다.'
    default:
      return error.error_description || 'Discord 로그인 중 알 수 없는 오류가 발생했습니다.'
  }
}

// Discord OAuth 에러 로깅 함수
export async function logDiscordOAuthError(
  error: DiscordOAuthError,
  userId?: string
): Promise<void> {
  try {
    const { supabase } = await import('@/lib/supabase')
    
    await (supabase as any).rpc('log_oauth_error', {
      p_user_id: userId || null,
      p_provider: 'discord',
      p_error_code: error.error,
      p_error_description: error.error_description || null,
      p_error_details: {
        state: error.state,
        timestamp: new Date().toISOString(),
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
        url: typeof window !== 'undefined' ? window.location.href : null
      }
    })
  } catch (logError) {
    console.error('Failed to log Discord OAuth error:', logError)
  }
}

// Discord 사용자 정보 동기화 함수
export async function syncDiscordUserInfo(userId: string): Promise<boolean> {
  try {
    const { supabase } = await import('@/lib/supabase')
    
    // 현재 사용자 정보 가져오기
    const { data: authUser, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser.user) {
      console.error('Failed to get auth user:', authError)
      return false
    }
    
    // Discord 사용자인지 확인
    if (authUser.user.app_metadata?.provider !== 'discord') {
      return false
    }
    
    const userData = authUser.user.user_metadata
    
    // 사용자 정보 동기화
    const { error: syncError } = await (supabase as any)
      .from('users')
      .upsert({
        id: authUser.user.id,
        provider: 'discord',
        username: getDiscordUsername(userData),
        display_name: getDiscordDisplayName(userData),
        avatar: getDiscordAvatarUrl(userData),
        metadata: {
          discord_id: userData?.provider_id,
          discriminator: userData?.name,
          global_name: userData?.custom_claims?.global_name,
          email_verified: userData?.email_verified,
          full_name: userData?.full_name
        },
        last_synced: new Date().toISOString()
      })
    
    if (syncError) {
      console.error('Failed to sync Discord user info:', syncError)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error syncing Discord user info:', error)
    return false
  }
}
