"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

import { GraduationCap } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import {
  STUDENT_BASE_PATH,
  studentNavigationGroups,
} from "@/features/student/data/student-navigation.data";

interface StudentSidebarProps {
  notificationCount?: number;
}

export default function StudentSidebar({
  notificationCount = 0,
}: StudentSidebarProps) {
    const pathname = usePathname();
    
    const shouldReduceMotion = useReducedMotion();

  const { state, isMobile, setOpenMobile } = useSidebar();

  const isCollapsed = state === "collapsed" && !isMobile;

  const closeMobileSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r border-brand-border/80"
    >
      {/* =====================================
          SIDEBAR HEADER
      ====================================== */}

     <SidebarHeader
  className={cn(
    "flex h-18 shrink-0 justify-center",
    isCollapsed ? "items-center px-0" : "px-5",
  )}
>
  <motion.div
    className="shrink-0"
    whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
    transition={{ duration: 0.2 }}
  >
    <Link
      href="/student/dashboard"
      onClick={closeMobileSidebar}
      aria-label="Coursify dashboard"
      className={cn(
        "flex items-center gap-2",
        isCollapsed && "justify-center",
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
        <GraduationCap size={23} strokeWidth={2.2} />
      </span>

      {!isCollapsed && (
        <span className="text-2xl font-extrabold tracking-tight text-primary">
          Coursify
        </span>
      )}
    </Link>
  </motion.div>
</SidebarHeader>

      <SidebarSeparator
        className="mx-auto w-[calc(100%-24px)] bg-brand-border/70"
      />

      {/* =====================================
          SIDEBAR NAVIGATION
      ====================================== */}

      <SidebarContent
        className={cn(
          "gap-0 py-4",
          "[scrollbar-width:thin]",
          "group-data-[collapsible=icon]:overflow-y-auto!",
          isCollapsed ? "px-0" : "px-2.5",
        )}
      >
        {studentNavigationGroups.map((group, groupIndex) => (
          <SidebarGroup
            key={group.label}
            className={cn(
              isCollapsed
                ? "px-0 py-2"
                : "px-1 py-3",
            )}
          >
            {/* Collapsed Group Separator */}
            {isCollapsed && groupIndex > 0 && (
              <div
                aria-hidden="true"
                className="mx-auto mb-4 h-px w-7 bg-brand-border/80"
              />
            )}

            {/* Expanded Group Label */}
            {!isCollapsed && (
              <SidebarGroupLabel
                className="
                  mb-2 h-6 px-3
                  text-[10px] font-semibold
                  uppercase tracking-[0.12em]
                  text-brand-text-muted
                "
              >
                {group.label}
              </SidebarGroupLabel>
            )}

            <SidebarGroupContent>
              <SidebarMenu
                className={cn(
                  isCollapsed
                    ? "items-center gap-2"
                    : "gap-1",
                )}
              >
                {group.items.map((item) => {
                  const Icon = item.icon;

                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

                  const showNotificationCount =
                    item.href ===
                      `${STUDENT_BASE_PATH}/notifications` &&
                    notificationCount > 0;

                  const linkClassName = cn(
                    // Base styling
                    "group/nav relative flex items-center",
                    "rounded-xl text-[13px] font-medium",
                    "text-brand-text-muted",

                    // Transitions
                    "transition-[background-color,color,box-shadow]",
                    "duration-200",

                    // Hover styling
                    "hover:bg-brand-soft",
                    "hover:text-brand-text",

                    // Accessibility
                    "focus-visible:outline-none",
                    "focus-visible:ring-2",
                    "focus-visible:ring-primary",

                    // Expanded / collapsed styling
                    isCollapsed
                      ? "size-11 shrink-0 justify-center"
                      : "h-11 w-full gap-3 px-3",

                    // Active route styling
                    isActive &&
                      "bg-primary/10 font-semibold text-primary hover:bg-primary/10 hover:text-primary",
                  );

                  const linkContent = (
                    <>
                      {/* Active Route Indicator */}
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute top-1/2 h-5 w-0.75",
                            "-translate-y-1/2 rounded-full",
                            "bg-primary",
                            isCollapsed
                              ? "-left-2"
                              : "left-0",
                          )}
                        />
                      )}

                      {/* Navigation Icon */}
                      <Icon
                        size={isCollapsed ? 21 : 19}
                        strokeWidth={isActive ? 2 : 1.7}
                        aria-hidden="true"
                        className="
                          shrink-0
                          transition-transform duration-200
                          group-hover/nav:scale-105
                          motion-reduce:transition-none
                          motion-reduce:transform-none
                        "
                      />

                      {/* Navigation Label */}
                      {!isCollapsed && (
                        <span className="min-w-0 flex-1 truncate">
                          {item.label}
                        </span>
                      )}

                      {/* Expanded Notification Counter */}
                      {showNotificationCount && !isCollapsed && (
                        <span
                          className="
                            ml-auto shrink-0 rounded-md
                            bg-primary/10 px-1.5 py-0.5
                            text-[10px] font-semibold
                            tabular-nums text-primary
                          "
                        >
                          {notificationCount > 99
                            ? "99+"
                            : notificationCount}
                        </span>
                      )}

                      {/* Collapsed Notification Indicator */}
                      {showNotificationCount && isCollapsed && (
                        <span
                          aria-hidden="true"
                          className="
                            absolute right-1.5 top-1.5
                            size-2 rounded-full
                            border border-background
                            bg-primary
                          "
                        />
                      )}
                    </>
                  );

                  return (
                    <SidebarMenuItem
                      key={item.href}
                      className={cn(
                        "w-full",
                        isCollapsed && "flex justify-center",
                      )}
                    >
                      {isCollapsed ? (
                        /* =====================================
                            COLLAPSED LINK WITH SHADCN TOOLTIP
                        ====================================== */

                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Link
                                href={item.href}
                                onClick={closeMobileSidebar}
                                aria-label={item.label}
                                aria-current={
                                  isActive ? "page" : undefined
                                }
                                className={linkClassName}
                              />
                            }
                          >
                            {linkContent}
                          </TooltipTrigger>

                          <TooltipContent
                            side="right"
                            align="center"
                            sideOffset={20}
                            className="
                              z-100 rounded-lg
                              bg-foreground
                              px-3.5 py-2
                              text-xs font-medium
                              text-background
                              shadow-lg
                            "
                          >
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        /* =====================================
                            EXPANDED NAVIGATION LINK
                        ====================================== */

                        <Link
                          href={item.href}
                          onClick={closeMobileSidebar}
                          aria-current={
                            isActive ? "page" : undefined
                          }
                          className={linkClassName}
                        >
                          {linkContent}
                        </Link>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Sidebar Collapse / Expand Edge Control */}
      <SidebarRail />
    </Sidebar>
  );
}