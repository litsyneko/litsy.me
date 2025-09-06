import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const supabase = createSupabaseServerClient()
  const { slug } = await params
  const { data, error } = await supabase.from('projects').select('*').eq('slug', slug).limit(1).single()
  if (error) return NextResponse.json({ error }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const supabase = createSupabaseServerClient()
  const { slug } = await params
  const body = await request.json()
  const { data, error } = await (supabase as any).from('projects').update(body).eq('slug', slug)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const supabase = createSupabaseServerClient()
  const { slug } = await params
  const { data, error } = await supabase.from('projects').delete().eq('slug', slug)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ data })
}
