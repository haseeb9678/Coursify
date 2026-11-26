"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import {
  Sidebar,
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
import type {
  DashboardNavigationItem,
  DashboardSidebarProps,
} from "@/features/dashboard/types/dashboard.types";
import {
  formatNotificationCount,
  isActiveRoute,
} from "@/features/dashboard/utils/dashboard.utils";
import { cn } from "@/lib/utils";

import DashboardMobileNav from "./DashboardMobileNav";
import DashboardScrollArea from "./DashboardScrollArea";

function NavigationItem({
  item,
  isCollapsed,
  notificationCount,
  notificationRoute,
}: {
  item: DashboardNavigationItem;
  isCollapsed: boolean;
  notificationCount: number;
  notificationRoute: string;
}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const isActive = isActiveRoute(pathname, item.href);
  const isImplemented = item.implemented !== false;
  const showNotificationCount =
    item.href === notificationRoute && notificationCount > 0;
  const Icon = item.icon;

  const linkClassName = cn(
    "group/nav relative flex items-center rounded-xl text-left text-[13px] font-medium text-brand-text-muted transition-[background-color,color,box-shadow] duration-200 hover:bg-brand-soft hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    isCollapsed
      ? "size-11 shrink-0 justify-center"
      : "h-11 w-full gap-3 px-3",
    isActive &&
      "bg-primary/10 font-semibold text-primary hover:bg-primary/10 hover:text-primary",
    !isImplemented && "cursor-not-allowed opacity-60",
  );

  const contents = (
    <>
      {isActive && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-full bg-primary",
            isCollapsed ? "-left-2" : "left-0",
          )}
        />
      )}

      <Icon
        size={isCollapsed ? 21 : 19}
        strokeWidth={isActive ? 2 : 1.7}
        aria-hidden="true"
        className="shrink-0 transition-transform duration-200 group-hover/nav:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
      />

      {!isCollapsed && (
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
      )}

      {showNotificationCount && !isCollapsed && (
        <span className="ml-auto shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-primary">
          {formatNotificationCount(notificationCount)}
        </span>
      )}

      {showNotificationCount && isCollapsed && (
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1.5 size-2 rounded-full border border-background bg-primary"
        />
      )}
    </>
  );

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  if (!isCollapsed) {
    return isImplemented ? (
      <Link
        href={item.href}
        onClick={closeMobileSidebar}
        aria-current={isActive ? "page" : undefined}
        className={linkClassName}
      >
        {contents}
      </Link>
    ) : (
      <button
        type="button"
        disabled
        title={`${item.label} is unavailable`}
        aria-label={`${item.label} (unavailable)`}
        className={linkClassName}
      >
        {contents}
      </button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          isImplemented ? (
            <Link
              href={item.href}
              onClick={closeMobileSidebar}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              className={linkClassName}
            />
          ) : (
            <button
              type="button"
              disabled
              title={`${item.label} is unavailable`}
              aria-label={`${item.label} (unavailable)`}
              className={linkClassName}
            />
          )
        }
      >
        {contents}
      </TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        sideOffset={20}
        className="z-100 rounded-lg bg-foreground px-3.5 py-2 text-xs font-medium text-background shadow-lg"
      >
        {item.label}
        {!isImplemented && " (unavailable)"}
      </TooltipContent>
    </Tooltip>
  );
}

export default function DashboardSidebar({
  config,
  notificationCount = 0,
}: DashboardSidebarProps) {
  const shouldReduceMotion = useReducedMotion();
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r border-brand-border/80"
    >
      {isMobile ? (
        <DashboardMobileNav
          config={config}
          notificationCount={notificationCount}
        />
      ) : (
        <>
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
                href={config.dashboardRoute}
                aria-label={`${config.workspaceName} dashboard`}
                className={cn(
                  "flex items-center gap-2",
                  isCollapsed && "justify-center",
                )}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <GraduationCap size={23} strokeWidth={2.2} />
                </span>

                {!isCollapsed && (
                  <span className="text-2xl font-extrabold tracking-tight text-primary">
                    {config.workspaceName}
                  </span>
                )}
              </Link>
            </motion.div>
          </SidebarHeader>

          <SidebarSeparator className="mx-auto w-[calc(100%-24px)] bg-brand-border/70" />

          <DashboardScrollArea
            className={cn(
              "gap-0 py-4 group-data-[collapsible=icon]:overflow-y-auto!",
              isCollapsed ? "px-0" : "px-2.5",
            )}
          >
            {config.navigationGroups.map((group, groupIndex) => (
              <SidebarGroup
                key={group.label}
                className={isCollapsed ? "px-0 py-2" : "px-1 py-3"}
              >
                {isCollapsed && groupIndex > 0 && (
                  <div
                    aria-hidden="true"
                    className="mx-auto mb-4 h-px w-7 bg-brand-border/80"
                  />
                )}

                {!isCollapsed && (
                  <SidebarGroupLabel className="mb-2 h-6 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-text-muted">
                    {group.label}
                  </SidebarGroupLabel>
                )}

                <SidebarGroupContent>
                  <SidebarMenu
                    className={isCollapsed ? "items-center gap-2" : "gap-1"}
                  >
                    {group.items.map((item) => (
                      <SidebarMenuItem
                        key={item.href}
                        className={cn(
                          "w-full",
                          isCollapsed && "flex justify-center",
                        )}
                      >
                        <NavigationItem
                          item={item}
                          isCollapsed={isCollapsed}
                          notificationCount={notificationCount}
                          notificationRoute={config.notificationRoute}
                        />
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </DashboardScrollArea>
        </>
      )}

      <SidebarRail />
    </Sidebar>
  );
}
