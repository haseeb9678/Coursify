const coursePath = /^\/(?:courses|checkout)\/[a-zA-Z0-9][a-zA-Z0-9-]{0,199}$/;

export function enrollmentReturnPath(value: string | null | undefined): string | null {
  if (!value || value.length > 620) return null;
  if (coursePath.test(value)) return value;
  const allowedStatusPath = /^\/checkout\/(?:success|cancel)\?order=[a-fA-F0-9-]{36}(?:&session_id=cs_test_[A-Za-z0-9_]{1,240})?$/;
  return allowedStatusPath.test(value) ? value : null;
}

export function commerceLogin(path: string): string {
  const internal = enrollmentReturnPath(path);
  return internal ? `/login?returnTo=${encodeURIComponent(internal)}` : "/login";
}
