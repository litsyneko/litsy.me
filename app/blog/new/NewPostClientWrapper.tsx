"use client"

import dynamic from 'next/dynamic'
import React from 'react'

const NewPostClient = dynamic(() => import('./NewPostClient'), {
  ssr: false,
  loading: () => <div className="max-w-3xl mx-auto py-12 px-4">로딩 중...</div>,
})

export default function NewPostClientWrapper() {
  return <NewPostClient />
}