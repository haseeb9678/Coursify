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

import { STUDENT_BASE_PATH } from "@/features/student/data/student-navigation.data";

const routeLabels: Record<string, string> = {
  student: "Student",
  dashboard: "Dashboard",
  "my-learning": "My Learning",
  courses: "Explore Courses",
  wishlist: "Wishlist",
  certificates: "Certificates",
  notifications: "Notifications",
  settings: "Settings",
  profile: "Profile",
  security: "Security",
};

function formatSegment(segment: string): string {
  return (
    routeLabels[segment] ??
    segment
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (character) =>
        character.toUpperCase(),
      )
  );
}

export default function StudentBreadcrumb() {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean);

  // Only display breadcrumbs for student routes.
  if (segments[0] !== "student") {
    return null;
  }

  const breadcrumbs = segments.map((segment, index) => ({
    label: formatSegment(segment),
    href:
      index === 0
        ? `${STUDENT_BASE_PATH}/dashboard`
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
                isLast
                  ? "min-w-0"
                  : "hidden shrink-0 sm:inline-flex"
              }
            >
              {isLast ? (
                <BreadcrumbPage
                  className="
                    max-w-32 truncate font-semibold
                    text-brand-text
                    sm:max-w-56 lg:max-w-72
                  "
                >
                  {label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={href}
                  className="
                    font-medium text-brand-text-muted
                    transition-colors duration-200
                    hover:text-primary
                  "
                >
                  {label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>

            {!isLast && (
              <BreadcrumbSeparator
                className="hidden shrink-0 text-brand-text-muted/60 sm:block"
              />
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}