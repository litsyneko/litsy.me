import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const published = searchParams.get('published')

  let query = supabase.from('projects').select('*').order('created_at', { ascending: false })
  if (published === 'true') {
    query = query.eq('published', true)
  }

  try {
    const { data, error } = await query
    if (error) {
      console.error('Supabase error fetching projects:', error)
      // If table doesn't exist in the Supabase schema cache, return an empty list
      // so the frontend can render an empty state instead of failing with 500.
      if ((error as any)?.code === 'PGRST205') {
        console.warn('Projects table not found, returning empty list until migrations are applied.')
        return NextResponse.json([])
      }
      return NextResponse.json({ error: error.message || error }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error('Unexpected error in GET /api/projects:', err)
    return NextResponse.json({ error: (err as any).message || String(err) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  // Admin-only: expects JSON body. This route requires service role key in env for real use.
  const body = await request.json()
  try {
    const { data, error } = await (supabase as any).from('projects').insert([body])
    if (error) {
      console.error('Supabase error inserting project:', error)
      return NextResponse.json({ error: error.message || error }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error('Unexpected error in POST /api/projects:', err)
    return NextResponse.json({ error: (err as any).message || String(err) }, { status: 500 })
  }
}
