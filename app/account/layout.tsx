import type { ReactNode } from "react";

// Account-only layout: overrides page background for a service-style look
// without touching the global site layout. The fixed overlay sits above the
// global decorative layers (-z indices) and below the page content.

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative theme-personal">
      {/* Account background overlay (solid, no translucent gradient) */}
      <div className="fixed inset-0 z-0 bg-background" />

      {/* Content above the overlay */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
