import { NextResponse } from 'next/server'
import { supabaseServer as supabase } from '@/lib/supabase-server'
import { createSupabaseClient } from '@/lib/supabase'

// 블로그 작성 권한이 있는 Discord 사용자 목록
const AUTHORIZED_DISCORD_USERS = [
  'litsy25',
  '616570697875193866'
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const published = searchParams.get('published')

  let query = supabase.from('posts').select('*').order('published_at', { ascending: false })
  if (published === 'true') {
    query = query.eq('published', true)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    // 사용자 인증 확인
    const supabaseClient = createSupabaseClient()
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Discord 권한 확인
    const discordUsername = user.user_metadata?.preferred_username || user.user_metadata?.username
    const discordId = user.user_metadata?.provider_id || user.user_metadata?.sub
    
    const hasPermission = AUTHORIZED_DISCORD_USERS.includes(discordUsername) || 
                         AUTHORIZED_DISCORD_USERS.includes(discordId)
    
    if (!hasPermission) {
      return NextResponse.json({ 
        error: 'Forbidden: Blog write permission required',
        user: { discordUsername, discordId }
      }, { status: 403 })
    }

    // 요청 데이터 파싱
    const body = await request.json()
    const { title, summary, content, tags, cover } = body
    
    // 필수 필드 검증
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // 슬러그 생성
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // DB에 저장할 데이터 구성
    const postData = {
      title: title.trim(),
      slug,
      summary: summary?.trim() || null,
      content: content.trim(),
      tags: Array.isArray(tags) && tags.length > 0 ? tags : null,
      cover_url: cover || null,
      user_id: user.id,
      published: true,
      published_at: new Date().toISOString()
    }

    // Supabase에 저장
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('POST /api/posts error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
