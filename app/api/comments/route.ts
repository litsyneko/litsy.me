import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { auth, clerkClient } from '@clerk/nextjs/server'

function sanitizeDiscordUsername(input: string): string {
  const m = input.match(/^([^#]+)#\d{4}$/);
  if (m) return m[1].trim();
  const t = input.trim();
  return t.length > 0 ? t : 'Anonymous';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('post_id')
    
    if (!postId) {
      return NextResponse.json({ 
        error: 'post_id is required',
        field: 'post_id'
      }, { status: 400 })
    }

    // 데이터베이스 함수를 사용하여 작성자 정보와 함께 댓글 조회
    const { data, error } = await supabaseAdmin.rpc('get_comments_with_authors', {
      post_id_param: postId
    })

    if (error) {
      console.error('Database error fetching comments:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch comments',
        details: error.message
      }, { status: 500 })
    }

    // 결과 정규화
    const normalized = (data || []).map((row: any) => {
      const rawName = row.author_name || 'Anonymous'
      // sanitize name: strip discord discriminator and avoid email
      let authorName = typeof rawName === 'string' ? sanitizeDiscordUsername(rawName) || rawName : rawName
      if (typeof authorName === 'string' && authorName.includes('@') && authorName.includes('.')) authorName = 'Anonymous'

      return {
        id: row.id,
        post_id: row.post_id,
        author_id: row.author_id,
        author_name: authorName,
        author_avatar: row.author_avatar,
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
        author_username: row.author_username
      }
    })

    return NextResponse.json(normalized)
  } catch (error) {
    console.error('GET /api/comments error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { post_id, author_name, author_avatar, content } = body
    
    // 필수 필드 검증
    if (!post_id || !content) {
      return NextResponse.json({ 
        error: 'post_id and content are required',
        field: !post_id ? 'post_id' : 'content'
      }, { status: 400 })
    }

    // 내용 길이 검증
    if (content.trim().length < 1) {
      return NextResponse.json({ 
        error: 'Content cannot be empty',
        field: 'content'
      }, { status: 400 })
    }

    if (content.trim().length > 1000) {
      return NextResponse.json({ 
        error: 'Content must be 1000 characters or less',
        field: 'content'
      }, { status: 400 })
    }

    // 작성자 이름 검증
    if (author_name && author_name.trim().length > 50) {
      return NextResponse.json({ 
        error: 'Author name must be 50 characters or less',
        field: 'author_name'
      }, { status: 400 })
    }

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
    }

    const row: any = { 
      post_id, 
      author_name: clerkUser.firstName && clerkUser.lastName ? `${clerkUser.firstName} ${clerkUser.lastName}` : clerkUser.username || clerkUser.emailAddresses?.[0]?.emailAddress || 'Anonymous', 
      author_avatar: clerkUser.imageUrl || null, 
      content: content.trim() 
    }
    row.author_id = userId; // Use Clerk's userId as author_id

    // write with admin client to ensure author_id and constraints are enforced
    const { data, error } = await supabaseAdmin.from('comments').insert([row]).select()
    if (error) {
      console.error('Database error creating comment:', error)
      return NextResponse.json({ 
        error: 'Failed to create comment',
        details: error.message
      }, { status: 500 })
    }

    // return inserted rows normalized with author info from Clerk user
    const inserted = Array.isArray(data) ? data[0] : data
    const result = {
      id: inserted.id,
      post_id: inserted.post_id,
      author_id: userId,
      author_name: row.author_name, // Use the name derived from Clerk
      author_avatar: row.author_avatar, // Use the avatar derived from Clerk
      content: inserted.content,
      created_at: inserted.created_at,
    }

    // sanitize name using centralized helper
    if (typeof result.author_name === 'string') {
      const maybe = sanitizeDiscordUsername(result.author_name) || result.author_name
      result.author_name = (typeof maybe === 'string' && maybe.includes('@') && maybe.includes('.')) ? 'Anonymous' : maybe
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('POST /api/comments error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}