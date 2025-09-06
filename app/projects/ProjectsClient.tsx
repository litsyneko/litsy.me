"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Bot, Globe, ShoppingCart } from "lucide-react"

export default function ProjectsClient() {
  type Project = {
    id: string
    title: string
    slug?: string
    summary?: string
    body?: string
    tech?: string[]
    category?: string
    status?: string
    cover_url?: string
    repo_url?: string
    live_url?: string
  }

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const categories = ["All", "Frontend", "Backend", "Full-Stack"]
  const [selectedCategory, setSelectedCategory] = useState("All")

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/projects?published=true')
        if (!res.ok) throw new Error(`Failed to fetch projects: ${res.status}`)
        const data = await res.json()
        if (!mounted) return
        setProjects(Array.isArray(data) ? data : [])
      } catch (err: any) {
        console.error(err)
        if (mounted) setError(err.message || 'Unknown error')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  const filteredProjects =
    selectedCategory === "All" ? projects : projects.filter((p) => (p.category || 'Full-Stack') === selectedCategory)

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-6xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            My <span className="text-primary">Projects</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            사용자 경험을 중심으로 설계한 다양한 프로젝트들을 소개합니다. 각 프로젝트는 실제 문제를 해결하고 가치를
            제공하는 것을 목표로 합니다.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="transition-all duration-200"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-20">불러오는 중…</div>
        ) : error ? (
          <div className="text-center text-destructive py-8">{error}</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {filteredProjects.map((project, index) => (
              <Card
                key={project.id || project.title}
                className="group hover:shadow-lg transition-all duration-300 hover:scale-105"
                style={{
                  animation: `fadeInUp 0.6s ease-out forwards`,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg text-primary"><Bot className="w-8 h-8" /></div>
                      <div>
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {project.category || 'Full-Stack'}
                          </Badge>
                          <Badge variant={project.status === "완료" ? "default" : "secondary"} className="text-xs">
                            {project.status || '완료'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-pretty leading-relaxed">{project.summary || project.body}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(project.tech || []).map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2 flex-1 bg-transparent">
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 flex-1 bg-transparent">
                      <Github className="w-4 h-4" />
                      GitHub
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-20">
          <Card className="max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="text-2xl">더 많은 프로젝트</CardTitle>
              <CardDescription className="text-lg">
                GitHub에서 더 많은 프로젝트와 코드를 확인하실 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="bg-primary hover:bg-primary/90">
                <Github className="w-4 h-4 mr-2" />
                GitHub 방문하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
