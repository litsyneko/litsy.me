import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { validateProfileData, checkUsernameAvailability } from '@/lib/server/profile-management'

// GET request to fetch user profile data
export async function GET() {
  try {
  const session = await auth();
  const userId = (session as any)?.userId || (session as any)?.user?.id

  if (!userId) {
      return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 })
    }

  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(userId);

    if (!clerkUser) {
      return NextResponse.json({ message: '사용자 정보를 찾을 수 없습니다.' }, { status: 404 })
    }

    // Map Clerk user data to UserProfileData (similar to getUserProfileData in profile-management.ts)
    const isDiscordAccount = (clerkUser.publicMetadata?.provider as string) === 'discord';

    const userProfileData = {
      id: clerkUser.id,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
      nickname: (clerkUser.publicMetadata?.nickname as string) || (clerkUser.publicMetadata?.name as string) || null,
      username: clerkUser.username || null,
      avatar_url: clerkUser.imageUrl || null,
      full_name: (clerkUser.publicMetadata?.full_name as string) || null,
      website: (clerkUser.publicMetadata?.website as string) || null,
      bio: (clerkUser.publicMetadata?.bio as string) || null,
      created_at: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
      updated_at: clerkUser.updatedAt ? new Date(clerkUser.updatedAt).toISOString() : new Date().toISOString(),
      email_confirmed_at: clerkUser.emailAddresses?.[0]?.verification?.status === 'verified' ? new Date().toISOString() : null,
      last_sign_in_at: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt).toISOString() : null,
      provider: (clerkUser.publicMetadata?.provider as string) || 'email',
      is_discord_account: isDiscordAccount
    }

    return NextResponse.json(userProfileData)
  } catch (error) {
    console.error('GET /api/profile error:', error)
    return NextResponse.json({ 
      message: '프로필 정보를 가져오는 중 예상치 못한 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// PUT request to update user profile data
export async function PUT(request: Request) {
  try {
  const session = await auth();
  const userId = (session as any)?.userId || (session as any)?.user?.id
    
  if (!userId) {
      return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 })
    }

    const updates = await request.json();

    // 입력 데이터 검증
    const validationResult = validateProfileData(updates)
    if (!validationResult.isValid) {
      return NextResponse.json({ 
        message: validationResult.message
      }, { status: 400 })
    }

    // username 중복 확인 (변경된 경우만)
    if (updates.username) {
      const clerk = await clerkClient();
      const currentUser = await clerk.users.getUser(userId);
      if (updates.username !== currentUser.username) {
        const isAvailable = await checkUsernameAvailability(updates.username)
        if (!isAvailable) {
          return NextResponse.json({ 
            message: '이미 사용 중인 username입니다.'
          }, { status: 400 })
        }
      }
    }

    // Prepare data for Clerk's updateUser
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

    // Update user in Clerk
  const clerk = await clerkClient();
  await clerk.users.updateUser(userId, clerkUpdates);

    return NextResponse.json({ 
      message: '프로필이 성공적으로 업데이트되었습니다.',
      data: updates
    })
  } catch (error) {
    console.error('PUT /api/profile error:', error)
    return NextResponse.json({ 
      message: '프로필 업데이트 중 예상치 못한 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
