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
            role={t.variant === "error" ? "alert" : "status"}
            aria-live={t.variant === "error" ? "assertive" : "polite"}
            className={`min-w-64 max-w-sm rounded-lg px-4 py-3 shadow-2xl text-sm backdrop-blur-md flex items-start gap-3 transform transition-all duration-150 ${
              t.variant === "success"
                ? "bg-emerald-600 text-white border-emerald-600"
                : t.variant === "error"
                ? "bg-red-700/98 text-white border-red-700 shadow-[0_8px_30px_rgba(220,38,38,0.18)] scale-100"
                : "border border-white/15 glass-effect bg-white/5"
            }`}
            style={{ minWidth: 320 }}
          >
            {/* Icon column */}
            <div className="mt-0.5 flex-shrink-0">
              {t.variant === "success" ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15 5 11.586a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : t.variant === "error" ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 112 0v2a1 1 0 11-2 0v-2zm0-6a1 1 0 112 0v4a1 1 0 11-2 0V7z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M2.003 9.25A8 8 0 1117.75 10H10L2.003 9.25z" />
                </svg>
              )}
            </div>

            <div className="min-w-0">
              {t.title && <div className="font-semibold mb-0.5 text-sm">{t.title}</div>}
              {t.description && (
                <div className={`${t.variant === "error" ? "text-white font-medium" : t.variant === "success" ? "text-white" : "text-muted-foreground"}`}>
                  {t.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
