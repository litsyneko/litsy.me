import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { supabaseServiceRole } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
  const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
  const { title, summary, content, tags, cover, published = false, postId } = body

  // optional: verify user exists in Clerk and check allowed blog authors
  const clerk = await clerkClient()
  const clerkUser = await clerk.users.getUser(userId)

    // Allowlist: username or email that can create posts
    const ALLOWED_USERNAMES = ['litsy25']
    const ALLOWED_EMAILS = ['namsangik21@naver.com']

  const userEmails = (clerkUser.emailAddresses || []).map((e: any) => e.emailAddress) || []
  const isAllowedUser = ALLOWED_USERNAMES.includes(clerkUser.username || '')
  const isAllowedEmail = userEmails.some((e: any) => ALLOWED_EMAILS.includes(e))

  // Map Clerk user -> database user UUID by matching email.
  // Clerk user IDs are not Supabase UUIDs (they look like 'user_xxx'),
  // so we must find the DB user row (public.users) and use its UUID id.
  const primaryEmail =
    clerkUser.primaryEmailAddress?.emailAddress || userEmails[0] || null
  let dbUserId: string | null = null
  if (primaryEmail) {
    const { data: dbUser, error: dbUserErr } = await supabaseServiceRole
      .from('users')
      .select('id')
      .eq('email', primaryEmail)
      .single()
    if (!dbUserErr && dbUser && (dbUser as any).id) {
      dbUserId = (dbUser as any).id
    }
  }

    if (!isAllowedUser && !isAllowedEmail) {
      return NextResponse.json({ error: 'Forbidden: Blog write permission required' }, { status: 403 })
    }

    // If we couldn't map the Clerk account to a DB user UUID, attempt to
    // create a minimal public.users profile (upsert). This uses the
    // service-role key so it's allowed to write to public.users. If we still
    // can't create a DB user, return a helpful error.
    if (!dbUserId) {
      const attemptedEmail = primaryEmail || null
      console.info('Blog API: no DB user found for Clerk account, attempting to create one', { clerkId: userId, attemptedEmail })

      if (!attemptedEmail) {
        console.error('Blog API: cannot create DB user without an email', { clerkId: userId })
        return NextResponse.json({ error: 'Forbidden: no linked database user and no email available to create one', clerkId: userId }, { status: 403 })
      }

      const newUserPayload: any = {
        email: attemptedEmail,
        username: (clerkUser as any)?.username || null,
        display_name: (clerkUser as any)?.firstName || (clerkUser as any)?.fullName || null,
        avatar: null,
        bio: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: createdUser, error: createErr } = await supabaseServiceRole
        .from('users')
        .insert([newUserPayload])
        .select()
        .single()

      if (createErr || !createdUser) {
        console.error('Blog API: failed to create DB user', { clerkId: userId, attemptedEmail, error: createErr })
        return NextResponse.json({ error: 'Failed to create linked database user', detail: createErr?.message || null }, { status: 500 })
      }

      dbUserId = (createdUser as any).id
      console.info('Blog API: created DB user for Clerk account', { clerkId: userId, dbUserId })
    }

    let data: any = null
    let error: any = null

  if (postId) {
      // update existing post (save draft or publish)
      const res = await supabaseServiceRole
        .from('posts')
        .update({ title, summary, content, tags, cover_url: cover || null, published, published_at: published ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
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
      cover_url: cover || null,
      author_id: dbUserId,
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

  // Verify Clerk user and allowlist check for read access to personal posts/drafts
  const clerk = await clerkClient()
  const clerkUser = await clerk.users.getUser(userId)

    const ALLOWED_USERNAMES = ['litsy25']
    const ALLOWED_EMAILS = ['namsangik21@naver.com']
  const userEmails = (clerkUser.emailAddresses || []).map((e: any) => e.emailAddress) || []
  const isAllowedUser = ALLOWED_USERNAMES.includes(clerkUser.username || '')
  const isAllowedEmail = userEmails.some((e: any) => ALLOWED_EMAILS.includes(e))

    if (!isAllowedUser && !isAllowedEmail) {
      return NextResponse.json({ error: 'Forbidden: Blog access restricted' }, { status: 403 })
    }

    // Query params: ?mode=drafts|all or ?postId=<id>
    const url = new URL(req.url)
    const postId = url.searchParams.get('postId')
    const mode = url.searchParams.get('mode') || 'all'

    if (postId) {
      const { data, error } = await supabaseServiceRole
        .from('posts')
        .select('*')
        .eq('id', postId)
        .eq('author_id', userId)
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ post: data ?? null })
    }

    const query = supabaseServiceRole
      .from('posts')
      .select('*')
      .eq('author_id', userId)

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
