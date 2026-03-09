// components/layout/Backdrop.tsx
"use client";

import { useSidebar } from "@/context/SidebarContext";

export default function Backdrop() {
  const { isNavigatorOpen: isMobileOpen, setIsNavigatorOpen } = useSidebar();
  const toggleMobileSidebar = () => setIsNavigatorOpen(!isMobileOpen);


  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      onClick={toggleMobileSidebar}
    />
  );
}