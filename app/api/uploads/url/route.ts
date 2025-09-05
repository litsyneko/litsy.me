import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    if (!path) return NextResponse.json({ error: 'path required' }, { status: 400 })

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'uploads'
    // Attempt to create a signed URL for private buckets, fallback to publicUrl
    const expiresIn = 60 * 60 // 1 hour
    const { data: signed, error: signErr } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, expiresIn)
    if (signErr) {
      // try public URL
      const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
      return NextResponse.json({ publicURL: pub.publicUrl })
    }
    return NextResponse.json({ signedURL: signed.signedUrl })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
