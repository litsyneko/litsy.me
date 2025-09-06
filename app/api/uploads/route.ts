import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('file') as Blob | null
    const folder = (form.get('folder') as string) || 'uploads'
    const filename = (form.get('filename') as string) || (file && (file as any).name) || `file-${Date.now()}`

    if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'uploads'
    const path = `${folder}/${Date.now()}-${filename}`

    const { data, error } = await supabaseAdmin.storage.from(bucket).upload(path, buffer, { upsert: false })
    if (error) {
      console.error('Supabase storage upload error:', error)
      return NextResponse.json({ error: error.message || error }, { status: 500 })
    }

    // get public URL (getPublicUrl is sync and returns { data: { publicUrl }})
    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)

    return NextResponse.json({ path: data?.path || path, publicURL: urlData?.publicUrl || null })
  } catch (err) {
    console.error('Unexpected upload error:', err)
    return NextResponse.json({ error: (err as any).message || String(err) }, { status: 500 })
  }
}
