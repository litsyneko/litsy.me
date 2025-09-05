import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getDiscordUsername } from '@/lib/discord'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, provider, username, discriminator, global_name, display_name, avatar, metadata } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Determine username: prefer explicit username field, else metadata.username
  // prefer explicit username, else derive from metadata and ensure discriminator stripped
  const rawUsername = getDiscordUsername(username || metadata || null)
    // Also accept separate discriminator field (ignore it for username storage)

    // Determine display_name: prefer explicit global_name, then metadata global/userdisplayname; never store email
    let safeDisplay = global_name || metadata?.userdisplayname || metadata?.global_name || null
    if (safeDisplay && typeof safeDisplay === 'string' && safeDisplay.includes('@')) safeDisplay = null

    const payload = {
      id,
      provider: provider || null,
      username: rawUsername || null,
      display_name: safeDisplay,
      avatar: avatar || null,
      metadata: metadata || null,
      last_synced: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin.from('users').upsert(payload, { onConflict: 'id' })
    if (error) return NextResponse.json({ error }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
