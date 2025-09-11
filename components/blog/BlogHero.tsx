"use client"

import { useState, useEffect } from "react"

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
  }, [currentIndex, descIndex, isDeleting, descriptions, basePauseDuration, isWaiting, hasStarted, cycleCount, fastModeAfterFirst])

  return { displayText, showCursor }
}

const BLOG_DESCRIPTIONS = [
  "Exploring Next.js and React",
  "Thoughts on Web Development",
  "Backend Adventures with Supabase",
  "Modern UI/UX Design Patterns",
  "And occasional daily life stories",
]

export default function BlogHero() {
  const { displayText, showCursor } = useDescriptionTypewriter(BLOG_DESCRIPTIONS, 2500, 1000, true)

  return (
    <div className="text-center py-16 md:py-24">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
        Litsy's Log
      </h1>
      <p className="mt-4 text-lg md:text-xl text-muted-foreground h-8">
        {displayText}
        {showCursor && <span className="animate-pulse">|</span>}
      </p>
    </div>
  )
}
