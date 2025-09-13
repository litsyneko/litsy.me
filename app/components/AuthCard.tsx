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
    <div className="flex min-h-[70vh] items-center justify-center py-10 px-4">
      <div className="w-full max-w-sm glass-effect rounded-2xl p-6 shadow-lg border border-white/10">
        <h1 className="text-2xl font-bold mb-1 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

