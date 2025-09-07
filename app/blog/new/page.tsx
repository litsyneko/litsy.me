import { Metadata } from 'next'
import NewPostClientWrapper from './NewPostClientWrapper'
import React from 'react'

export const metadata: Metadata = {
  title: '새 글 작성 | Litsy Portfolio',
  description: '새로운 블로그 포스트를 작성하세요.',
  robots: {
    index: false,
    follow: false,
  },
}


export default function NewPostPage() {
  return <NewPostClientWrapper />
}
