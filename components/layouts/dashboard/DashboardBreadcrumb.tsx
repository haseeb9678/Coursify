"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { DashboardBreadcrumbProps } from "@/features/dashboard/types/dashboard.types";
import { formatBreadcrumbLabel } from "@/features/dashboard/utils/dashboard.utils";

export default function DashboardBreadcrumb({
  config,
}: DashboardBreadcrumbProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (!pathname.startsWith(`${config.baseRoute}/`)) {
    return null;
  }

  const breadcrumbs = segments.map((segment, index) => ({
    label: formatBreadcrumbLabel(segment, config.routeLabels),
    href:
      index === 0
        ? config.dashboardRoute
        : `/${segments.slice(0, index + 1).join("/")}`,
    isLast: index === segments.length - 1,
  }));

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap gap-1.5 text-xs sm:gap-2.5 sm:text-sm">
        {breadcrumbs.map(({ label, href, isLast }, index) => (
          <Fragment key={`${href}-${index}`}>
            <BreadcrumbItem
              className={
                isLast ? "min-w-0" : "hidden shrink-0 sm:inline-flex"
              }
            >
              {isLast ? (
                <BreadcrumbPage className="max-w-32 truncate font-semibold text-brand-text sm:max-w-56 lg:max-w-72">
                  {label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={href}
                  className="font-medium text-brand-text-muted transition-colors duration-200 hover:text-primary"
                >
                  {label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>

            {!isLast && (
              <BreadcrumbSeparator className="hidden shrink-0 text-brand-text-muted/60 sm:block" />
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
