"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Code, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import SkillCard from "@/app/components/SkillCard";
import { FaReact, FaNodeJs, FaDiscord } from "react-icons/fa";
import { SiNextdotjs, SiTypescript } from "react-icons/si";
import { MdDesignServices } from "react-icons/md";

function useDescriptionTypewriter(descriptions: string[], basePauseDuration = 3000, initialDelay = 0, fastModeAfterFirst = false) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [descIndex, setDescIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [isWaiting, setIsWaiting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    const cursorInterval = setInterval(() => setShowCursor((p) => !p), 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (initialDelay > 0 && !hasStarted) {
      const t = setTimeout(() => setHasStarted(true), initialDelay);
      return () => clearTimeout(t);
    } else if (initialDelay === 0) {
      setHasStarted(true);
    }
  }, [initialDelay, hasStarted]);

  useEffect(() => {
    if (!hasStarted || isWaiting) return;
    const currentDesc = descriptions[descIndex] ?? "";
    const speedMultiplier = fastModeAfterFirst && cycleCount > 0 ? 0.5 : 1;
    const baseSpeed = Math.max(30, Math.min(120, 2000 / Math.max(1, currentDesc.length))) * speedMultiplier;
    const deleteSpeed = baseSpeed / 3;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentIndex < currentDesc.length) {
          setDisplayText(currentDesc.slice(0, currentIndex + 1));
          setCurrentIndex((p) => p + 1);
        } else {
          setIsWaiting(true);
          const pauseTime = fastModeAfterFirst && cycleCount > 0 ? basePauseDuration * 0.6 : basePauseDuration;
          setTimeout(() => { setIsWaiting(false); setIsDeleting(true); }, pauseTime);
        }
      } else {
        if (currentIndex > 0) {
          setCurrentIndex((p) => p - 1);
          setDisplayText(currentDesc.slice(0, currentIndex - 1));
        } else {
          setIsDeleting(false);
          setDescIndex((p) => (p + 1) % descriptions.length);
          setCurrentIndex(0);
          setDisplayText("");
          if (descIndex === descriptions.length - 1) setCycleCount((p) => p + 1);
        }
      }
    }, isDeleting ? deleteSpeed : baseSpeed);
    return () => clearTimeout(timeout);
  }, [currentIndex, descIndex, isDeleting, descriptions, basePauseDuration, isWaiting, hasStarted, cycleCount, fastModeAfterFirst]);

  return { displayText, showCursor } as const;
}

export default function Home() {
  const [globalMousePosition, setGlobalMousePosition] = useState({ x: 0, y: 0 });
  const skillsRef = useRef<HTMLDivElement>(null);

  const names = ["Litsy", "릿시", "リッシnEKO"];
  const { displayText: typedName, showCursor: nameShowCursor } = useDescriptionTypewriter(names, 1500, 0, true);
  const { displayText: typedDescription, showCursor: descShowCursor } = useDescriptionTypewriter(
    ["사용자 경험을 최우선으로 생각하는 개발자", "HaruCream", "KSNU", "Korea", "Developer", "Discord Server Manager"],
    2500,
    1200
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!skillsRef.current) return;
      const rect = skillsRef.current.getBoundingClientRect();
      setGlobalMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="theme-personal">
      {/* HERO — Reference style */}
      <section className="relative px-4 pt-28 pb-20">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 items-start gap-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-effect text-xs text-primary">
              <Sparkles className="w-4 h-4" /> Frontend Developer
            </div>
            <div className="mt-6 flex items-start gap-6">
              <div className="mt-1 h-[140px] md:h-[200px] w-[2px] rounded-full bg-gradient-to-b from-[var(--primary)] to-transparent" />
              <h1 className="text-[44px] md:text-[88px] font-extrabold leading-[1.05] tracking-[-0.02em] text-foreground">
                {/* 모바일: 줄바꿈 유지 */}
                <span className="block md:hidden">안녕하세요,</span>
                {/* 데스크톱: 같은 줄에 배치 */}
                <span className="hidden md:flex md:flex-wrap md:items-baseline">
                  <span>안녕하세요,&nbsp;</span>
                  <span
                    className="bg-gradient-to-r from-[var(--primary)] to-blue-400 bg-clip-text text-transparent inline-block align-baseline"
                    style={{ minWidth: `${Math.max(typedName.length * 0.6, 8)}ch` }}
                  >
                    {typedName}
                    <span
                      className={`inline-block w-0.5 h-[0.8em] bg-[var(--primary)] ml-1 transition-opacity ${nameShowCursor ? "opacity-100" : "opacity-0"}`}
                    />
                  </span>
                </span>
                <span className="block">입니다</span>
              </h1>
            </div>
            <div className="mt-4 h-10 flex items-center">
              <p className="text-xl text-muted-foreground max-w-2xl">
                {typedDescription}
                <span className={`inline-block w-0.5 h-[0.8em] bg-[var(--primary)] ml-1 transition-opacity ${descShowCursor ? "opacity-100" : "opacity-0"}`} />
              </p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/projects">
                <Button size="lg" className="btn-modern px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl">
                  <Code className="w-5 h-5 mr-2" /> 프로젝트 보기
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" className="px-8 py-3 text-lg bg-gradient-to-r from-[var(--secondary)] to-blue-600 text-white rounded-2xl shadow-2xl ring-1 ring-[var(--primary)]/20 hover:opacity-95">
                  프로젝트 문의하기
                </Button>
              </Link>
            </div>
          </div>

          {/* Avatar tile - Main profile container */}
          <div className="justify-self-center lg:justify-self-center self-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="relative"
            >
              <div className="relative w-80 h-80 md:w-96 md:h-96">
                {/* Background decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl blur-xl md:blur-2xl md:animate-pulse-glow mobile-no-anim" />
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-accent to-primary rounded-2xl opacity-80 md:animate-float mobile-no-anim" />
                <div
                  className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-secondary to-accent rounded-full opacity-60 md:animate-float mobile-no-anim"
                  style={{ animationDelay: "2s" }}
                />

                {/* Main profile container */}
                <motion.div
                  className="relative w-full h-full glass-effect mobile-low-blur rounded-3xl p-8 hover-lift"
                  animate={{ y: [0, -10, 0], rotate: [0, 2, -2, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4, ease: "easeInOut" }}
                >
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 p-2">
                    <motion.div
                      className="w-full h-full rounded-xl overflow-hidden bg-background/80 backdrop-blur-sm"
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 220, damping: 20 }}
                    >
                      <Image
                        src="/images/profile.png"
                        alt="LitsyNeko 프로필"
                        width={400}
                        height={400}
                        className="w-full h-full object-cover"
                        priority
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[{ number: "4+", text: "년간 개발 경험", icon: "🚀" }, { number: "∞", text: "지속적인 학습", icon: "📚" }, { number: "100%", text: "사용자 중심", icon: "❤️" }].map((item) => (
            <div key={item.text} className="glass-effect rounded-2xl p-8 text-center hover-glow transition-all">
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="text-4xl font-black gradient-text mb-2">{item.number}</div>
              <div className="text-muted-foreground font-medium">{item.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects placeholder */}
      <section className="py-24 px-4 bg-gradient-to-br from-muted/30 to-primary/5">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">대표 프로젝트</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">현재 개발 중인 프로젝트들이 완성되면 여기에 소개할 예정입니다.</p>
          <div className="mt-10">
            <Link href="/projects">
              <Button variant="outline" size="lg" className="px-8 py-3 border-2 border-[var(--primary)]/30 hover:border-[var(--primary)] hover:bg-[var(--primary)]/10">
                모든 프로젝트 보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-24 px-4" ref={skillsRef}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-10 gradient-text text-center">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "React", desc: "컴포넌트 기반 UI 개발", icon: <FaReact className="text-blue-500" /> },
              { name: "Next.js", desc: "풀스택 React 프레임워크", icon: <SiNextdotjs className="text-white" /> },
              { name: "TypeScript", desc: "타입 안전한 JavaScript", icon: <SiTypescript className="text-blue-600" /> },
              { name: "Node.js", desc: "서버사이드 JavaScript", icon: <FaNodeJs className="text-green-600" /> },
              { name: "Discord Bot", desc: "봇 개발 및 API 연동", icon: <FaDiscord className="text-indigo-500" /> },
              { name: "UI/UX Design", desc: "사용자 중심 인터페이스", icon: <MdDesignServices className="text-pink-500" /> },
            ].map((tech, index) => (
              <SkillCard key={tech.name} tech={tech} index={index} globalMousePosition={globalMousePosition} skillsRef={skillsRef} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
