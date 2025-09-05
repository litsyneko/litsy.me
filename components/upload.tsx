"use client"

import { useState } from 'react'

export default function Upload({ folder = 'posts' }: { folder?: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState<string | null>(null)

  async function submit() {
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    fd.append('filename', file.name)

    try {
      const res = await fetch('/api/uploads', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('upload failed')
      const data = await res.json()
      setUrl(data.publicURL || data.path)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
      <button onClick={submit} disabled={!file || loading} className="ml-2 px-3 py-1 bg-primary text-white rounded">
        {loading ? '업로드 중…' : '업로드'}
      </button>
      {url && <div className="mt-2 text-sm text-muted-foreground">URL: <a href={url} target="_blank" rel="noreferrer">{url}</a></div>}
    </div>
  )
}
