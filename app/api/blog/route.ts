import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { supabaseServiceRole } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, summary, content, tags, cover, author } = body

    // optional: verify user exists in Clerk
    const clerkUser = await clerkClient.users.getUser(userId)

    const { data, error } = await supabaseServiceRole
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
        },
      ])
      .select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ post: data?.[0] ?? null })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
