"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ExternalLink, Sparkles, Code, Palette } from "lucide-react"
import { FaReact, FaNodeJs, FaDiscord } from "react-icons/fa"
import { SiNextdotjs, SiTypescript } from "react-icons/si"
import { MdDesignServices } from "react-icons/md"
import Link from "next/link"
import Image from "next/image"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

function useDescriptionTypewriter(descriptions: string[], basePauseDuration = 3000, initialDelay = 0, fastModeAfterFirst = false) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [descIndex, setDescIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const [isWaiting, setIsWaiting] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [cycleCount, setCycleCount] = useState(0)

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [])

  useEffect(() => {
    if (initialDelay > 0 && !hasStarted) {
      const delayTimer = setTimeout(() => {
        setHasStarted(true)
      }, initialDelay)
      return () => clearTimeout(delayTimer)
    } else if (initialDelay === 0) {
      setHasStarted(true)
    }
  }, [initialDelay, hasStarted])

  useEffect(() => {
    if (!hasStarted || isWaiting) return

    const currentDesc = descriptions[descIndex]
    // 첫 번째 사이클 후에는 더 빠르게
    const speedMultiplier = fastModeAfterFirst && cycleCount > 0 ? 0.5 : 1
    const baseSpeed = Math.max(30, Math.min(120, 2000 / currentDesc.length)) * speedMultiplier
    const deleteSpeed = baseSpeed / 3

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // 타이핑 중
        if (currentIndex < currentDesc.length) {
          setDisplayText(currentDesc.slice(0, currentIndex + 1))
          setCurrentIndex((prev) => prev + 1)
        } else {
          // 타이핑 완료, 잠시 대기 후 삭제 시작
          setIsWaiting(true)
          // 첫 번째 사이클 후에는 대기 시간도 짧게
          const pauseTime = fastModeAfterFirst && cycleCount > 0 ? basePauseDuration * 0.6 : basePauseDuration
          setTimeout(() => {
            setIsWaiting(false)
            setIsDeleting(true)
          }, pauseTime)
        }
      } else {
        // 삭제 중
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1)
          setDisplayText(currentDesc.slice(0, currentIndex - 1))
        } else {
          // 삭제 완료, 다음 텍스트로 전환
          setIsDeleting(false)
          setDescIndex((prev) => (prev + 1) % descriptions.length)
          setCurrentIndex(0)
          setDisplayText("")
          // 한 사이클 완료 시 카운트 증가
          if (descIndex === descriptions.length - 1) {
            setCycleCount((prev) => prev + 1)
          }
        }
      }
    }, isDeleting ? deleteSpeed : baseSpeed)

    return () => clearTimeout(timeout)
  }, [currentIndex, descIndex, isDeleting, descriptions, basePauseDuration, isWaiting, hasStarted, cycleCount, fastModeAfterFirst, descriptions[descIndex]?.length])

  return { displayText, showCursor }
}

// metadata moved to avoid "use client" directive conflict

// 페이지 기능: 대표 프로젝트, 기술 스택, 소개 및 연락처로의 진입점 제공
export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [globalMousePosition, setGlobalMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)
  const skillsRef = useRef<HTMLDivElement>(null)

  const names = ["Litsy", "릿시", "リッシnEKO"]
  const { displayText: typedName, showCursor: nameShowCursor } = useDescriptionTypewriter(names, 1500, 0, true)

  const { displayText: typedDescription, showCursor: descShowCursor } = useDescriptionTypewriter(
    ["사용자 경험을 최우선으로 생각하는 개발자", "HaruCream", "KSNU", "Korea", "Developer", "Discord Server Manager"],
    2500,
    1200,
  )

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (skillsRef.current) {
        const rect = skillsRef.current.getBoundingClientRect()
        setGlobalMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [skillsRef])

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl animate-morphing-blob" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-accent/15 to-primary/15 rounded-full blur-3xl animate-morphing-blob"
          style={{ animationDelay: "10s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-secondary/10 to-accent/10 rounded-full blur-3xl animate-morphing-blob"
          style={{ animationDelay: "5s" }}
        />
      </div>

      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 pt-32 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 text-left">
              <div>
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-6 relative z-10">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Frontend Developer</span>
                  </div>

                  <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none">
                    안녕하세요,{" "}
                    <div className="w-[350px] md:w-auto md:min-w-[500px] md:max-w-[700px] inline-block text-left">
                      <span 
                        className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent inline-block"
                        style={{ 
                          minWidth: `${Math.max(typedName.length * 0.6, 8)}ch`,
                          transition: 'min-width 0.1s ease-out'
                        }}
                      >
                        {typedName}
                        <span
                          className={`transition-opacity duration-100 ${nameShowCursor ? "opacity-100" : "opacity-0"} inline-block w-0.5 h-[0.8em] bg-primary ml-1`}
                        >
                        </span>
                      </span>
                    </div>
                    <br />
                    입니다
                  </h1>
                </div>

                <div className="mb-12 h-20 flex items-center">
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                    {typedDescription}
                    <span
                      className={`transition-opacity duration-100 ${descShowCursor ? "opacity-100" : "opacity-0"} inline-block w-0.5 h-[0.8em] bg-primary ml-1`}
                    >
                    </span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-16">
                  <Link href="/projects">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="lg"
                        className="btn-modern px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 dark:text-white"
                      >
                        <Code className="w-5 h-5 mr-2" />
                        프로젝트 보기
                      </Button>
                    </motion.div>
                  </Link>
                    <Link href="/contact">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="lg"
                          className="px-8 py-3 text-lg bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl shadow-2xl hover:from-primary/90 hover:to-blue-600/90 ring-1 ring-primary/20 transition-all duration-300"
                        >
                          프로젝트 문의하기
                        </Button>
                      </motion.div>
                    </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className="relative"
              >
                <div className="relative w-80 h-80 md:w-96 md:h-96">
                  {/* Background decorative elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl blur-2xl animate-pulse-glow" />
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-accent to-primary rounded-2xl animate-float opacity-80" />
                  <div
                    className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-secondary to-accent rounded-full animate-float opacity-60"
                    style={{ animationDelay: "2s" }}
                  />

                  {/* Main profile container */}
                  <motion.div
                    className="relative w-full h-full glass-effect rounded-3xl p-8 hover-lift"
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 4,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 p-2">
                      <div className="w-full h-full rounded-xl overflow-hidden bg-background/80 backdrop-blur-sm">
                        <Image
                          src="/images/profile.png"
                          alt="LitsyNeko 프로필"
                          width={400}
                          height={400}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                          priority
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { number: "4+", text: "년간 개발 경험", icon: "🚀", delay: 0 },
                { number: "∞", text: "지속적인 학습", icon: "📚", delay: 0.1 },
                { number: "100%", text: "사용자 중심", icon: "❤️", delay: 0.2 },
              ].map((item, index) => (
                <div
                  key={item.text}
                  className="glass-effect rounded-2xl p-8 text-center hover-glow transition-all duration-300 group w-full"
                >
                  <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div className="text-4xl font-black gradient-text mb-3 w-full flex justify-center">
                    <span className="inline-block w-20 text-center">{item.number}</span>
                  </div>
                  <div className="text-muted-foreground font-medium">{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <Link href="/about" className="group">
            <motion.div
              className="flex flex-col items-center glass-effect rounded-full p-4 hover-glow"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "easeInOut" }}
            >
              <span className="text-sm text-muted-foreground mb-2 group-hover:text-primary transition-colors">
                더 알아보기
              </span>
              <ChevronDown className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.div>
          </Link>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-muted/30 to-primary/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              대표 프로젝트
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              현재 개발 중인 프로젝트들이 완성되면 여기에 소개할 예정입니다.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full mb-6">
              <svg className="w-12 h-12 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-muted-foreground">
              곧 공개될 프로젝트들을 기대해 주세요!
            </h3>
            <p className="text-muted-foreground/80 max-w-md mx-auto leading-relaxed">
              현재 여러 프로젝트를 개발 중이며, 완성되는 대로 이곳에 소개하겠습니다.
            </p>
          </div>

          <div className="text-center mt-12">
            <Link href="/projects">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-3 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300 bg-transparent"
              >
                모든 프로젝트 보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-4" ref={skillsRef}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              Skills
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              4년 이상의 Node.js 경험과 다양한 프로젝트를 통해 쌓은 기술들입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: "1000px" }}>
            {[
              { name: "React", desc: "컴포넌트 기반 UI 개발", icon: <FaReact className="text-blue-500" /> },
              {
                name: "Next.js",
                desc: "풀스택 React 프레임워크",
                icon: <SiNextdotjs className="text-gray-800 dark:text-white" />,
              },
              { name: "TypeScript", desc: "타입 안전한 JavaScript", icon: <SiTypescript className="text-blue-600" /> },
              { name: "Node.js", desc: "서버사이드 JavaScript", icon: <FaNodeJs className="text-green-600" /> },
              { name: "Discord Bot", desc: "봇 개발 및 API 연동", icon: <FaDiscord className="text-indigo-600" /> },
              {
                name: "UI/UX Design",
                desc: "사용자 중심 인터페이스",
                icon: <MdDesignServices className="text-pink-600" />,
              },
            ].map((tech, index) => {
              const cardRef = useRef<HTMLDivElement>(null)
              const [isDirectHover, setIsDirectHover] = useState(false)
              const x = useMotionValue(0)
              const y = useMotionValue(0)

              const mouseXSpring = useSpring(x)
              const mouseYSpring = useSpring(y)

              const rotateX = useTransform(mouseYSpring, [-1, 1], ["25deg", "-25deg"])
              const rotateY = useTransform(mouseXSpring, [-1, 1], ["-25deg", "25deg"])

              useEffect(() => {
                // 직접 호버 중이면 전역 감지 무시
                if (isDirectHover) return
                
                if (cardRef.current) {
                  const rect = cardRef.current.getBoundingClientRect()
                  const skillsRect = skillsRef.current?.getBoundingClientRect()
                  
                  if (skillsRect) {
                    // 카드의 전역 위치 계산
                    const cardCenterX = rect.left + rect.width / 2 - skillsRect.left
                    const cardCenterY = rect.top + rect.height / 2 - skillsRect.top
                    
                    // 마우스와 카드 중심 간의 거리 계산
                    const deltaX = globalMousePosition.x - cardCenterX
                    const deltaY = globalMousePosition.y - cardCenterY
                    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
                    
                    // 영향 범위를 더 크게 설정하여 카드 사이에서도 효과가 나타나도록
                    const maxDistance = 250
                    
                    if (distance < maxDistance) {
                      // 거리에 따른 강도 계산 - 더 부드러운 감소
                      const intensity = 1 - (distance / maxDistance)
                      
                      // 최소 강도 임계값을 낮춰서 더 민감하게 반응
                      if (intensity > 0.05) {
                        // 카드 경계를 고려한 더 정확한 위치 계산
                        const normalizedX = deltaX / (rect.width / 2)
                        const normalizedY = deltaY / (rect.height / 2)
                        
                        const xPct = normalizedX * intensity * 0.8 // 전역 효과 강도 대폭 증가
                        const yPct = normalizedY * intensity * 0.8
                        
                        x.set(Math.max(-1, Math.min(1, xPct))) // 전역 효과 범위를 직접 호버와 동일하게
                        y.set(Math.max(-1, Math.min(1, yPct)))
                      } else {
                        x.set(0)
                        y.set(0)
                      }
                    } else {
                      // 범위 밖이면 원래 위치로
                      x.set(0)
                      y.set(0)
                    }
                  }
                }
              }, [globalMousePosition.x, globalMousePosition.y, isDirectHover, cardRef, skillsRef])

              const handleMouseEnter = () => {
                setIsDirectHover(true)
              }

              const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
                const rect = event.currentTarget.getBoundingClientRect()
                const width = rect.width
                const height = rect.height
                const mouseX = event.clientX - rect.left
                const mouseY = event.clientY - rect.top
                
                // 카드 경계를 고려한 정확한 위치 계산
                const xPct = (mouseX / width - 0.5) * 2 // -1 ~ 1 범위로 확장
                const yPct = (mouseY / height - 0.5) * 2 // -1 ~ 1 범위로 확장
                
                x.set(Math.max(-1, Math.min(1, xPct)))
                y.set(Math.max(-1, Math.min(1, yPct)))
              }

              const handleMouseLeave = () => {
                setIsDirectHover(false)
                // 즉시 전역 효과로 전환하여 부드러운 연결
                setTimeout(() => {
                  if (cardRef.current) {
                    const rect = cardRef.current.getBoundingClientRect()
                    const skillsRect = skillsRef.current?.getBoundingClientRect()
                    
                    if (skillsRect) {
                      const cardCenterX = rect.left + rect.width / 2 - skillsRect.left
                      const cardCenterY = rect.top + rect.height / 2 - skillsRect.top
                      
                      const deltaX = globalMousePosition.x - cardCenterX
                      const deltaY = globalMousePosition.y - cardCenterY
                      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
                      
                      // 카드를 벗어났지만 여전히 영향권 내에 있다면 부드럽게 전환
                      if (distance < 250) {
                        const intensity = 1 - (distance / 250)
                        if (intensity > 0.05) {
                          const normalizedX = deltaX / (rect.width / 2)
                          const normalizedY = deltaY / (rect.height / 2)
                          
                          const xPct = normalizedX * intensity * 0.8 // 동일한 강도로 일관성 유지
                          const yPct = normalizedY * intensity * 0.8
                          
                          x.set(Math.max(-1, Math.min(1, xPct))) // 동일한 범위로 일관성 유지
                          y.set(Math.max(-1, Math.min(1, yPct)))
                        }
                      } else {
                        x.set(0)
                        y.set(0)
                      }
                    }
                  }
                }, 50) // 짧은 지연으로 부드러운 전환
              }

              return (
                <motion.div
                  key={tech.name}
                  ref={cardRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  onMouseEnter={handleMouseEnter}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    rotateY: rotateY,
                    rotateX: rotateX,
                    transformStyle: "preserve-3d",
                    perspective: 1000,
                  }}
                  className="group"
                  tabIndex={0}
                  role="article"
                  aria-label={`${tech.name} 기술 스택 정보`}
                  onFocus={handleMouseEnter}
                  onBlur={handleMouseLeave}
                >
                  <div className="relative bg-gradient-to-br from-background/60 via-background/40 to-background/60 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:border-white/30 dark:group-hover:border-white/20" style={{ transformStyle: "preserve-3d" }}>
                    {/* 3D 반투명 레이어 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 dark:via-white/2 dark:to-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* 글래스 이펙트 */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent dark:from-white/5 dark:via-white/2 dark:to-transparent" />
                    
                    {/* 아이콘 영역 */}
                    <motion.div 
                      className="relative z-10 text-4xl mb-6 transition-all duration-500 transform-gpu filter drop-shadow-lg"
                      whileHover={{ scale: 1.1, y: -8 }}
                    >
                      {tech.icon}
                    </motion.div>
                    
                    {/* 텍스트 영역 */}
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors duration-300 drop-shadow-sm">
                        {tech.name}
                      </h3>
                      <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300 leading-relaxed">
                        {tech.desc}
                      </p>
                    </div>
                    
                    {/* 하이라이트 효과 */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="text-center mt-20">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-primary/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-12 max-w-3xl mx-auto border border-primary/20 hover:border-primary/40 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <h3 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                함께 프로젝트를 시작해보세요
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                새로운 아이디어를 현실로 만들어드립니다.
              </p>
              <Link href="/contact">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="px-8 py-3 text-lg text-white bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    프로젝트 문의하기
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
