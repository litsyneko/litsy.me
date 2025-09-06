import { NextResponse } from 'next/server'
import { supabaseServer as supabase } from '@/lib/supabase-server'
import { UserProfile } from '@/lib/supabase' // UserProfile 타입 가져오기

// 블로그 작성 권한이 있는 Discord 사용자 목록 (또는 users.role 활용)
const AUTHORIZED_DISCORD_USERS = [
  'litsy25',
  '616570697875193866'
]

// 권한 확인 헬퍼 함수 (재사용을 위해 여기에 정의)
async function checkBlogWritePermission(): Promise<{ hasPermission: boolean; user: UserProfile | null; error: string | null }> {
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  console.log("Server-side authUser from supabase.auth.getUser():", authUser);
  
  if (authError || !authUser) {
    console.log("Server-side auth failed or no user found.", authError);
    return { hasPermission: false, user: null, error: 'Unauthorized' }
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('id, email, username, display_name, avatar, role, created_at, updated_at')
    .eq('id', authUser.id)
    .single()

  if (profileError || !userProfile) {
    console.warn("User profile not found in public.users, falling back to auth.user data.", profileError);
    // public.users에 프로필이 없으면 auth.user 정보로 대체 (email은 필수이므로 authUser.email 사용)
    const fallbackUserProfile: UserProfile = {
      id: authUser.id,
      email: authUser.email || '',
      username: authUser.user_metadata?.username || null,
      display_name: authUser.user_metadata?.display_name || authUser.user_metadata?.full_name || null,
      avatar: authUser.user_metadata?.avatar_url || null,
      bio: null,
      website: null,
      location: null,
      role: 'user', // 기본 역할
      created_at: authUser.created_at,
      updated_at: authUser.updated_at || authUser.created_at
    };
    const hasPermissionFallback = fallbackUserProfile.role === 'admin' || 
                                AUTHORIZED_DISCORD_USERS.includes(fallbackUserProfile.username || '') ||
                                AUTHORIZED_DISCORD_USERS.includes(authUser.id);
    return { 
      hasPermission: hasPermissionFallback, 
      user: fallbackUserProfile, 
      error: hasPermissionFallback ? null : 'Forbidden: Blog write permission required' 
    };
  }

  const hasPermission = userProfile.role === 'admin' || 
                        AUTHORIZED_DISCORD_USERS.includes(userProfile.username || '') ||
                        AUTHORIZED_DISCORD_USERS.includes(authUser.id)
  
  return { 
    hasPermission,
    user: userProfile,
    error: hasPermission ? null : 'Forbidden: Blog write permission required'
  }
}


export async function GET() {
  try {
    const { hasPermission, user, error } = await checkBlogWritePermission()
    return NextResponse.json({ hasPermission, user, error })
  } catch (error) {
    console.error('API /api/auth/status error:', error)
    return NextResponse.json(
      { 
        hasPermission: false, 
        user: null, 
        error: 'Failed to check authentication status',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
