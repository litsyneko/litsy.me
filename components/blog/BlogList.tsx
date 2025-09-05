import BlogCard from './BlogCard'

// posts의 형태가 API/로컬에 따라 조금씩 다를 수 있으므로 안전하게 정규화해서 BlogCard에 전달
export default function BlogList({ posts }: { posts: any[] }) {
  if (!posts || posts.length === 0) {
    return <div className="py-12 text-center text-muted-foreground">아직 게시물이 없습니다.</div>
  }

  const normalize = (p: any) => {
    const slug = p.slug || p.id || (p.title ? String(p.title).toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined)
    return {
      slug: slug || String(Math.random()).slice(2),
      title: p.title || p.name || 'Untitled',
      summary: p.summary || p.description || '',
      date: p.published_at || p.created_at || p.date || new Date().toISOString(),
      tags: Array.isArray(p.tags) ? p.tags : [],
  // prefer nickname, then username, then author_name; no phone/real name usage
  author: p.nickname || p.author || p.author_name || p.username || 'Anonymous',
  username: p.username || null,
      cover: p.cover || p.cover_url || p.image || '/placeholder.jpg'
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {posts.map((raw: any) => {
          const post = normalize(raw)
          return <BlogCard key={post.slug} post={post} />
        })}
      </div>
    </div>
  )
}
