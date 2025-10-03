"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getPosts, getStrapiMediaUrl } from "@/lib/strapi/api"
import { useLocale } from "@/lib/i18n/hooks"
import { getTranslation } from "@/lib/i18n/translations"
import type { StrapiData, Post } from "@/lib/strapi/types"

export default function BlogPage() {
  const locale = useLocale()
  const t = getTranslation(locale)
  const [posts, setPosts] = useState<Array<StrapiData<Post>>>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const postsPerPage = 10

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      const response = await getPosts(locale, page, postsPerPage)
      setPosts(response.data)
      if (response.meta.pagination) {
        setTotalPages(response.meta.pagination.pageCount)
      }
      setLoading(false)
    }

    fetchPosts()
  }, [page, locale])

  if (loading) {
    return (
      <section className="px-4 sm:px-6 pt-12 pb-16">
        <div className="mx-auto max-w-4xl text-center text-muted-foreground">Loading...</div>
      </section>
    )
  }

  return (
    <section className="px-4 sm:px-6 pt-12 pb-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight gradient-text mb-8">{t.blog.title}</h1>

        {posts.length === 0 ? (
          <div className="text-center text-muted-foreground p-8 border border-dashed border-white/20 rounded-xl">
            <p>No posts yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => {
              const coverImageUrl = post.attributes.coverImage?.data
                ? getStrapiMediaUrl(post.attributes.coverImage.data.attributes.url)
                : null
              const authorName = post.attributes.author?.data?.attributes.name || "Unknown Author"

              return (
                <Link key={post.id} href={`/post/${post.attributes.slug}`} className="block">
                  <div className="glass-effect rounded-xl p-4 md:p-6 border border-white/10 shadow-sm hover:shadow-md transition-all duration-300 hover-lift">
                    {coverImageUrl && (
                      <img
                        src={coverImageUrl || "/placeholder.svg"}
                        alt={post.attributes.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h2 className="text-xl md:text-2xl font-bold mb-2">{post.attributes.title}</h2>
                    {post.attributes.excerpt && (
                      <p className="text-muted-foreground mb-3 line-clamp-2">{post.attributes.excerpt}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{authorName}</span>
                      <span>·</span>
                      <span>{new Date(post.attributes.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              )
            })}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} / {totalPages}
                </span>
                <Button
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
