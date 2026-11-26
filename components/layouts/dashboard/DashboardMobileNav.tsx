"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, GraduationCap, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type {
  DashboardMobileNavProps,
  DashboardNavigationItem,
} from "@/features/dashboard/types/dashboard.types";
import {
  formatNotificationCount,
  getUserInitials,
  isActiveRoute,
} from "@/features/dashboard/utils/dashboard.utils";
import { useAuthStore } from "@/features/auth/store/auth.store";

import DashboardSearchBar from "./DashboardSearchBar";
import DashboardScrollArea from "./DashboardScrollArea";

function MobileNavigationItem({
  item,
  notificationCount,
  notificationRoute,
}: {
  item: DashboardNavigationItem;
  notificationCount: number;
  notificationRoute: string;
}) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const isActive = isActiveRoute(pathname, item.href);
  const isImplemented = item.implemented !== false;
  const Icon = item.icon;
  const content = (
    <>
      <Icon size={19} strokeWidth={1.7} />
      <span className="flex-1">{item.label}</span>
      {item.href === notificationRoute && notificationCount > 0 && (
        <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-primary">
          {formatNotificationCount(notificationCount)}
        </span>
      )}
      {isActive && (
        <span className="size-1.5 rounded-full bg-primary" />
      )}
    </>
  );
  const className = `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
    isActive
      ? "bg-primary/10 text-primary"
      : "text-brand-text-muted hover:bg-brand-soft hover:text-brand-text"
  } ${!isImplemented ? "cursor-not-allowed opacity-60" : ""}`;

  return (
    <SidebarMenuItem>
      {isImplemented ? (
        <Link
          href={item.href}
          onClick={() => setOpenMobile(false)}
          aria-current={isActive ? "page" : undefined}
          className={className}
        >
          {content}
        </Link>
      ) : (
        <span
          aria-disabled="true"
          aria-label={`${item.label} (unavailable)`}
          title={`${item.label} is unavailable`}
          className={className}
        >
          {content}
        </span>
      )}
    </SidebarMenuItem>
  );
}

export default function DashboardMobileNav({
  config,
  notificationCount = 0,
}: DashboardMobileNavProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );
  const isInitialized = useAuthStore(
    (state) => state.isInitialized,
  );

  return (
    <>
      <SidebarHeader className="border-b border-brand-border p-5">
        <Link
          href={config.dashboardRoute}
          className="flex items-center gap-2.5"
          aria-label={`${config.workspaceName} dashboard`}
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap size={23} strokeWidth={1.8} />
          </span>
          <span className="text-xl font-bold tracking-tight text-brand-text">
            {config.workspaceName}
          </span>
        </Link>

        <p className="text-left text-xs text-brand-text-muted">
          {config.workspaceDescription}
        </p>
      </SidebarHeader>

      {!isInitialized ? (
        <div
          role="status"
          aria-label={`Loading ${config.userRole.toLowerCase()} profile`}
          className="flex shrink-0 items-center gap-3 border-b border-brand-border px-5 py-4"
        >
          <div className="size-11 shrink-0 animate-pulse rounded-full bg-brand-soft motion-reduce:animate-none" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-28 max-w-full animate-pulse rounded-md bg-brand-soft motion-reduce:animate-none" />
            <div className="h-2.5 w-36 max-w-full animate-pulse rounded-md bg-brand-soft motion-reduce:animate-none" />
          </div>
        </div>
      ) : isAuthenticated && user ? (
        <div className="shrink-0 border-b border-brand-border px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/15 bg-primary/10 text-sm font-semibold tracking-wide text-primary">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                getUserInitials(user.name) || (
                  <UserRound size={21} strokeWidth={1.8} />
                )
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p
                title={user.name}
                className="truncate text-sm font-semibold text-brand-text"
              >
                {user.name}
              </p>
              <p
                title={user.email}
                className="mt-0.5 truncate text-xs text-brand-text-muted"
              >
                {user.email}
              </p>
              <span className="mt-1.5 inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium capitalize text-primary">
                {user.role.toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <DashboardScrollArea className="p-4">
        <div className="mb-6">
          <DashboardSearchBar
            placeholder={config.searchPlaceholder}
            searchRoute={config.searchRoute}
          />
        </div>

        {config.navigationGroups.map((group) => (
          <SidebarGroup key={group.label} className="px-0 py-2">
            <SidebarGroupLabel className="mb-2 h-6 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-text-muted">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => (
                  <MobileNavigationItem
                    key={item.href}
                    item={item}
                    notificationCount={notificationCount}
                    notificationRoute={config.notificationRoute}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {config.promotionalCard && (
          <div className="mt-auto pt-8">
            <div className="rounded-xl border border-brand-border bg-brand-page-secondary/60 p-4">
              <p className="text-sm font-semibold text-brand-text">
                {config.promotionalCard.title}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-brand-text-muted">
                {config.promotionalCard.description}
              </p>
              {config.promotionalCard.implemented === false ? (
                <span className="mt-3 inline-flex text-xs font-semibold text-brand-text-muted">
                  Coming soon
                </span>
              ) : (
                <Link
                  href={config.promotionalCard.href}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
                >
                  {config.promotionalCard.linkLabel}
                  <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
          </div>
        )}
      </DashboardScrollArea>
    </>
  );
}
