import BlogCard from './BlogCard'
import { BlogPostWithAuthor } from '@/lib/services/blog' // BlogPostWithAuthor 타입 가져오기

// posts의 형태가 API/로컬에 따라 조금씩 다를 수 있으므로 안전하게 정규화해서 BlogCard에 전달
export default function BlogList({ posts }: { posts: BlogPostWithAuthor[] }) { // posts 타입 변경
  if (!posts || posts.length === 0) {
    return <div className="py-12 text-center text-muted-foreground">아직 게시물이 없습니다.</div>
  }

  // normalize 함수 제거 (API에서 이미 정규화된 데이터를 가져오므로)

  return (
    <div>
      <div className="[column-count:1] sm:[column-count:2] lg:[column-count:3] gap-4 sm:gap-6 lg:gap-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {posts.map((post: BlogPostWithAuthor) => { // post 타입을 BlogPostWithAuthor로 변경
          // const post = normalize(raw) // normalize 함수 호출 제거
          return <BlogCard key={post.slug} post={post} />
        })}
      </div>
    </div>
  )
}
