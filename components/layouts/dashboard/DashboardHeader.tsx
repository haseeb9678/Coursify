"use client";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useLogout } from "@/features/auth/hooks/use-logout";
import type { DashboardHeaderProps } from "@/features/dashboard/types/dashboard.types";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import DashboardBreadcrumb from "./DashboardBreadcrumb";
import DashboardNotificationButton from "./DashboardNotificationButton";
import DashboardProfileMenu from "./DashboardProfileMenu";
import DashboardSearchBar from "./DashboardSearchBar";
import DashboardThemeToggle from "./DashboardThemeToggle";

export default function DashboardHeader({
  config,
  notificationCount = 0,
}: DashboardHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );
  const isInitialized = useAuthStore(
    (state) => state.isInitialized,
  );
  const logoutMutation = useLogout();

  const handleLogout = () => {
    if (!logoutMutation.isPending) {
      logoutMutation.mutate();
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-brand-border/80 bg-background/85 backdrop-blur-xl">
      <div className="flex h-18 w-full items-center justify-between gap-3 px-3 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger className="size-9 shrink-0 cursor-pointer rounded-lg text-brand-text-muted transition-colors hover:bg-brand-soft hover:text-primary" />

          <Separator
            orientation="vertical"
            className="h-6! bg-brand-border"
          />

          <div className="min-w-0">
            <DashboardBreadcrumb config={config} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <div className="hidden w-52 md:block xl:w-64">
            <DashboardSearchBar
              placeholder={config.searchPlaceholder}
              searchRoute={config.searchRoute}
            />
          </div>

          <DashboardNotificationButton
            notificationCount={notificationCount}
            notificationRoute={config.notificationRoute}
            isRouteImplemented={
              config.notificationRouteImplemented
            }
          />

          <DashboardThemeToggle />

          <Separator
            orientation="vertical"
            className="mx-0.5 h-7! shrink-0 bg-brand-border sm:mx-1"
          />

          <div className="flex shrink-0 items-center">
            {!isInitialized ? (
              <div
                role="status"
                aria-label={`Loading ${config.userRole.toLowerCase()} profile`}
                className="flex items-center gap-2.5"
              >
                <div className="size-10 shrink-0 animate-pulse rounded-full bg-brand-soft motion-reduce:animate-none" />

                <div className="hidden space-y-2 lg:block">
                  <div className="h-3 w-24 animate-pulse rounded-md bg-brand-soft motion-reduce:animate-none" />
                  <div className="h-2.5 w-16 animate-pulse rounded-md bg-brand-soft motion-reduce:animate-none" />
                </div>
              </div>
            ) : isAuthenticated && user ? (
              <DashboardProfileMenu
                user={user}
                accountNavigation={config.accountNavigation}
                onLogout={handleLogout}
                isLoggingOut={logoutMutation.isPending}
              />
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
