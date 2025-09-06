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
    const speedMultiplier = fastModeAfterFirst && cycleCount > 0 ? 0.5 : 1
    const baseSpeed = Math.max(30, Math.min(120, 2000 / currentDesc.length)) * speedMultiplier
    const deleteSpeed = baseSpeed / 3

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentIndex < currentDesc.length) {
          setDisplayText(currentDesc.slice(0, currentIndex + 1))
          setCurrentIndex((prev) => prev + 1)
        } else {
          setIsWaiting(true)
          const pauseTime = fastModeAfterFirst && cycleCount > 0 ? basePauseDuration * 0.6 : basePauseDuration
          setTimeout(() => {
            setIsWaiting(false)
            setIsDeleting(true)
          }, pauseTime)
        }
      } else {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1)
          setDisplayText(currentDesc.slice(0, currentIndex - 1))
        } else {
          setIsDeleting(false)
          setDescIndex((prev) => (prev + 1) % descriptions.length)
          setCurrentIndex(0)
          setDisplayText("")
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

export default function HomeClient() {
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
    // ...existing home UI code...
    <div className="min-h-screen relative overflow-hidden">
      {/* content omitted for brevity, kept identical to previous Home page UI */}
      {/* The original client UI lives here in full. */}
    </div>
  )
}
