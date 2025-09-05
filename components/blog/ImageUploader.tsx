"use client"

import { useRef, useState } from 'react'

interface Props {
  onComplete: (dataUrl: string) => void
  initial?: string
}

export default function ImageUploader({ onComplete, initial }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [preview, setPreview] = useState<string | null>(initial || null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file?: File) => {
    setError(null)
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('이미지 파일만 업로드 가능합니다.')
    if (file.size > 10 * 1024 * 1024) return setError('파일 크기는 10MB 이하만 허용됩니다.')

    // 리사이즈(너비 최대 1200) 및 dataURL 생성
    const dataUrl = await resizeToDataUrl(file, 1200)
    setPreview(dataUrl)
    onComplete(dataUrl)
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    handleFile(f)
  }

  const openPicker = () => inputRef.current?.click()

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" onChange={onChange} style={{ display: 'none' }} />
      {preview ? (
        <div className="space-y-2">
          <div className="w-full h-48 rounded overflow-hidden bg-muted">
            <img src={preview} className="w-full h-full object-cover" alt="preview" />
          </div>
          <div className="flex gap-2">
            <button type="button" className="px-3 py-1 bg-muted rounded" onClick={openPicker}>이미지 변경</button>
            <button type="button" className="px-3 py-1 bg-destructive text-white rounded" onClick={() => { setPreview(null); onComplete('') }}>제거</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 border rounded-md bg-card">
          <p className="text-sm text-muted-foreground mb-3">표지 이미지를 업로드하세요</p>
          <div className="flex gap-2">
            <button type="button" className="px-4 py-2 bg-primary text-white rounded" onClick={openPicker}>이미지 선택</button>
          </div>
        </div>
      )}
      {error && <div className="text-sm text-destructive mt-2">{error}</div>}
    </div>
  )
}

async function resizeToDataUrl(file: File, maxWidth = 1200) {
  return new Promise<string>((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onload = () => {
      img.src = reader.result as string
    }
    reader.onerror = reject
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas not supported'))
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toDataURL('image/jpeg', 0.9)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      resolve(dataUrl)
    }
    reader.readAsDataURL(file)
  })
}
