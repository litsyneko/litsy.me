"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getPostBySlug, getStrapiMediaUrl } from "@/lib/strapi/api"
import { useLocale } from "@/lib/i18n/hooks"
import { getTranslation } from "@/lib/i18n/translations"
import type { StrapiData, Post } from "@/lib/strapi/types"
import Link from "next/link"

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const locale = useLocale()
  const t = getTranslation(locale)
  const postSlug = params.slug as string

  const [post, setPost] = useState<StrapiData<Post> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      const fetchedPost = await getPostBySlug(postSlug, locale)

      if (!fetchedPost) {
        router.replace("/blog")
        return
      }

      setPost(fetchedPost)
      setLoading(false)
    }

    if (postSlug) {
      fetchPost()
    }
  }, [postSlug, locale, router])

  if (loading || !post) {
    return (
      <section className="px-4 sm:px-6 pt-12 pb-16">
        <div className="mx-auto max-w-4xl text-center text-muted-foreground">Loading...</div>
      </section>
    )
  }

  const coverImageUrl = post.attributes.coverImage?.data
    ? getStrapiMediaUrl(post.attributes.coverImage.data.attributes.url)
    : null
  const authorName = post.attributes.author?.data?.attributes.name || "Unknown Author"
  const authorAvatar = post.attributes.author?.data?.attributes.avatar?.data
    ? getStrapiMediaUrl(post.attributes.author.data.attributes.avatar.data.attributes.url)
    : null

  return (
    <section className="px-4 sm:px-6 pt-12 pb-16">
      <div className="mx-auto max-w-4xl">
        {/* Post Header */}
        <div className="glass-effect rounded-xl p-6 md:p-8 border border-white/10 shadow-xl mb-8">
          {coverImageUrl && (
            <img
              src={coverImageUrl || "/placeholder.svg"}
              alt={post.attributes.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text mb-4">{post.attributes.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            {authorAvatar ? (
              <img
                src={authorAvatar || "/placeholder.svg"}
                alt={authorName}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/10 grid place-items-center text-xs">{authorName[0]}</div>
            )}
            <span>{authorName}</span>
            <span>·</span>
            <span>{new Date(post.attributes.publishedAt).toLocaleDateString()}</span>
            {post.attributes.createdAt !== post.attributes.updatedAt && (
              <>
                <span>·</span>
                <span>Updated: {new Date(post.attributes.updatedAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="glass-effect rounded-xl p-6 md:p-8 border border-white/10 shadow-xl mb-8">
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.attributes.content }}
          />
        </div>

        {/* Back to Blog */}
        <div className="flex justify-center">
          <Link href="/blog">
            <Button variant="outline" className="rounded-xl bg-transparent">
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
