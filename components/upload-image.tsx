"use client"

import { useState } from 'react'

export default function UploadImage({ onUploaded }: { onUploaded?: (url: string) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState<string | null>(null)

  async function upload() {
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/uploads', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        setUrl(data.url)
        onUploaded?.(data.url)
      } else {
        console.error('Upload failed', data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <div className="flex gap-2">
        <button onClick={upload} disabled={!file || loading} className="btn">
          {loading ? '업로드 중…' : '업로드'}
        </button>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary">
            업로드된 이미지 보기
          </a>
        )}
      </div>
      {file && !url && <div>선택된 파일: {file.name}</div>}
      {url && <img src={url} alt="uploaded" className="max-w-xs mt-2 rounded" />}
    </div>
  )
}
