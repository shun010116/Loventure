// components/layouts/DesktopLayout.tsx
"use client";

export default function DesktopLayout({ children }: { children: React.ReactNode }) {
  return <div className="hidden sm:block">{children}</div>;
}