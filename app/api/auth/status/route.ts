import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'


// 블로그 작성 권한이 있는 Discord 사용자 목록 (또는 users.role 활용)
const AUTHORIZED_DISCORD_USERS = [
  'litsy25',
  '616570697875193866'
]

// 권한 확인 헬퍼 함수 (재사용을 위해 여기에 정의)
async function checkBlogWritePermission(): Promise<{ hasPermission: boolean; user: UserProfile | null; error: string | null }> {
  const { userId } = auth();
  console.log("Server-side authUser from Clerk:", userId);
  
  if (!userId) {
    console.log("Server-side auth failed or no user found.");
    return { hasPermission: false, user: null, error: 'Unauthorized' }
  }

  const authUser = await clerkClient.users.getUser(userId);

  const userProfile: UserProfile = {
    id: authUser.id,
    email: authUser.emailAddresses?.[0]?.emailAddress || '',
    username: authUser.username || authUser.emailAddresses?.[0]?.emailAddress || null,
    display_name: authUser.firstName && authUser.lastName ? `${authUser.firstName} ${authUser.lastName}` : authUser.username || authUser.emailAddresses?.[0]?.emailAddress || null,
    avatar: authUser.imageUrl || null,
    role: (authUser.publicMetadata?.role as string) || 'user', // Assuming role is in publicMetadata
    created_at: authUser.createdAt ? new Date(authUser.createdAt).toISOString() : new Date().toISOString(),
    updated_at: authUser.updatedAt ? new Date(authUser.updatedAt).toISOString() : new Date().toISOString(),
    bio: (authUser.publicMetadata?.bio as string) || null,
    website: (authUser.publicMetadata?.website as string) || null,
    location: (authUser.publicMetadata?.location as string) || null,
  };

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
