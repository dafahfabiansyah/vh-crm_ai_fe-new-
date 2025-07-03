"use client"
import NavigationSidebar from "@/components/navigation-sidebar"
import Topbar from "@/components/topbar"
import type { MainLayoutProps } from "@/types"

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <NavigationSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Content Topbar - positioned adjacent to sidebar */}
        <Topbar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-muted/30">{children}</main>
      </div>
    </div>
  )
}