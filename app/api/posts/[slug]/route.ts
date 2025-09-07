import { NextResponse } from 'next/server'
import { BlogService } from '@/lib/services/blog'
import { auth, clerkClient } from '@clerk/nextjs/server'

// 블로그 작성 권한이 있는 Discord 사용자 목록 (또는 users.role 활용)
const AUTHORIZED_DISCORD_USERS = [
  'litsy25',
  '616570697875193866'
]

// 권한 확인 헬퍼 함수 (재사용을 위해 여기에 정의)
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

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()
    const blogService = new BlogService(supabase)
    const post = await blogService.getPost(slug)

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // 댓글도 함께 가져오기
    try {
      const comments = await blogService.getComments(post.id)
      return NextResponse.json({ 
        ...post, 
        comments: comments || [] 
      })
    } catch (commentsError) {
      console.error('Error fetching comments:', commentsError)
      return NextResponse.json({ 
        ...post, 
        comments: [] 
      })
    }
  } catch (error) {
    console.error('GET /api/posts/[slug] error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch post',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const body = await request.json()

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    // 권한 확인
    const { hasPermission, user, error: authError } = await checkBlogWritePermission()
    if (!hasPermission) {
      return NextResponse.json({ 
        error: authError,
        user: user ? { id: user.id, username: user.username, display_name: user.display_name, role: user.role } : null
      }, { status: authError === 'Unauthorized' ? 401 : 403 })
    }

    const supabase = createSupabaseServerClient()
    const blogService = new BlogService(supabase)
    const existingPost = await blogService.getPost(slug)

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // 업데이트할 데이터 검증
    if (body.title && body.title.trim().length > 100) {
      return NextResponse.json({ 
        error: 'Title must be 100 characters or less',
        field: 'title'
      }, { status: 400 })
    }

    if (body.summary && body.summary.trim().length > 200) {
      return NextResponse.json({ 
        error: 'Summary must be 200 characters or less',
        field: 'summary'
      }, { status: 400 })
    }

    if (body.content && body.content.trim().length < 10) {
      return NextResponse.json({ 
        error: 'Content must be at least 10 characters',
        field: 'content'
      }, { status: 400 })
    }

    const updateData = {
      id: existingPost.id,
      author_id: existingPost.author_id, // 작성자 ID 유지
      ...body
    }

    const result = await blogService.updatePost(updateData)
    return NextResponse.json(result)
  } catch (error) {
    console.error('PUT /api/posts/[slug] error:', error)
    return NextResponse.json({ 
      error: 'Failed to update post',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    // 권한 확인
    const { hasPermission, user, error: authError } = await checkBlogWritePermission()
    if (!hasPermission) {
      return NextResponse.json({ 
        error: authError,
        user: user ? { id: user.id, username: user.username, display_name: user.display_name, role: user.role } : null
      }, { status: authError === 'Unauthorized' ? 401 : 403 })
    }

    const supabase = createSupabaseServerClient()
    const blogService = new BlogService(supabase)
    const existingPost = await blogService.getPost(slug)

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    await blogService.deletePost(existingPost.id)
    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/posts/[slug] error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete post',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}