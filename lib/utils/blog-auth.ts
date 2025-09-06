import { createSupabaseClient } from '@/lib/supabase'

// 블로그 작성 권한이 있는 Discord 사용자 목록
const AUTHORIZED_DISCORD_USERS = [
  'litsy25',
  '616570697875193866'
]

export interface BlogAuthUser {
  id: string
  email?: string
  discord_username?: string
  discord_id?: string
  can_write_blog: boolean
}

/**
 * 현재 사용자의 블로그 작성 권한을 확인합니다.
 */
export async function checkBlogWritePermission(): Promise<BlogAuthUser | null> {
  const supabase = createSupabaseClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Discord 메타데이터에서 사용자명과 ID 확인
    const discordUsername = user.user_metadata?.preferred_username || user.user_metadata?.username
    const discordId = user.user_metadata?.provider_id || user.user_metadata?.sub

    // 권한 확인
    const canWriteBlog = AUTHORIZED_DISCORD_USERS.includes(discordUsername) || 
                        AUTHORIZED_DISCORD_USERS.includes(discordId)

    return {
      id: user.id,
      email: user.email,
      discord_username: discordUsername,
      discord_id: discordId,
      can_write_blog: canWriteBlog
    }
  } catch (error) {
    console.error('Error checking blog write permission:', error)
    return null
  }
}

/**
 * 사용자가 블로그 작성 권한이 있는지 확인합니다.
 */
export function hasWritePermission(user: BlogAuthUser | null): boolean {
  return user?.can_write_blog === true
}