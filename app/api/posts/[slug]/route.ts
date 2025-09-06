import { NextResponse } from 'next/server'
import { supabaseServer as supabase } from '@/lib/supabase-server'

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = await params as any
  try {
  const { data, error } = await (supabase.from('posts').select('*').eq('slug', slug).limit(1).single() as any)
    if (error) {
      console.error('Supabase error fetching post by slug:', error)
      return NextResponse.json({ error: error.message || error }, { status: 404 })
    }
    // fetch comments
  const { data: comments, error: commentsErr } = await (supabase.from('comments').select('*').eq('post_id', (data as any).id).order('created_at', { ascending: true }) as any)
    if (commentsErr) console.error('Error fetching comments for post:', commentsErr)
  return NextResponse.json({ ...(data as any), comments: comments || [] })
  } catch (err) {
    console.error('Unexpected error in GET /api/posts/[slug]:', err)
    return NextResponse.json({ error: (err as any).message || String(err) }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = await params as any
  const body = await request.json()
  try {
  const { data, error } = await (supabase.from('posts').update(body).eq('slug', slug) as any)
    if (error) {
      console.error('Supabase error updating post:', error)
      return NextResponse.json({ error: error.message || error }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error('Unexpected error in PUT /api/posts/[slug]:', err)
    return NextResponse.json({ error: (err as any).message || String(err) }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = await params as any
  try {
  const { data, error } = await supabase.from('posts').delete().eq('slug', slug)
    if (error) {
      console.error('Supabase error deleting post:', error)
      return NextResponse.json({ error: error.message || error }, { status: 500 })
    }
    return NextResponse.json({ data })
  } catch (err) {
    console.error('Unexpected error in DELETE /api/posts/[slug]:', err)
    return NextResponse.json({ error: (err as any).message || String(err) }, { status: 500 })
  }
}
