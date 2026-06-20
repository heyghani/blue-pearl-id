import { en } from "@/lib/i18n/locales/en";
import { es } from "@/lib/i18n/locales/es";
import { zh } from "@/lib/i18n/locales/zh";
import type { Dictionary, Locale } from "@/lib/i18n/types";
import { LOCALES } from "@/lib/i18n/types";

export * from "@/lib/i18n/types";

const dictionaries: Record<Locale, Dictionary> = { en, zh, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

export function isValidLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function resolveLocale(value: string | undefined): Locale {
  return isValidLocale(value) ? value : "en";
}
