"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Github, Mail, MessageCircle, Send, MapPin, Clock } from "lucide-react"

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "이메일",
      description: "litsy.dev@gmail.com",
      action: "mailto:litsy.dev@gmail.com",
      buttonText: "이메일 보내기",
    },
    {
      icon: <Github className="w-6 h-6" />,
      title: "GitHub",
      description: "github.com/litsyme",
      action: "https://github.com/litsyme",
      buttonText: "GitHub 방문",
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "디스코드",
      description: "@litsy_dev",
      action: "https://discord.com/users/litsy_dev",
      buttonText: "디스코드 연결",
    },
  ]

  const availability = [
    {
      icon: <Clock className="w-5 h-5" />,
      title: "응답 시간",
      description: "보통 24시간 이내",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "위치",
      description: "대한민국, 서울",
    },
  ]

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-6xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Get In <span className="text-primary">Touch</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            새로운 프로젝트나 협업 기회에 대해 이야기해보세요. 언제든지 연락 주시면 빠르게 답변드리겠습니다.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">메시지 보내기</CardTitle>
                <CardDescription>아래 폼을 통해 직접 메시지를 보내실 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4" role="form" aria-label="연락처 폼">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="text-sm font-medium mb-2 block">
                        이름
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="홍길동"
                        required
                        aria-describedby="name이 필요합니다"
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-medium mb-2 block">
                        이메일
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="example@email.com"
                        required
                        aria-describedby="유효한 이메일 주소가 필요합니다"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="text-sm font-medium mb-2 block">
                      제목
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="프로젝트 협업 제안"
                      required
                      aria-describedby="메시지 제목이 필요합니다"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="text-sm font-medium mb-2 block">
                      메시지
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="안녕하세요, 프로젝트에 대해 이야기하고 싶습니다..."
                      rows={6}
                      required
                      aria-describedby="상세한 메시지 내용이 필요합니다"
                      minLength={10}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    <Send className="w-4 h-4 mr-2" />
                    메시지 보내기
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Methods & Info */}
          <div className="space-y-6">
            {/* Contact Methods */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-2xl font-bold mb-6">연락 방법</h2>
              <div className="space-y-4">
                {contactMethods.map((method, index) => (
                  <Card key={method.title} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg text-primary">{method.icon}</div>
                          <div>
                            <h3 className="font-semibold">{method.title}</h3>
                            <p className="text-muted-foreground text-sm">{method.description}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={method.action} target="_blank" rel="noopener noreferrer">
                            {method.buttonText}
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Availability Info */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-2xl font-bold mb-6">가용성</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {availability.map((item) => (
                      <div key={item.title} className="flex items-center gap-3">
                        <div className="text-primary">{item.icon}</div>
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-muted-foreground text-sm">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Call to Action */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-2">프로젝트 협업</h3>
                  <p className="text-muted-foreground mb-4 text-pretty">
                    흥미로운 프로젝트나 아이디어가 있으시다면 언제든지 연락해주세요. 함께 멋진 것을 만들어봅시다!
                  </p>
                  <Button className="bg-primary hover:bg-primary/90">지금 연락하기</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
