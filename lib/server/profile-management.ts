import { auth, clerkClient } from '@clerk/nextjs/server'

export interface ProfileUpdateData {
  nickname?: string
  username?: string
  avatar_url?: string
  full_name?: string
  website?: string
  bio?: string
}

export interface ProfileUpdateResult {
  success: boolean
  message: string
  data?: any
}

export interface UserProfileData {
  id: string
  email: string
  nickname?: string
  username?: string
  avatar_url?: string
  full_name?: string
  website?: string
  bio?: string
  created_at: string
  updated_at: string
  email_confirmed_at?: string
  last_sign_in_at?: string
  provider: string
  is_discord_account: boolean
}

export async function updateUserProfile(
  updates: ProfileUpdateData
): Promise<ProfileUpdateResult> {
  try {
  const session = await auth();
  const userId = (session as any)?.userId || (session as any)?.user?.id
    
    if (!userId) {
      return {
        success: false,
        message: '로그인이 필요합니다.'
      }
    }

    const validationResult = validateProfileData(updates)
    if (!validationResult.isValid) {
      return {
        success: false,
        message: validationResult.message
      }
    }

    if (updates.username) {
      const clerk = await clerkClient();
      const currentUser = await clerk.users.getUser(userId);
      if (updates.username !== currentUser.username) {
        const isAvailable = await checkUsernameAvailability(updates.username)
        if (!isAvailable) {
          return {
            success: false,
            message: '이미 사용 중인 username입니다.'
          }
        }
      }
    }

    const clerkUpdates: any = {};
    if (updates.username !== undefined) clerkUpdates.username = updates.username;
    if (updates.avatar_url !== undefined) clerkUpdates.imageUrl = updates.avatar_url;
    const publicMetadata: any = {};
    if (updates.nickname !== undefined) publicMetadata.nickname = updates.nickname;
    if (updates.full_name !== undefined) publicMetadata.full_name = updates.full_name;
    if (updates.website !== undefined) publicMetadata.website = updates.website;
    if (updates.bio !== undefined) publicMetadata.bio = updates.bio;

    if (Object.keys(publicMetadata).length > 0) {
      clerkUpdates.publicMetadata = publicMetadata;
    }

  const clerk = await clerkClient();
  await clerk.users.updateUser(userId, clerkUpdates);

    return {
      success: true,
      message: '프로필이 성공적으로 업데이트되었습니다.',
      data: updates
    }
  } catch (error) {
    console.error('Profile update error:', error)
    return {
      success: false,
      message: `프로필 업데이트 중 예상치 못한 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`
    }
  }
}

export async function getUserProfileData(): Promise<UserProfileData | null> {
  try {
  const session = await auth();
  const userId = (session as any)?.userId || (session as any)?.user?.id

  if (!userId) {
      return null
    }

  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(userId);

    if (!clerkUser) {
      return null
    }

    const isDiscordAccount = (clerkUser.publicMetadata?.provider as string) === 'discord';

    return {
      id: clerkUser.id,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
  nickname: (clerkUser.publicMetadata?.nickname as string) ?? (clerkUser.publicMetadata?.name as string) ?? undefined,
  username: clerkUser.username ?? undefined,
  avatar_url: clerkUser.imageUrl ?? undefined,
  full_name: (clerkUser.publicMetadata?.full_name as string) ?? undefined,
  website: (clerkUser.publicMetadata?.website as string) ?? undefined,
  bio: (clerkUser.publicMetadata?.bio as string) ?? undefined,
      created_at: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
      updated_at: clerkUser.updatedAt ? new Date(clerkUser.updatedAt).toISOString() : new Date().toISOString(),
  email_confirmed_at: clerkUser.emailAddresses?.[0]?.verification?.status === 'verified' ? new Date().toISOString() : undefined,
  last_sign_in_at: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt).toISOString() : undefined,
      provider: (clerkUser.publicMetadata?.provider as string) || 'email',
      is_discord_account: isDiscordAccount
    }
  } catch (error) {
    console.error('Error getting user profile data:', error)
    return null
  }
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
    if (!username || username.length < 3) {
      return false
    }

  const session = await auth();
  const userId = (session as any)?.userId || (session as any)?.user?.id

  const clerk = await clerkClient();
  const usersWithUsername = await clerk.users.getUserList({ username: username } as any);

    if (usersWithUsername.totalCount === 0) {
      return true;
    } else {
      return usersWithUsername.data.some(user => user.id === userId);
    }
  } catch (error) {
    console.error('Username availability check error:', error)
    return false
  }
}

export function validateProfileData(data: ProfileUpdateData): { isValid: boolean; message: string } {
  if (data.nickname !== undefined) {
    if (data.nickname.length > 50) {
      return { isValid: false, message: '닉네임은 50자를 초과할 수 없습니다.' }
    }
  }

  if (data.username !== undefined) {
    if (data.username.length < 3 || data.username.length > 30) {
      return { isValid: false, message: 'username은 3-30자 사이여야 합니다.' }
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      return { isValid: false, message: 'username은 영문, 숫자, _, - 만 사용할 수 있습니다.' }
    }
  }

  if (data.website !== undefined && data.website.length > 0) {
    try {
      new URL(data.website)
    } catch {
      return { isValid: false, message: '유효한 웹사이트 URL을 입력해주세요.' }
    }
  }

  if (data.bio !== undefined && data.bio.length > 500) {
    return { isValid: false, message: '자기소개는 500자를 초과할 수 없습니다.' }
  }

  return { isValid: true, message: '' }
}

export function getUserDisplayName(user: any): string {
  if (user?.publicMetadata?.nickname) return user.publicMetadata.nickname;
  if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
  if (user?.username) return user.username;
  if (user?.emailAddresses?.[0]?.emailAddress) return user.emailAddresses[0].emailAddress.split('@')[0];
  return 'User';
}

export function getUserAvatarUrl(user: any): string | null {
  return user?.imageUrl || null;
}

export function getUserInitials(user: any): string {
  if (user?.firstName) {
    return user.firstName.charAt(0).toUpperCase();
  }
  if (user?.emailAddresses?.[0]?.emailAddress) {
    return user.emailAddresses[0].emailAddress.charAt(0).toUpperCase();
  }
  return '?';
}

export function getAccountType(user: any): 'oauth' | 'email' {
  if (user?.publicMetadata?.provider === 'discord') return 'oauth';
  if (user?.externalAccounts && user.externalAccounts.length > 0) return 'oauth';
  if (user?.emailAddresses && user.emailAddresses.length > 0) return 'email';
  return 'email';
}

export function calculateProfileCompleteness(user: any): {
  percentage: number
  missingFields: string[]
} {
  const fields = [
    { key: 'email', label: '이메일', value: user?.emailAddresses?.[0]?.emailAddress },
    { key: 'nickname', label: '닉네임', value: user?.publicMetadata?.nickname },
    { key: 'username', label: 'username', value: user?.username },
    { key: 'avatar_url', label: '프로필 사진', value: user?.imageUrl },
    { key: 'bio', label: '자기소개', value: user?.publicMetadata?.bio }
  ]

  const completedFields = fields.filter(field => field.value && String(field.value).trim() !== '')
  const missingFields = fields.filter(field => !field.value || String(field.value).trim() === '').map(field => field.label)

  return {
    percentage: Math.round((completedFields.length / fields.length) * 100),
    missingFields
  }
}
