import { NextResponse } from 'next/server'
import { BlogService } from '@/lib/services/blog'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase-server';
import sanitizeHtml from 'sanitize-html';

// 블로그 작성 권한이 있는 Discord 사용자 목록 (또는 users.role 활용)
const AUTHORIZED_DISCORD_USERS = [
  'litsy25',
  '616570697875193866'
]

// 권한 확인 헬퍼 함수
async function checkBlogWritePermission(): Promise<{ hasPermission: boolean; user: any | null; error: string | null }> { // Changed UserProfile to any for now
  const { userId } = await auth();
  
  if (!userId) {
    return { hasPermission: false, user: null, error: 'Unauthorized' }
  }

  const clerk = await clerkClient()
  const clerkUser = await clerk.users.getUser(userId);
  
  if (!clerkUser) {
    return { hasPermission: false, user: null, error: 'User profile not found' }
  }

  // Map Clerk user data to a simplified user object for consistency
  const user: any = { // Using any for now, can define a proper type later
    id: clerkUser.id,
    email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
    username: clerkUser.username || clerkUser.emailAddresses?.[0]?.emailAddress || null,
    display_name: clerkUser.firstName && clerkUser.lastName ? `${clerkUser.firstName} ${clerkUser.lastName}` : clerkUser.username || clerkUser.emailAddresses?.[0]?.emailAddress || null,
    avatar: clerkUser.imageUrl || null,
    role: (clerkUser.publicMetadata?.role as string) || 'user', // Assuming role is in publicMetadata
    created_at: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
    updated_at: clerkUser.updatedAt ? new Date(clerkUser.updatedAt).toISOString() : new Date().toISOString(),
    bio: (clerkUser.publicMetadata?.bio as string) || null,
    website: (clerkUser.publicMetadata?.website as string) || null,
    location: (clerkUser.publicMetadata?.location as string) || null,
  };

  const discordUsername = clerkUser.externalAccounts?.find(acc => acc.provider === 'discord')?.username;
  const hasPermission = user.role === 'admin' || 
                       (discordUsername && AUTHORIZED_DISCORD_USERS.includes(discordUsername));
  
  return { 
    hasPermission,
    user: user,
    error: hasPermission ? null : 'Forbidden: Blog write permission required'
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    const tag = searchParams.get('tag')
    const authorId = searchParams.get('authorId'); // authorId 추가


    const blogService = new BlogService(supabase)
    const postData = {
      title: title.trim(),
      summary: summary?.trim() || '',
      content: cleanContent.trim(),
      tags: Array.isArray(tags) ? tags.filter(tag => tag && tag.trim()) : [],
      cover: cover || '',
      author: user?.id || '',
      // author 필드는 DB에서 필요 없음, author_id로 대체
      user_id: user?.id || '' // user_id -> author_id (BlogService 내부에서 매핑)
    }

    const result = await blogService.createPost(postData)
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('POST /api/posts error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}