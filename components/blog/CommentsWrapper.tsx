'use client'

import dynamic from 'next/dynamic'

const Comments = dynamic(() => import('@/components/comments'), {
  ssr: false,
  loading: () => <p>로딩 중...</p>,
})

export default function CommentsWrapper({ postId }: { postId: string }) {
  return <Comments postId={postId} />
}
