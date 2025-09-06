import { NextResponse } from 'next/server'
import { supabaseServer as supabase } from '@/lib/supabase-server'

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
  const body = await request.json()
  const { data, error } = await supabase.from('posts').insert([body])
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}
