import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import type { User, UserRole } from "@/features/auth/types/auth.types";

export interface DashboardNavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  activePaths?: readonly string[];
  implemented?: boolean;
}

export interface DashboardNavigationGroup {
  label: string;
  items: readonly DashboardNavigationItem[];
}

export interface DashboardPromotionalCard {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  implemented?: boolean;
}

export interface DashboardConfiguration {
  userRole: UserRole;
  baseRoute: string;
  dashboardRoute: string;
  workspaceName: string;
  workspaceDescription: string;
  navigationGroups: readonly DashboardNavigationGroup[];
  accountNavigation: readonly DashboardNavigationItem[];
  notificationRoute: string;
  notificationRouteImplemented?: boolean;
  searchPlaceholder: string;
  searchRoute: string;
  routeLabels?: Readonly<Record<string, string>>;
  promotionalCard?: DashboardPromotionalCard;
}

export interface DashboardLayoutClientProps {
  children: ReactNode;
  config: DashboardConfiguration;
  defaultOpen?: boolean;
  notificationCount?: number;
}

export interface DashboardHeaderProps {
  config: DashboardConfiguration;
  notificationCount?: number;
}

export interface DashboardSidebarProps {
  config: DashboardConfiguration;
  notificationCount?: number;
}

export interface DashboardProfileMenuProps {
  user: User;
  accountNavigation: readonly DashboardNavigationItem[];
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export interface DashboardMobileNavProps {
  config: DashboardConfiguration;
  notificationCount?: number;
}

export interface DashboardBreadcrumbProps {
  config: DashboardConfiguration;
}

export interface DashboardSearchBarProps {
  placeholder: string;
  searchRoute: string;
}

export interface DashboardNotificationButtonProps {
  notificationCount?: number;
  notificationRoute: string;
  isRouteImplemented?: boolean;
}
