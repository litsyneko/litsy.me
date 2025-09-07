import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { supabaseServiceRole } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
  const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
  const { title, summary, content, tags, cover, author, published = false, postId } = body

    // optional: verify user exists in Clerk
    const clerkUser = await clerkClient.users.getUser(userId)

    let data: any = null
    let error: any = null

    if (postId) {
      // update existing post (save draft or publish)
      const res = await supabaseServiceRole
        .from('posts')
        .update({ title, summary, content, tags, cover, author, published, published_at: published ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
        .eq('id', postId)
        .select()
      data = res.data
      error = res.error
    } else {
      const res = await supabaseServiceRole
        .from('posts')
        .insert([
          {
            title,
            summary,
            content,
            tags,
            cover,
            author,
            user_id: userId,
            published,
            published_at: published ? new Date().toISOString() : null,
          },
        ])
        .select()
      data = res.data
      error = res.error
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ post: data?.[0] ?? null })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
  const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Query params: ?mode=drafts|all
    const url = new URL(req.url)
    const mode = url.searchParams.get('mode') || 'all'

    const query = supabaseServiceRole
      .from('posts')
      .select('*')
      .eq('user_id', userId)

    if (mode === 'drafts') {
      query.eq('published', false)
    }

    const { data, error } = await query.order('updated_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ posts: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
