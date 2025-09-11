

"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Smile, Compass } from "lucide-react"

export default function NotFound() {
  const messages = [
    "여기엔 아무 것도 없네요... 🫥",
    "길을 잃으셨나요? 제가 안내할게요.",
    "이 페이지는 잠깐 산책을 떠났습니다.",
    "404 — 하지만 새로운 아이디어는 언제나 열려있어요!",
  ]
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 3800)
    return () => clearInterval(t)
  }, [messages.length])

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-background">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-12 left-6 w-64 h-64 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl animate-morphing-blob" />
        <div className="absolute bottom-12 right-6 w-96 h-96 bg-gradient-to-r from-accent/15 to-primary/15 rounded-full blur-3xl animate-morphing-blob" />
      </div>

      <main className="px-4 py-24 w-full">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-3 px-4 py-2 rounded-full glass-effect">
              <Smile className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">깜짝 404</span>
            </div>

            <h1 className="text-7xl md:text-8xl font-extrabold mb-6 leading-tight gradient-text">
              <span className="inline-block">4</span>
              <span className="inline-block ml-3 mr-3 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">0</span>
              <span className="inline-block">4</span>
            </h1>

            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl"
            >
              {messages[idx]}
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" className="px-6 py-3 bg-gradient-to-r from-primary to-blue-500 shadow-lg hover:shadow-xl transition-all duration-200">
                    홈으로 돌아가기
                  </Button>
                </motion.div>
              </Link>

              <Link href="/projects">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="outline" size="lg" className="px-6 py-3">
                    프로젝트 보기
                  </Button>
                </motion.div>
              </Link>

              <Link href="/contact">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" className="px-6 py-3">
                    문의하기
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-3xl overflow-visible">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -top-6 -left-6 w-80 h-80 rounded-3xl overflow-hidden glass-effect p-2 shadow-2xl"
              >
                <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 p-2">
                  <div className="w-full h-full rounded-xl overflow-hidden bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <Image
                      src="/images/profile.png"
                      alt="lost character"
                      width={520}
                      height={520}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute bottom-4 left-4 bg-background/70 backdrop-blur-sm rounded-full px-3 py-2 border border-white/10"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-primary" />
                  <span className="text-sm">길찾기 팁: 상단의 내비게이션을 사용해보세요</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}