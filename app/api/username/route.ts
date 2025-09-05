import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ available: false, error: 'username required' }, { status: 400 })
  }

  // assumes profiles table has username column
  const { data, error } = await supabaseServer.from('profiles').select('id').eq('username', username).limit(1)
  if (error) {
    return NextResponse.json({ available: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ available: (data?.length || 0) === 0 })
}
