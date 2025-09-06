import { NextResponse } from 'next/server'
import { createSupabaseServerClient, supabaseServiceRole } from '@/lib/supabase-server'
import { BlogService } from '@/lib/services/blog'
import { UserProfile } from '@/lib/supabase' // UserProfile 타입 가져오기

// 블로그 작성 권한이 있는 Discord 사용자 목록 (또는 users.role 활용)
const AUTHORIZED_DISCORD_USERS = [
  'litsy25',
  '616570697875193866'
]

// 권한 확인 헬퍼 함수 (재사용을 위해 여기에 정의)
async function checkBlogWritePermission(): Promise<{ hasPermission: boolean; user: UserProfile | null; error: string | null }> {
  const supabase = createSupabaseServerClient() // 세션 관리를 위한 클라이언트
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !authUser) {
    return { hasPermission: false, user: null, error: 'Unauthorized' }
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('id, email, username, display_name, avatar, role')
    .eq('id', authUser.id)
    .single()

  if (profileError || !userProfile) {
    return { hasPermission: false, user: null, error: 'User profile not found' }
  }

  const hasPermission = userProfile.role === 'admin' || 
                        AUTHORIZED_DISCORD_USERS.includes(userProfile.username || '') ||
                        AUTHORIZED_DISCORD_USERS.includes(authUser.id)
  
  return { 
    hasPermission,
    user: {
      id: userProfile.id,
      email: userProfile.email,
      username: userProfile.username,
      display_name: userProfile.display_name,
      avatar: userProfile.avatar,
      bio: null,
      website: null,
      location: null,
      role: userProfile.role,
      created_at: authUser.created_at,
      updated_at: userProfile.updated_at || authUser.updated_at
    },
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