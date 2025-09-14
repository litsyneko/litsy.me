"use client";

import React from "react";

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    // increase vertical size and spacing so the card feels larger on desktop
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-6">
      <div className="w-full max-w-lg glass-effect rounded-2xl p-8 shadow-xl border border-white/10">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">{title}</h1>
        {subtitle && <p className="text-base text-muted-foreground mb-6">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
