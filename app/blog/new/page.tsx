import { Metadata } from 'next'
import NewPostClient from './NewPostClient'
import React, { Suspense } from 'react'

export const metadata: Metadata = {
  title: '새 글 작성 | Litsy Portfolio',
  description: '새로운 블로그 포스트를 작성하세요.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NewPostPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto py-12 px-4">로딩 중...</div>}>
      <NewPostClient />
    </Suspense>
  )
}
