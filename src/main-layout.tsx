"use client"
import { useState } from "react"
import NavigationSidebar from "@/components/navigation-sidebar"
import Topbar from "@/components/topbar"
import { Toaster } from "@/components/ui/sonner"
import type { MainLayoutProps } from "@/types"

export default function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <NavigationSidebar
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Content Topbar - positioned adjacent to sidebar */}
        <Topbar
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-muted/30">{children}</main>
      </div>
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}