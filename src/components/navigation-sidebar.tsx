"use client";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, ChevronDown, TreePine } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types";
import { navigationItems, bottomNavigationItems } from "@/app/mock/data";

export default function NavigationSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [expandedItems, setExpandedItems] = useState<string[]>(["pipeline"]);
  const [isHovered, setIsHovered] = useState(false);

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

  const isParentActive = (children?: NavigationItem[]) => {
    if (!children) return false;
    return children.some((child) => isActive(child.href));
  };
  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const itemIsActive = isActive(item.href) || isParentActive(item.children);

    if (hasChildren) {
      return (
        <Collapsible
          key={item.id}
          open={isHovered && isExpanded}
          onOpenChange={() => isHovered && toggleExpanded(item.id)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-11 font-normal text-muted-foreground hover:text-foreground hover:bg-accent/50",
                !isHovered ? "px-3" : "px-3",
                level > 0 && isHovered && "pl-8",
                itemIsActive &&
                  "bg-primary/10 text-primary border-r-2 border-r-primary"
              )}
            >
              {" "}
              <item.icon
                className={cn("h-4 w-4 flex-shrink-0", isHovered && "mr-3")}
              />
              <div
                className={cn(
                  "flex items-center flex-1 transition-all duration-300 ease-in-out overflow-hidden",
                  isHovered ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
                )}
              >
                <span className="flex-1 text-left whitespace-nowrap">
                  {item.label}
                </span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
                )}
              </div>
            </Button>
          </CollapsibleTrigger>
          {isHovered && (
            <CollapsibleContent className="space-y-1">
              {item.children?.map((child) =>
                renderNavigationItem(child, level + 1)
              )}
            </CollapsibleContent>
          )}
        </Collapsible>
      );
    }

    if (item.href) {
      return (
        <Link key={item.id} to={item.href}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-11 font-normal text-muted-foreground hover:text-foreground hover:bg-accent/50",
              !isHovered ? "px-3" : "px-3",
              level > 0 && isHovered && "pl-8",
              itemIsActive &&
                "bg-primary/10 text-primary border-r-2 border-r-primary"
            )}
          >
            {" "}
            <item.icon
              className={cn("h-4 w-4 flex-shrink-0", isHovered && "mr-3")}
            />
            <div
              className={cn(
                "flex items-center flex-1 transition-all duration-300 ease-in-out overflow-hidden",
                isHovered ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
              )}
            >
              <span className="flex-1 text-left whitespace-nowrap">
                {item.label}
              </span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
          </Button>
        </Link>
      );
    } else {
      return (
        <div key={item.id}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-11 font-normal text-muted-foreground hover:text-foreground hover:bg-accent/50",
              !isHovered ? "px-3" : "px-3",
              level > 0 && isHovered && "pl-8",
              itemIsActive &&
                "bg-primary/10 text-primary border-r-2 border-r-primary"
            )}
          >
            <item.icon
              className={cn("h-4 w-4 flex-shrink-0", isHovered && "mr-3")}
            />
            <div
              className={cn(
                "flex items-center flex-1 transition-all duration-300 ease-in-out overflow-hidden",
                isHovered ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
              )}
            >
              <span className="flex-1 text-left whitespace-nowrap">
                {item.label}
              </span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
          </Button>
        </div>
      );
    }
  };

  return (
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
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {navigationItems.map((item) => renderNavigationItem(item))}
          </nav>
        </div>
        {/* Bottom Navigation */}{" "}
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
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {navigationItems.map((item) => (
              <div key={item.id}>
                {item.href ? (
                  <Link to={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-center h-11 px-3 font-normal text-muted-foreground hover:text-foreground hover:bg-accent/50",
                        (isActive(item.href) ||
                          isParentActive(item.children)) &&
                          "bg-primary/10 text-primary"
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
                      (isActive(item.href) || isParentActive(item.children)) &&
                        "bg-primary/10 text-primary"
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
                        (isActive(item.href) ||
                          isParentActive(item.children)) &&
                          "bg-primary/10 text-primary"
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
                      (isActive(item.href) || isParentActive(item.children)) &&
                        "bg-primary/10 text-primary"
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
  );
}
