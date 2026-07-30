import { cache } from "react";
import { cookies } from "next/headers";

import { LOCALE_COOKIE, resolveLocale, type Locale } from "@/lib/i18n";

/** Deduped per request — many RSC leaves call this. */
export const getLocale = cache(async (): Promise<Locale> => {
  const cookieStore = await cookies();
  return resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value);
});
