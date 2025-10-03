import { STRAPI_CONFIG } from "./config"

export interface StrapiResponse<T> {
  data: T
  meta?: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export interface StrapiError {
  error: {
    status: number
    name: string
    message: string
    details?: unknown
  }
}

class StrapiClient {
  private baseUrl: string
  private token?: string

  constructor() {
    this.baseUrl = STRAPI_CONFIG.apiUrl
    this.token = STRAPI_CONFIG.apiToken
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    return headers
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<StrapiResponse<T>> {
    const url = new URL(`${this.baseUrl}/api${endpoint}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    if (!response.ok) {
      const error: StrapiError = await response.json()
      throw new Error(error.error.message || "Failed to fetch from Strapi")
    }

    return response.json()
  }

  async post<T>(endpoint: string, data: unknown): Promise<StrapiResponse<T>> {
    const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ data }),
    })

    if (!response.ok) {
      const error: StrapiError = await response.json()
      throw new Error(error.error.message || "Failed to post to Strapi")
    }

    return response.json()
  }

  async put<T>(endpoint: string, data: unknown): Promise<StrapiResponse<T>> {
    const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({ data }),
    })

    if (!response.ok) {
      const error: StrapiError = await response.json()
      throw new Error(error.error.message || "Failed to update in Strapi")
    }

    return response.json()
  }

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      const error: StrapiError = await response.json()
      throw new Error(error.error.message || "Failed to delete from Strapi")
    }
  }
}

export const strapiClient = new StrapiClient()
