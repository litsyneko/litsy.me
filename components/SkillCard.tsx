import React, { useRef, useState, useEffect } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { FaReact, FaNodeJs, FaDiscord } from "react-icons/fa"
import { SiNextdotjs, SiTypescript } from "react-icons/si"
import { MdDesignServices } from "react-icons/md"

interface SkillCardProps {
  tech: {
    name: string;
    desc: string;
    icon: React.ReactNode;
  };
  index: number;
  globalMousePosition: { x: number; y: number };
  // Accept the nullable ref shape produced by useRef<HTMLDivElement>(null)
  skillsRef: React.RefObject<HTMLDivElement | null>;
}

const SkillCard: React.FC<SkillCardProps> = ({
  tech,
  index,
  globalMousePosition,
  skillsRef,
}) => {
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
}

export default SkillCard
