import { auth, clerkClient } from '@clerk/nextjs/server'

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
  try {
    const { userId } = auth();
    
    if (!userId) {
      return null
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    if (!clerkUser) {
      return null
    }

    // Assuming Discord metadata is stored in publicMetadata or privateMetadata
    const discordUsername = clerkUser.username || clerkUser.publicMetadata?.discord_username || null;
    const discordId = clerkUser.publicMetadata?.discord_id || null; // Assuming discord_id is stored

    // 권한 확인
    const canWriteBlog = AUTHORIZED_DISCORD_USERS.includes(discordUsername) || 
                        AUTHORIZED_DISCORD_USERS.includes(clerkUser.id) // Use Clerk's user ID

    return {
      id: clerkUser.id,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || undefined,
      discord_username: discordUsername || undefined,
      discord_id: discordId || undefined,
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