import { NextResponse } from 'next/server'
import { BlogService } from '@/lib/services/blog'
import { auth, clerkClient } from '@clerk/nextjs/server'

// 블로그 작성 권한이 있는 Discord 사용자 목록 (또는 users.role 활용)
const AUTHORIZED_DISCORD_USERS = [
  'litsy25',
  '616570697875193866'
]

// 권한 확인 헬퍼 함수
async function checkBlogWritePermission(): Promise<{ hasPermission: boolean; user: any | null; error: string | null }> { // Changed UserProfile to any for now
  const { userId } = auth();
  
  if (!userId) {
    return { hasPermission: false, user: null, error: 'Unauthorized' }
  }

  const clerkUser = await clerkClient.users.getUser(userId);
  
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

  const hasPermission = user.role === 'admin' || 
                        AUTHORIZED_DISCORD_USERS.includes(user.username || '') ||
                        AUTHORIZED_DISCORD_USERS.includes(user.id) // Use user.id from Clerk
  
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
    const authorId = searchParams.get('authorId') // authorId 추가

    const supabase = createSupabaseServerClient()
    const blogService = new BlogService(supabase)
    
    const options: any = {}
    if (published === 'true') {
      options.published = true
    }
    if (limit) {
      options.limit = parseInt(limit)
    }
    if (offset) {
      options.offset = parseInt(offset)
    }
    if (authorId) { // authorId 추가
      options.authorId = authorId
    }

    let posts
    if (tag) {
      posts = await blogService.getPostsByTag(tag)
    } else {
      posts = await blogService.getPosts(options)
    }

    return NextResponse.json(posts)
  } catch (error) {
    console.error('GET /api/posts error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch posts',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // 권한 확인
    const { hasPermission, user, error: authError } = await checkBlogWritePermission()
    
    if (!hasPermission) {
      return NextResponse.json({ 
        error: authError,
        user: user ? { id: user.id, username: user.username, display_name: user.display_name, role: user.role } : null
      }, { status: authError === 'Unauthorized' ? 401 : 403 })
    }

    // 요청 데이터 파싱 및 검증
    const body = await request.json()
    const { title, summary, content, tags, cover } = body
    
    // 필수 필드 검증
    if (!title?.trim()) {
      return NextResponse.json({ 
        error: 'Title is required',
        field: 'title'
      }, { status: 400 })
    }
    
    if (!content?.trim()) {
      return NextResponse.json({ 
        error: 'Content is required',
        field: 'content'
      }, { status: 400 })
    }

    // 길이 검증
    if (title.trim().length > 100) {
      return NextResponse.json({ 
        error: 'Title must be 100 characters or less',
        field: 'title'
      }, { status: 400 })
    }

    if (summary && summary.trim().length > 200) {
      return NextResponse.json({ 
        error: 'Summary must be 200 characters or less',
        field: 'summary'
      }, { status: 400 })
    }

    if (content.trim().length < 10) {
      return NextResponse.json({ 
        error: 'Content must be at least 10 characters',
        field: 'content'
      }, { status: 400 })
    }

    // 태그 검증
    if (tags && !Array.isArray(tags)) {
      return NextResponse.json({ 
        error: 'Tags must be an array',
        field: 'tags'
      }, { status: 400 })
    }

    if (tags && tags.length > 10) {
      return NextResponse.json({ 
        error: 'Maximum 10 tags allowed',
        field: 'tags'
      }, { status: 400 })
    }

    // BlogService를 사용하여 포스트 생성
    const supabase = createSupabaseServerClient()
    const blogService = new BlogService(supabase)
    const postData = {
      title: title.trim(),
      summary: summary?.trim() || '',
      content: content.trim(),
      tags: Array.isArray(tags) ? tags.filter(tag => tag && tag.trim()) : [],
      cover: cover || '',
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