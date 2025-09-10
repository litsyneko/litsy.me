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
  const cardRef = useRef<HTMLDivElement>(null);

  // 통합 마우스/터치 핸들러
  const handleInteractionMove = (e: MouseEvent | TouchEvent) => {
    if (!cardRef.current) return;
    const { clientX, clientY } = 'touches' in e ? e.touches[0] : e;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = clientX - left - width / 2;
    const y = clientY - top - height / 2;
    const rotateX = (y / height) * -30;
    const rotateY = (x / width) * 30;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`;
  };

  const handleInteractionEnd = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }
  };

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.addEventListener('mousemove', handleInteractionMove);
    card.addEventListener('mouseleave', handleInteractionEnd);
    card.addEventListener('touchmove', handleInteractionMove);
    card.addEventListener('touchend', handleInteractionEnd);
    card.addEventListener('touchcancel', handleInteractionEnd);
    return () => {
      card.removeEventListener('mousemove', handleInteractionMove);
      card.removeEventListener('mouseleave', handleInteractionEnd);
      card.removeEventListener('touchmove', handleInteractionMove);
      card.removeEventListener('touchend', handleInteractionEnd);
      card.removeEventListener('touchcancel', handleInteractionEnd);
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="card-container flex items-center justify-center w-full h-full">
        <div
          ref={cardRef}
          className="card relative w-[350px] h-[450px] bg-card rounded-2xl shadow-lg transition-transform duration-300 ease-out"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 카드 내부 요소를 여기에 추가하세요 */}
        </div>
      </div>
    </div>
  );
}

