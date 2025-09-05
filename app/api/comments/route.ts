import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getDiscordUsername } from '@/lib/discord'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('post_id')
  if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 })
  // use admin client to join with users table for latest author metadata
  const { data, error } = await supabaseAdmin
    .from('comments')
    .select(`*, users:users(id, username, display_name, avatar)`)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error }, { status: 500 })

  // Normalize: if users is an array, take first element
  const normalized = (data || []).map((row: any) => {
    const u = (row.users && row.users[0]) || null
  const rawName = row.author_name || (u && (u.display_name || u.username)) || 'Anonymous'
  // sanitize name: strip discord discriminator and avoid email
  let authorName = typeof rawName === 'string' ? getDiscordUsername(rawName) || rawName : rawName
  if (typeof authorName === 'string' && authorName.includes('@') && authorName.includes('.')) authorName = 'Anonymous'

    return {
      id: row.id,
      post_id: row.post_id,
      author_id: row.author_id || (u && u.id) || null,
      author_name: authorName,
      author_avatar: row.author_avatar || (u && u.avatar) || null,
      content: row.content,
      created_at: row.created_at,
    }
  })

  return NextResponse.json(normalized)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { post_id, author_name, author_avatar, content } = body
  if (!post_id || !content) return NextResponse.json({ error: 'post_id and content required' }, { status: 400 })
  // If client provided an author id (from sync), prefer that and write via admin client
  const author_id = (body.author_id) || null
  const row: any = { post_id, author_name, author_avatar, content }
  if (author_id) row.author_id = author_id

  // write with admin client to ensure author_id and constraints are enforced
  const { data, error } = await supabaseAdmin.from('comments').insert([row]).select()
  if (error) return NextResponse.json({ error }, { status: 500 })

  // return inserted rows normalized with author info from users table
  const inserted = Array.isArray(data) ? data[0] : data
  const { data: userRows } = await supabaseAdmin.from('users').select('*').eq('id', inserted.author_id).limit(1)
  const user = (userRows && userRows[0]) || null
  const result = {
    id: inserted.id,
    post_id: inserted.post_id,
    author_id: inserted.author_id || (user && user.id) || null,
    author_name: inserted.author_name || (user && (user.display_name || user.username)) || 'Anonymous',
    author_avatar: inserted.author_avatar || (user && user.avatar) || null,
    content: inserted.content,
    created_at: inserted.created_at,
  }

  // sanitize name using centralized helper
  if (typeof result.author_name === 'string') {
    const maybe = getDiscordUsername(result.author_name) || result.author_name
    result.author_name = (typeof maybe === 'string' && maybe.includes('@') && maybe.includes('.')) ? 'Anonymous' : maybe
  }

  return NextResponse.json(result)
}
