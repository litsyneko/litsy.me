import { supabase } from '@/lib/supabase'

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

// 프로필 정보 업데이트
export async function updateUserProfile(
  updates: ProfileUpdateData
): Promise<ProfileUpdateResult> {
  try {
    // 현재 사용자 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        message: '로그인이 필요합니다.'
      }
    }

    // 입력 데이터 검증
    const validationResult = validateProfileData(updates)
    if (!validationResult.isValid) {
      return {
        success: false,
        message: validationResult.message
      }
    }

    // username 중복 확인 (변경된 경우만)
    if (updates.username && updates.username !== user.user_metadata?.username) {
      const isAvailable = await checkUsernameAvailability(updates.username)
      if (!isAvailable) {
        return {
          success: false,
          message: '이미 사용 중인 username입니다.'
        }
      }
    }

    // Supabase Auth 사용자 메타데이터 업데이트
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        ...updates,
        updated_at: new Date().toISOString()
      }
    })

    if (authError) {
      console.error('Auth update error:', authError)
      return {
        success: false,
        message: '프로필 업데이트에 실패했습니다.'
      }
    }

    // public.users 테이블도 업데이트 (있는 경우)
    const { error: publicError } = await (supabase as any)
      .from('users')
      .upsert({
        id: user.id,
        username: updates.username,
        display_name: updates.nickname || updates.full_name,
        avatar: updates.avatar_url,
        metadata: {
          ...user.user_metadata,
          ...updates
        },
        last_synced: new Date().toISOString()
      })

    if (publicError) {
      console.warn('Public users table update failed:', publicError)
      // public.users 업데이트 실패는 치명적이지 않음
    }

    return {
      success: true,
      message: '프로필이 성공적으로 업데이트되었습니다.',
      data: updates
    }
  } catch (error) {
    console.error('Profile update error:', error)
    return {
      success: false,
      message: '프로필 업데이트 중 예상치 못한 오류가 발생했습니다.'
    }
  }
}

// 사용자 프로필 데이터 가져오기
export async function getUserProfileData(): Promise<UserProfileData | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    const isDiscordAccount = user.app_metadata?.provider === 'discord'

    return {
      id: user.id,
      email: user.email || '',
      nickname: user.user_metadata?.nickname || user.user_metadata?.name,
      username: user.user_metadata?.username,
      avatar_url: user.user_metadata?.avatar_url,
      full_name: user.user_metadata?.full_name,
      website: user.user_metadata?.website,
      bio: user.user_metadata?.bio,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      provider: user.app_metadata?.provider || 'email',
      is_discord_account: isDiscordAccount
    }
  } catch (error) {
    console.error('Error getting user profile data:', error)
    return null
  }
}

// username 사용 가능 여부 확인
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
    if (!username || username.length < 3) {
      return false
    }

    // 현재 사용자 확인
    const { data: { user } } = await supabase.auth.getUser()
    
    // public.users 테이블에서 중복 확인
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('id', user?.id || '')
      .limit(1)

    if (error) {
      console.error('Username availability check error:', error)
      return false
    }

    return data.length === 0
  } catch (error) {
    console.error('Username availability check error:', error)
    return false
  }
}

// 프로필 데이터 검증
function validateProfileData(data: ProfileUpdateData): { isValid: boolean; message: string } {
  // nickname 검증
  if (data.nickname !== undefined) {
    if (data.nickname.length > 50) {
      return { isValid: false, message: '닉네임은 50자를 초과할 수 없습니다.' }
    }
  }

  // username 검증
  if (data.username !== undefined) {
    if (data.username.length < 3 || data.username.length > 30) {
      return { isValid: false, message: 'username은 3-30자 사이여야 합니다.' }
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      return { isValid: false, message: 'username은 영문, 숫자, _, - 만 사용할 수 있습니다.' }
    }
  }

  // website URL 검증
  if (data.website !== undefined && data.website.length > 0) {
    try {
      new URL(data.website)
    } catch {
      return { isValid: false, message: '유효한 웹사이트 URL을 입력해주세요.' }
    }
  }

  // bio 검증
  if (data.bio !== undefined && data.bio.length > 500) {
    return { isValid: false, message: '자기소개는 500자를 초과할 수 없습니다.' }
  }

  return { isValid: true, message: '' }
}

// 사용자 표시 이름 가져오기
export function getUserDisplayName(user: any): string {
  if (user?.user_metadata?.nickname) return user.user_metadata.nickname
  if (user?.user_metadata?.full_name) return user.user_metadata.full_name
  if (user?.user_metadata?.username) return user.user_metadata.username
  if (user?.user_metadata?.name) return user.user_metadata.name
  return user?.email?.split('@')[0] || 'User'
}

// 사용자 아바타 URL 가져오기
export function getUserAvatarUrl(user: any): string | null {
  return user?.user_metadata?.avatar_url || null
}

// 사용자 이니셜 가져오기
export function getUserInitials(user: any): string {
  const displayName = getUserDisplayName(user)
  const email = user?.email || ''
  
  if (displayName && displayName !== 'User') {
    return displayName.charAt(0).toUpperCase()
  }
  
  return email.charAt(0).toUpperCase() || '?'
}

// 계정 타입 확인
export function getAccountType(user: any): 'discord' | 'email' {
  return user?.app_metadata?.provider === 'discord' ? 'discord' : 'email'
}

// 프로필 완성도 계산
export function calculateProfileCompleteness(user: any): {
  percentage: number
  missingFields: string[]
} {
  const fields = [
    { key: 'email', label: '이메일', value: user?.email },
    { key: 'nickname', label: '닉네임', value: user?.user_metadata?.nickname },
    { key: 'username', label: 'username', value: user?.user_metadata?.username },
    { key: 'avatar_url', label: '프로필 사진', value: user?.user_metadata?.avatar_url },
    { key: 'bio', label: '자기소개', value: user?.user_metadata?.bio }
  ]

  const completedFields = fields.filter(field => field.value && field.value.trim() !== '')
  const missingFields = fields.filter(field => !field.value || field.value.trim() === '').map(field => field.label)

  return {
    percentage: Math.round((completedFields.length / fields.length) * 100),
    missingFields
  }
}