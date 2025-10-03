import { strapiClient } from "./client"
import type { StrapiResponse, StrapiData, Post, Project, Tag, Locale } from "./types"

// Helper to get media URL
export function getStrapiMediaUrl(url: string | undefined): string {
  if (!url) return "/placeholder.svg?height=400&width=600"
  if (url.startsWith("http")) return url
  return `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${url}`
}

// Posts API
export async function getPosts(locale: Locale = "ko", page = 1, pageSize = 10) {
  try {
    const response = await strapiClient.get<StrapiResponse<Array<StrapiData<Post>>>>("/posts", {
      params: {
        locale,
        populate: ["author", "tags", "coverImage"],
        sort: ["publishedAt:desc"],
        pagination: {
          page,
          pageSize,
        },
      },
    })
    return response.data
  } catch (error) {
    console.error("[v0] Error fetching posts:", error)
    return { data: [], meta: {} }
  }
}

export async function getPostBySlug(slug: string, locale: Locale = "ko") {
  try {
    const response = await strapiClient.get<StrapiResponse<Array<StrapiData<Post>>>>("/posts", {
      params: {
        locale,
        filters: {
          slug: {
            $eq: slug,
          },
        },
        populate: ["author", "tags", "coverImage", "localizations"],
      },
    })
    return response.data.data[0] || null
  } catch (error) {
    console.error("[v0] Error fetching post:", error)
    return null
  }
}

// Projects API
export async function getProjects(locale: Locale = "ko") {
  try {
    const response = await strapiClient.get<StrapiResponse<Array<StrapiData<Project>>>>("/projects", {
      params: {
        locale,
        populate: ["image", "tags"],
        sort: ["order:asc", "createdAt:desc"],
      },
    })
    return response.data.data
  } catch (error) {
    console.error("[v0] Error fetching projects:", error)
    return []
  }
}

export async function getFeaturedProjects(locale: Locale = "ko") {
  try {
    const response = await strapiClient.get<StrapiResponse<Array<StrapiData<Project>>>>("/projects", {
      params: {
        locale,
        filters: {
          featured: {
            $eq: true,
          },
        },
        populate: ["image", "tags"],
        sort: ["order:asc"],
      },
    })
    return response.data.data
  } catch (error) {
    console.error("[v0] Error fetching featured projects:", error)
    return []
  }
}

// Tags API
export async function getTags(locale: Locale = "ko") {
  try {
    const response = await strapiClient.get<StrapiResponse<Array<StrapiData<Tag>>>>("/tags", {
      params: {
        locale,
        sort: ["name:asc"],
      },
    })
    return response.data.data
  } catch (error) {
    console.error("[v0] Error fetching tags:", error)
    return []
  }
}

// Generic fetch function for flexibility
export async function fetchFromStrapi<T>(endpoint: string, params?: Record<string, any>) {
  try {
    const response = await strapiClient.get<StrapiResponse<T>>(endpoint, {
      params,
    })
    return response.data
  } catch (error) {
    console.error(`[v0] Error fetching from ${endpoint}:`, error)
    return null
  }
}
