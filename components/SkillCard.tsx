"use client";

import { motion } from "framer-motion";
import { useMemo, useRef } from "react";

type Tech = { name: string; desc: string; icon: React.ReactNode };

export default function SkillCard({
  tech,
  index,
  globalMousePosition,
  skillsRef,
}: {
  tech: Tech;
  index: number;
  globalMousePosition: { x: number; y: number };
  skillsRef: React.RefObject<HTMLDivElement>;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const tilt = useMemo(() => {
    if (!cardRef.current || !skillsRef.current) return { rx: 0, ry: 0 };
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = globalMousePosition.x - (rect.left - skillsRef.current.getBoundingClientRect().left) - rect.width / 2;
    const dy = globalMousePosition.y - (rect.top - skillsRef.current.getBoundingClientRect().top) - rect.height / 2;
    const rx = (-dy / (rect.height / 2)) * 6; // rotateX
    const ry = (dx / (rect.width / 2)) * 6; // rotateY
    return { rx: isFinite(rx) ? rx : 0, ry: isFinite(ry) ? ry : 0 };
  }, [globalMousePosition, skillsRef.current]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
      className="glass-effect rounded-2xl p-6 border border-white/10 shadow-sm hover-glow will-change-transform"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="text-xl">{tech.icon}</div>
        <div className="font-semibold">{tech.name}</div>
      </div>
      <p className="text-sm text-muted-foreground">{tech.desc}</p>
    </motion.div>
  );
}

