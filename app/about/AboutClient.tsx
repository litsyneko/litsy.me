"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  Code,
  Bot,
  Shield,
  Users,
  Rocket,
  Download,
  Heart,
  Lightbulb,
  Target,
  Zap,
  Globe,
  Briefcase,
  Coffee,
  MapPin,
  Clock,
  Mail,
  Star,
  ArrowRight,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutClient() {
  const heroRef = useRef<HTMLElement>(null)
  const experienceRef = useRef<HTMLElement>(null)
  const skillsRef = useRef<HTMLElement>(null)
  const philosophyRef = useRef<HTMLElement>(null)
  
  const heroInView = useInView(heroRef, { once: true })
  const experienceInView = useInView(experienceRef, { once: true })
  const skillsInView = useInView(skillsRef, { once: true })
  const philosophyInView = useInView(philosophyRef, { once: true })

  const experiences = [
    {
      year: "2020",
      title: "개발의 시작",
      subtitle: "Discord Bot에 푹 빠지다",
      description: "Discord 봇 개발에 완전히 빠져들었습니다. 처음 접한 프로그래밍의 세계에서 봇을 통해 커뮤니티를 더 재미있게 만드는 것에 매력을 느꼈습니다. 밤새워 코딩하며 새로운 기능들을 구현하는 재미에 푹 빠져있었던 시기입니다.",
      tech: ["Discord.js", "Node.js", "JavaScript"],
      projects: "개인 프로젝트 시작",
      icon: <Bot className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500"
    },
    {
      year: "2022",
      title: "첫 팀 경험",
      subtitle: "Team Alpha 합류",
      description: "Team Alpha에 합류하면서 처음으로 팀 개발을 경험했습니다. 정말 좋은 팀이었고 많은 것을 배웠지만, 각자의 사정으로 인해 팀이 해체되었습니다. 아쉬웠지만 협업의 중요성과 팀워크를 배울 수 있었던 소중한 경험이었습니다.",
      tech: ["Discord.js", "Team Collaboration", "Project Management"],
      projects: "팀 프로젝트 2개",
      icon: <Users className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      year: "2024",
      title: "새로운 관심사 발견",
      subtitle: "VTuber & AI의 세계",
      description: "VTuber와 AI 기술에 깊은 관심을 갖게 되었습니다. VTuber나 스트리머가 되고 싶다는 생각도 해보았고, AI 기술의 발전에 매료되어 관련 기술들을 학습하기 시작했습니다. 12월에는 '유나리'라는 닉네임으로 Discord 봇 개발 기반 팀에 합류했습니다.",
      tech: ["AI/ML", "Streaming Tech", "Content Creation"],
      projects: "개인 연구 및 학습",
      icon: <Rocket className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500"
    },
    {
      year: "2025",
      title: "새로운 출발",
      subtitle: "릿시로 거듭나다",
      description: "1월에 '릿시(Litsy)'로 닉네임을 변경하고 대학교에 합격했습니다. 3월부터 대학교에 재학하며 팀 Kunoplay에 합류했고, 8월에는 팀 이름이 HaruCream으로 변경되었습니다. 학업과 팀 활동을 병행하며 더욱 체계적인 개발자로 성장하고 있습니다.",
      tech: ["Next.js", "React", "TypeScript", "Team Development"],
      projects: "팀 HaruCream 활동 중",
      icon: <GraduationCap className="w-6 h-6" />,
      color: "from-indigo-500 to-purple-500"
    }
  ]

  const skills = {
    "Core Languages": {
      items: [
        "Node.js (5+ years)", 
        "JavaScript (5+ years)", 
        "TypeScript (1+ year)", 
        "Python (대학 과정)", 
        "C (대학 과정)"
      ],
      icon: <Code className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500"
    },
    "Web Development": {
      items: [
        "Discord.js (전문)", 
        "Express.js", 
        "Next.js (3개월, 학습 중)", 
        "React (3개월, 학습 중)", 
        "HTML/CSS (기초)"
      ],
      icon: <Globe className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500"
    },
    "Tools & Skills": {
      items: [
        "Git & GitHub", 
        "VS Code", 
        "Discord Bot Development", 
        "Server Management", 
        "Team Leadership", 
        "Project Management"
      ],
      icon: <Shield className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500"
    }
  }

  const personalValues = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "사용자 중심",
      description: "항상 사용자의 관점에서 생각하며 개발합니다"
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "지속적 학습",
      description: "새로운 기술과 트렌드를 끊임없이 탐구합니다"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "품질 추구",
      description: "완성도 높은 코드와 프로덕트를 만들기 위해 노력합니다"
    },
    {
      icon: <Coffee className="w-6 h-6" />,
      title: "팀워크",
      description: "협업을 통해 더 나은 결과를 만들어갑니다"
    }
  ]

  return (
    // ...existing UI code...
    // keep the full client UI as in the original page.tsx
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95 dark:from-background dark:to-background/90 relative overflow-hidden">
      {/* Dynamic background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.08),transparent_50%)]"></div>
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl animate-pulse opacity-60"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-secondary/5 dark:bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000 opacity-50"></div>
      
      <div className="relative z-10 pt-16 pb-12">
        {/* Enhanced Hero Section */}
        <section ref={heroRef} className="relative py-16 px-4 overflow-hidden">
          <div className="max-w-4xl mx-auto">
          {/* Profile Card - VKUI Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="bg-card/90 dark:bg-card/80 backdrop-blur-lg border border-border/80 dark:border-border/40 rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8 shadow-lg dark:shadow-2xl dark:shadow-primary/10"
          >
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 p-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-background">
                    <Image
                      src="/images/profile.png"
                      alt="LitsyNeko Avatar"
                      width={144}
                      height={144}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* Online Badge - Discord Style */}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 rounded-full border-3 sm:border-4 border-background flex items-center justify-center shadow-lg">
                  {/* Subtle pulsing effect */}
                  <div className="absolute inset-0 bg-emerald-500 rounded-full animate-pulse opacity-80"></div>
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 sm:gap-3 mb-4">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Litsy</h1>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm px-2 py-1">
                    University Student & Developer
                  </Badge>
                </div>
                
                <p className="text-base sm:text-lg text-muted-foreground mb-4 leading-relaxed">
                  &quot;2020년 Discord 봇 개발에 푹 빠진 여정이 지금의 저를 만들었습니다.&quot;<br className="hidden sm:block" />
                  <span className="block sm:inline mt-1 sm:mt-0">Team Alpha부터 현재 팀 HaruCream까지, 끊임없이 성장하는 대학생 개발자입니다.</span>
                </p>
                
                <div className="relative bg-gradient-to-r from-primary/8 via-primary/5 to-secondary/8 dark:from-primary/15 dark:via-primary/10 dark:to-secondary/15 border border-primary/30 dark:border-primary/25 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 backdrop-blur-lg shadow-md dark:shadow-xl">
                  {/* Subtle animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/4 to-secondary/4 dark:from-primary/8 dark:to-secondary/8 rounded-xl opacity-50 animate-pulse"></div>
                  
                  <div className="relative flex items-start gap-2 sm:gap-3">
                    {/* Status indicator */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                        <div className="absolute inset-0 w-2.5 h-2.5 bg-primary/70 rounded-full animate-ping opacity-75"></div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start sm:items-center justify-between mb-2 gap-2">
                        <h4 className="text-foreground font-semibold text-xs sm:text-sm tracking-wide leading-tight">프로필 변경 (방송/상업용)</h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <div className="w-1 h-1 bg-primary/70 rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-primary/70 rounded-full animate-pulse delay-100"></div>
                          <div className="w-1 h-1 bg-primary/70 rounded-full animate-pulse delay-200"></div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div>📅 2025.09.04 커미션 도착</div>
                        <div>⚡ 앞으로 SD 프로필로 활동예정.</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Korea</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>5+ years experience</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Link href="/contact" className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto text-sm sm:text-base py-3 sm:py-2 px-6 min-h-[44px]">
                        <Mail className="w-4 h-4 mr-2" />
                        연락하기
                      </Button>
                    </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: "Discord Bot", value: "7+", icon: "🤖" },
              { label: "Web Project", value: "12+", icon: "🌐" },
              { label: "총 개발 경험", value: "4+년", icon: "🗓️" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="bg-card/60 dark:bg-card/40 backdrop-blur-md border border-border/60 dark:border-border/50 rounded-xl p-4 sm:p-6 text-center hover:bg-card/80 dark:hover:bg-card/60 transition-all duration-300 shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl hover:border-primary/50 dark:hover:border-primary/40"
              >
                <div className="text-xl sm:text-2xl mb-2">{stat.icon}</div>
                <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 space-y-20">
        {/* Values Section - Enhanced */}
        <section className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/50"></div>
              <Heart className="w-5 h-5 text-primary/70" />
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/50"></div>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">핵심 가치</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">개발자로서 중요하게 생각하는 가치들과 철학입니다</p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {personalValues.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                className="bg-card/70 dark:bg-card/60 backdrop-blur-md border border-border/70 dark:border-border/40 rounded-xl p-4 sm:p-6 text-center hover:border-primary/40 dark:hover:border-primary/35 transition-all duration-300 group shadow-md dark:shadow-xl hover:shadow-lg dark:hover:shadow-2xl"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                  {value.icon}
                </div>
                <h3 className="font-semibold mb-2 text-foreground text-sm sm:text-base">{value.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Experience Timeline Section - Enhanced */}
        <section ref={experienceRef} className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={experienceInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/50"></div>
              <Rocket className="w-6 h-6 text-primary/70" />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/50"></div>
            </div>
            <h2 className="text-4xl font-bold mb-6 text-foreground bg-gradient-to-r from-foreground via-primary/80 to-foreground bg-clip-text">개발 여정</h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Discord 봇 개발로 시작된 프로그래밍 여정부터 현재의 풀스택 개발자가 되기까지의 이야기입니다
            </p>
          </motion.div>
          
          <div className="relative max-w-5xl mx-auto px-4 md:px-0 pl-8 md:pl-0">
            {/* Enhanced Timeline Line (mobile: left gutter, desktop: center) */}
            <div className="absolute left-3 md:left-1/2 md:transform md:-translate-x-1/2 top-0 bottom-0 w-0.5 md:w-1 bg-gradient-to-b from-primary/60 via-primary/40 via-secondary/40 to-transparent rounded-full" />
            <div className="absolute left-3 md:left-1/2 md:transform md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/80 via-secondary/80 to-transparent rounded-full" />
            
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={experienceInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`relative flex flex-col md:items-center md:flex-row md:justify-between mb-8 sm:mb-12 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Enhanced Timeline Dot */}
                <div className="absolute left-3 md:left-1/2 md:transform md:-translate-x-1/2 z-10 -translate-x-1/2">
                  <div className="relative w-5 h-5 sm:w-6 sm:h-6">
                    <div className="absolute inset-0 bg-primary rounded-full border-3 sm:border-4 border-background shadow-lg"></div>
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-0.5 sm:inset-1 bg-gradient-to-br from-primary to-primary/80 rounded-full"></div>
                  </div>
                </div>
                
                {/* Enhanced Year Badge */}
                <div className="absolute left-8 sm:left-10 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-10 z-20 -translate-y-1">
                  <Badge className="bg-gradient-to-r from-primary to-primary/90 text-white font-bold px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm shadow-lg border border-primary/20 backdrop-blur-sm">
                    {exp.year}
                  </Badge>
                </div>
                
                {/* Content Card */}
                <div className={`w-full md:w-5/12 ml-12 sm:ml-16 md:ml-0 mt-8 sm:mt-10 md:mt-0 ${
                  index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                }`}>
                  <div className="bg-card/80 dark:bg-card/70 backdrop-blur-lg border border-border/60 dark:border-border/40 rounded-xl p-4 sm:p-6 hover:border-primary/40 dark:hover:border-primary/35 transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl group shadow-md dark:shadow-lg">
                    <div className="flex items-start sm:items-center gap-3 mb-3 sm:mb-4">
                      <div className={`p-1.5 sm:p-2 bg-gradient-to-br ${exp.color} rounded-lg text-white flex-shrink-0`}>
                        {exp.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
                          {exp.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
                          {exp.subtitle}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                      {exp.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {exp.tech.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline" className="text-xs bg-background/90 dark:bg-background/70 border-border/80 dark:border-border/50 text-foreground hover:border-primary/50 dark:hover:border-primary/45 hover:bg-primary/8 dark:hover:bg-primary/15 transition-colors px-2 py-1">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{exp.projects}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Skills Section - Enhanced */}
        <section ref={skillsRef} className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={skillsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-px bg-gradient-to-r from-transparent to-secondary/50"></div>
              <Code className="w-5 h-5 text-secondary/70" />
              <div className="w-10 h-px bg-gradient-to-l from-transparent to-secondary/50"></div>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-foreground bg-gradient-to-r from-foreground to-secondary/80 bg-clip-text">기술 스택</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">현재 활용하고 있는 기술들과 지속적으로 학습 중인 분야들입니다</p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {Object.entries(skills).map(([category, data], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={skillsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: categoryIndex * 0.2 }}
                className="group"
              >
                <div className="bg-card/80 dark:bg-card/70 backdrop-blur-lg border border-border/70 dark:border-border/40 rounded-xl p-4 sm:p-6 h-full hover:border-primary/40 dark:hover:border-primary/35 hover:bg-card/90 dark:hover:bg-card/80 transition-all duration-300 group-hover:shadow-lg dark:group-hover:shadow-xl group-hover:shadow-primary/5 dark:group-hover:shadow-primary/15 shadow-md dark:shadow-lg">
                  <div className="text-center mb-4 sm:mb-6">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-gradient-to-br ${data.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                      {data.icon}
                    </div>
                    <h3 className="font-semibold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">
                      {category}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                    {data.items.map((skill, skillIndex) => (
                      <motion.div
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={skillsInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.4, delay: categoryIndex * 0.2 + skillIndex * 0.05 }}
                      >
                        <Badge
                          variant="outline"
                          className="bg-background/90 dark:bg-background/70 border-border/80 dark:border-border/50 hover:border-primary/50 dark:hover:border-primary/45 hover:bg-primary/8 dark:hover:bg-primary/15 text-foreground hover:text-primary transition-all duration-300 cursor-default text-xs font-medium backdrop-blur-md shadow-sm dark:shadow-md px-2.5 py-1.5 min-h-[32px] flex items-center"
                        >
                          {skill}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Philosophy Section - Enhanced */}
  <section ref={philosophyRef} className="py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={philosophyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="max-w-5xl mx-auto bg-gradient-to-br from-card/90 via-card/80 to-card/70 dark:from-card/80 dark:via-card/70 dark:to-card/60 backdrop-blur-xl border border-border/80 dark:border-border/40 rounded-2xl p-6 shadow-2xl dark:shadow-3xl relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 dark:bg-secondary/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center shadow-lg">
                  <Lightbulb className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-4xl font-bold mb-6 text-foreground bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text">개발 철학</h2>
                
                <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
                  <p>
                    <span className="text-primary font-semibold">"2020년 Discord 봇에 푹 빠진 것"</span>이 모든 시작이었습니다. 
                    밤새워 코딩하며 새로운 기능을 구현하던 그 열정이 지금까지도 저를 움직이는 원동력입니다.
                  </p>
                  <p>
                    <span className="text-primary font-semibold">"Team Alpha에서 배운 협업의 가치"</span>는 소중한 자산이 되었습니다. 
                    좋은 팀이었지만 각자의 사정으로 해체되었던 경험을 통해, 현재 팀 HaruCream에서는 더욱 단단한 팀워크를 만들어가고 있습니다.
                  </p>
                  <p>
                    <span className="text-primary font-semibold">"VTuber와 AI에 대한 관심"</span>도 개발에 새로운 영감을 줍니다.
                    유나리에서 릿시로 이름을 바꾸며 새로운 출발을 한 것처럼, 항상 새로운 도전을 두려워하지 않는 개발자입니다.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-6">
                    <Star className="w-5 h-5 text-yellow-500 fill-current dark:text-yellow-400" />
                    <span className="text-base italic text-muted-foreground font-medium">
                                            &quot;끊임없는 열정과 새로운 도전, 그리고 팀과 함께하는 성장";

                    </span>
                    <Star className="w-5 h-5 text-yellow-500 fill-current dark:text-yellow-400" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA Section - Enhanced */}
        <section className="py-16">
          <div className="text-center">
            <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary/10 via-primary/8 to-secondary/10 dark:from-primary/20 dark:via-primary/15 dark:to-secondary/20 border border-primary/40 dark:border-primary/35 rounded-2xl p-12 shadow-xl dark:shadow-2xl backdrop-blur-xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-secondary/10 dark:bg-secondary/20 rounded-full blur-xl animate-pulse delay-500"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 mb-6">
                  <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/60"></div>
                  <Zap className="w-6 h-6 text-primary" />
                  <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/60"></div>
                </div>
                <h3 className="text-3xl font-bold mb-6 text-foreground bg-gradient-to-r from-foreground via-primary/90 to-foreground bg-clip-text">함께 만들어가요</h3>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                  Discord 봇부터 웹 애플리케이션까지, 여러분의 아이디어를 현실로 만들어드립니다.<br />
                  작은 기능부터 큰 프로젝트까지, 언제든 편하게 연락주세요.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button size="lg" className="w-full sm:w-auto text-white bg-gradient-to-r from-primary to-blue-600 rounded-2xl shadow-2xl px-6 py-3 ring-1 ring-primary/20 hover:from-primary/90 hover:to-blue-600/90 transition-all duration-300">
                      프로젝트 문의하기
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/projects">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto border-2 border-primary/30 hover:border-primary hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary transition-all duration-300 bg-transparent"
                    >
                      포트폴리오 보기
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        </div>
      </div>
    </div>
  )
}
