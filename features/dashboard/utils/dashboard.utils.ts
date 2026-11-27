export function isActiveRoute(
  pathname: string,
  href: string,
  activePaths: readonly string[] = [],
): boolean {
  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";
  return [href, ...activePaths].some((path) => {
    const normalizedHref = path.replace(/\/+$/, "") || "/";
    return normalizedPathname === normalizedHref ||
      (normalizedHref !== "/" && normalizedPathname.startsWith(`${normalizedHref}/`));
  });
}

export function getUserInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export function formatNotificationCount(count: number): string {
  return count > 99 ? "99+" : String(count);
}

export function formatBreadcrumbLabel(
  segment: string,
  labels: Readonly<Record<string, string>> = {},
): string {
  return (
    labels[segment] ??
    segment
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase())
  );
}
