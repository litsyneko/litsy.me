"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = {
  id: number;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error";
  duration?: number; // ms
};

type ToastContextType = {
  show: (t: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    const toast: Toast = { id, duration: 2800, variant: "default", ...t };
    setToasts((prev) => [...prev, toast]);
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), toast.duration);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`min-w-64 max-w-sm rounded-md px-4 py-3 shadow-lg border text-sm backdrop-blur-md glass-effect ${
              t.variant === "success"
                ? "border-emerald-400/30"
                : t.variant === "error"
                ? "border-red-400/30"
                : "border-white/15"
            }`}
            role="status"
            aria-live="polite"
          >
            {t.title && <div className="font-medium mb-0.5">{t.title}</div>}
            {t.description && <div className="text-muted-foreground">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

