/** Build an admin list URL while preserving / overriding query params. */
export function adminListHref(
  pathname: string,
  current: Record<string, string | undefined | null>,
  overrides: Record<string, string | undefined | null> = {},
) {
  const params = new URLSearchParams();
  const merged = { ...current, ...overrides };

  for (const [key, value] of Object.entries(merged)) {
    if (value == null || value === "") continue;
    if (key === "page" && value === "1") continue;
    params.set(key, value);
  }

  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
