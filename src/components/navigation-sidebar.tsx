"use client";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, ChevronDown, TreePine, X, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types";
import { navigationItems, bottomNavigationItems } from "@/mock/data";
import { usePipelineList } from "@/hooks/usePipeline";
import { AuthService } from "../services/authService";
import { getCurrentSubscription } from "../services/transactionService";

interface NavigationSidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export default function NavigationSidebar({
  isMobileOpen: externalMobileOpen,
  setIsMobileOpen: externalSetMobileOpen,
}: NavigationSidebarProps = {}) {
  const location = useLocation();
  const pathname = location.pathname;
  const [expandedItems, setExpandedItems] = useState<string[]>(["pipeline"]);
  const [isHovered, setIsHovered] = useState(false);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Ambil role user sekali saja saat komponen mount
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);
  const subscriptionCheckedRef = useRef(false);

  // Pipeline list hook
  const { pipelines, fetchPipelines } = usePipelineList();

  // Use external mobile state if provided, otherwise use internal state
  const isMobileOpen = externalMobileOpen !== undefined ? externalMobileOpen : internalMobileOpen;
  const setIsMobileOpen = externalSetMobileOpen || setInternalMobileOpen;

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch pipelines when component mounts
  useEffect(() => {
    fetchPipelines().catch(error => {
      console.error('Failed to fetch pipelines:', error);
    });
  }, []);

  // Ambil role user sekali saja saat komponen mount
  useEffect(() => {
    setUserRole(AuthService.getRoleFromToken());
  }, []);

  // Fetch subscription status on mount (only once per session)
  useEffect(() => {
    if (subscriptionCheckedRef.current) return;
    subscriptionCheckedRef.current = true;
    getCurrentSubscription()
      .then((res) => {
        if (res?.data && res.data.package_name) {
          setHasActiveSubscription(true);
        } else {
          setHasActiveSubscription(false);
        }
      })
      .catch(() => {
        setHasActiveSubscription(false);
      });
  }, []);

  // Create enhanced navigation items with dynamic pipeline list
  let filteredNavigationItems = navigationItems;
  if (userRole?.toLowerCase() === "manager") {
    filteredNavigationItems = navigationItems.filter(item => item.id !== "ai-agents");
  }
  const enhancedNavigationItems = filteredNavigationItems.map(item => {
    if (item.id === "pipeline") {
      // Add pipeline list to the pipeline item
      const pipelineChildren = [
        {
          id: "create-pipeline",
          label: "Create Pipeline",
          icon: item.children?.[0]?.icon || GitBranch,
          href: "/pipeline/create",
        },
        // Add pipelines from API
        ...pipelines.map(pipeline => ({
          id: `pipeline-${pipeline.id}`,
          label: pipeline.name,
          icon: GitBranch,
          href: `/pipeline?id=${pipeline.id}`,
        }))
      ];

      return {
        ...item,
        children: pipelineChildren
      };
    }
    return item;
  });

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isItemActive = (item: NavigationItem): boolean => {
    if (isActive(item.href)) return true;
    if (item.children) {
      return item.children.some(child => isActive(child.href));
    }
    return false;
  };
  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const itemIsActive = isItemActive(item);
    const shouldShowExpanded = isMobile ? isMobileOpen : isHovered;
    
    // Calculate padding based on level
    const paddingLeft = level > 0 && shouldShowExpanded ? { paddingLeft: `${24 + level * 16}px` } : {};

    if (hasChildren) {
      return (
        <Collapsible
          key={item.id}
          open={shouldShowExpanded && isExpanded}
          onOpenChange={() => shouldShowExpanded && toggleExpanded(item.id)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-11 font-normal text-muted-foreground hover:text-foreground hover:bg-accent/50",
                !shouldShowExpanded ? "px-3" : "px-3",
                itemIsActive && "bg-primary/10 text-primary border-r-2 border-r-primary"
              )}
              style={paddingLeft}
            >
              <item.icon className={cn("h-4 w-4 flex-shrink-0", shouldShowExpanded && "mr-3")} />
              <div
                className={cn(
                  "flex items-center flex-1 transition-all duration-300 ease-in-out overflow-hidden",
                  shouldShowExpanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
                )}
              >
                <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
                )}
              </div>
            </Button>
          </CollapsibleTrigger>
          {shouldShowExpanded && (
            <CollapsibleContent className="space-y-1">
              {item.children?.map((child) => renderNavigationItem(child, level + 1))}
            </CollapsibleContent>
          )}
        </Collapsible>
      );
    }

    if (item.href) {
      return (
        <Link key={item.id} to={item.href} onClick={() => setIsMobileOpen(false)}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-11 font-normal text-muted-foreground hover:text-foreground hover:bg-accent/50",
              !shouldShowExpanded ? "px-3" : "px-3",
              itemIsActive && "bg-primary/10 text-primary border-r-2 border-r-primary"
            )}
            style={paddingLeft}
          >
            <item.icon className={cn("h-4 w-4 flex-shrink-0", shouldShowExpanded && "mr-3")} />
            <div
              className={cn(
                "flex items-center flex-1 transition-all duration-300 ease-in-out overflow-hidden",
                shouldShowExpanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
              )}
            >
              <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
          </Button>
        </Link>
      );
    }

    return (
      <div key={item.id}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-11 font-normal text-muted-foreground hover:text-foreground hover:bg-accent/50",
            !shouldShowExpanded ? "px-3" : "px-3",
            itemIsActive && "bg-primary/10 text-primary border-r-2 border-r-primary"
          )}
          style={paddingLeft}
          disabled={userRole?.toLowerCase() === "manager" && !hasActiveSubscription}
          title={userRole?.toLowerCase() === "manager" && !hasActiveSubscription ? "Manager tidak dapat mengakses menu" : undefined}
        >
          <item.icon className={cn("h-4 w-4 flex-shrink-0", shouldShowExpanded && "mr-3")} />
          <div
            className={cn(
              "flex items-center flex-1 transition-all duration-300 ease-in-out overflow-hidden",
              shouldShowExpanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
            )}
          >
            <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                {item.badge}
              </Badge>
            )}
          </div>
        </Button>
      </div>
    );
  };

  return (
    <>
      {/* Overlay to disable sidebar if Manager and NOT subscribed */}
      {userRole?.toLowerCase() === "manager" && !hasActiveSubscription && (
        <div
          style={{ position: "fixed", zIndex: 1000, top: 0, left: 0, width: "16rem", height: "100vh", background: "rgba(255,255,255,0)", cursor: "not-allowed" }}
          className="hidden lg:block"
        />
      )}
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div
          className={cn(
            "flex flex-col h-full bg-card border-r border-border transition-all duration-300 ease-in-out relative",
            "w-16" // Always keep the collapsed width as base
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Expanded overlay */}
          <div
            className={cn(
              "absolute left-0 top-0 h-full bg-card border-r border-border shadow-lg z-50 flex flex-col transition-all duration-300 ease-in-out",
              isHovered ? "w-64 opacity-100" : "w-16 opacity-0 pointer-events-none"
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full flex-shrink-0">
                  <TreePine className="h-5 w-5 text-green-600" />
                </div>
                <div
                  className={cn(
                    "transition-all duration-300 ease-in-out overflow-hidden",
                    isHovered ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
                  )}
                >
                  <h1 className="text-lg font-semibold text-foreground whitespace-nowrap">
                    Tumbuhin
                  </h1>
                </div>
              </div>
            </div>
            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
              <nav className="space-y-1 px-2">
                {enhancedNavigationItems.map((item) => renderNavigationItem(item))}
              </nav>
            </div>
            {/* Bottom Navigation */}
            <div className="border-t border-border p-2">
              <nav className="space-y-1">
                {bottomNavigationItems.map((item) => renderNavigationItem(item))}
              </nav>
            </div>
          </div>
          {/* Collapsed sidebar - always visible */}
          <div className="flex flex-col h-full">
            {/* Header - collapsed */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-center">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                  <TreePine className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
            {/* Main Navigation - collapsed (icons only) */}
            <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
              <nav className="space-y-1 px-2">
                {enhancedNavigationItems.map((item) => (
                  <div key={item.id}>
                    {item.href ? (
                      <Link to={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-center h-11 px-3 font-normal text-muted-foreground hover:text-foreground hover:bg-accent/50",
                            isItemActive(item) && "bg-primary/10 text-primary"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-center h-11 px-3 font-normal text-muted-foreground hover:text-foreground hover:bg-accent/50",
                          isItemActive(item) && "bg-primary/10 text-primary"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </nav>
            </div>
            {/* Bottom Navigation - collapsed */}
            <div className="border-t border-border p-2">
              <nav className="space-y-1">
                {bottomNavigationItems.map((item) => (
                  <div key={item.id}>
                    {item.href ? (
                      <Link to={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-center h-11 px-3 font-normal text-muted-foreground hover:text-foreground hover:bg-accent/50",
                            isItemActive(item) && "bg-primary/10 text-primary"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-center h-11 px-3 font-normal text-muted-foreground hover:text-foreground hover:bg-accent/50",
                          isItemActive(item) && "bg-primary/10 text-primary"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Sidebar Overlay for Manager */}
      {isMobile && userRole?.toLowerCase() === "manager" && isMobileOpen && !hasActiveSubscription && (
        <div
          style={{ position: "fixed", zIndex: 1000, top: 0, left: 0, width: "20rem", height: "100vh", background: "rgba(255,255,255,0)", cursor: "not-allowed" }}
        />
      )}
      {/* Mobile Sidebar */}
      {isMobile && (
        <div
          className={cn(
            "fixed left-0 top-0 h-full w-80 bg-card border-r border-border shadow-xl z-50 flex flex-col transition-transform duration-300 ease-in-out lg:hidden",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Header with close button */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full flex-shrink-0">
                  <TreePine className="h-5 w-5 text-green-600" />
                </div>
                <h1 className="text-lg font-semibold text-foreground">
                  Tumbuhin
                </h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
            <nav className="space-y-1 px-2">
              {enhancedNavigationItems.map((item) => renderNavigationItem(item))}
            </nav>
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-border p-2">
            <nav className="space-y-1">
              {bottomNavigationItems.map((item) => renderNavigationItem(item))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
