"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Bot, Globe, ShoppingCart } from "lucide-react"

export default function ProjectsPage() {

  const projects = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: "Discord Bot Collection",
      description:
        "다양한 기능을 제공하는 디스코드 봇들을 개발했습니다. 음악 재생, 서버 관리, 게임 기능 등을 포함한 종합적인 봇 시스템입니다.",
      longDescription:
        "Node.js와 Discord.js를 활용하여 개발한 다기능 디스코드 봇입니다. 음악 스트리밍, 서버 모더레이션, 미니게임, 일정 관리 등의 기능을 제공하며, 안정적인 24/7 운영을 위한 에러 핸들링과 로깅 시스템을 구축했습니다.",
      tech: ["Node.js", "Discord.js", "JavaScript", "MongoDB", "Heroku"],
      category: "Backend",
      status: "완료",
      link: "#",
      github: "#",
    },
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "E-Commerce Platform",
      description:
        "현대적인 UI/UX를 적용한 반응형 쇼핑몰 플랫폼입니다. 사용자 친화적인 인터페이스와 직관적인 구매 프로세스를 구현했습니다.",
      longDescription:
        "Next.js와 TypeScript를 기반으로 한 풀스택 이커머스 플랫폼입니다. 상품 관리, 장바구니, 결제 시스템, 주문 관리 등의 핵심 기능을 구현했으며, 관리자 대시보드를 통한 효율적인 운영이 가능합니다.",
      tech: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL"],
      category: "Full-Stack",
      status: "진행중",
      link: "#",
      github: "#",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Task Management App",
      description:
        "팀 협업을 위한 직관적인 태스크 관리 도구입니다. 실시간 업데이트와 사용자 친화적인 인터페이스를 제공합니다.",
      longDescription:
        "React와 Node.js를 활용한 실시간 협업 도구입니다. 드래그 앤 드롭 기능, 실시간 알림, 팀원 간 커뮤니케이션 기능을 구현했으며, 반응형 디자인으로 모든 디바이스에서 원활한 사용이 가능합니다.",
      tech: ["React", "Node.js", "Socket.io", "MongoDB", "Express"],
      category: "Full-Stack",
      status: "완료",
      link: "#",
      github: "#",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Portfolio Website",
      description:
        "미니멀한 디자인의 개인 포트폴리오 사이트입니다. 현재 보고 계신 이 웹사이트로, 사용자 경험을 중심으로 설계했습니다.",
      longDescription:
        "Next.js와 Tailwind CSS를 활용하여 제작한 개인 포트폴리오 웹사이트입니다. 다크 모드 지원, 부드러운 애니메이션, 반응형 디자인을 적용했으며, 사용자 경험을 최우선으로 고려한 인터페이스를 구현했습니다.",
      tech: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Vercel"],
      category: "Frontend",
      status: "완료",
      link: "#",
      github: "#",
    },
  ]

  const categories = ["All", "Frontend", "Backend", "Full-Stack"]
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredProjects =
    selectedCategory === "All" ? projects : projects.filter((project) => project.category === selectedCategory)

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
        <div className="grid md:grid-cols-2 gap-8">
          {filteredProjects.map((project, index) => (
            <Card
              key={project.title}
              className="group hover:shadow-lg transition-all duration-300 hover:scale-105"
              style={{
                animation: `fadeInUp 0.6s ease-out forwards`,
                animationDelay: `${index * 0.1}s`
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">{project.icon}</div>
                    <div>
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {project.category}
                        </Badge>
                        <Badge variant={project.status === "완료" ? "default" : "secondary"} className="text-xs">
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-pretty leading-relaxed">{project.longDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.map((tech) => (
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
