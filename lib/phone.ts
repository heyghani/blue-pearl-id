import { COUNTRIES, getCountryByCode } from "@/lib/countries";

const DIAL_CODES: Record<string, string> = {
  CN: "+86",
  US: "+1",
  SG: "+65",
  HK: "+852",
  JP: "+81",
  KR: "+82",
  AU: "+61",
  GB: "+44",
  DE: "+49",
  FR: "+33",
  CA: "+1",
  ID: "+62",
  MY: "+60",
  TH: "+66",
  PH: "+63",
  VN: "+84",
  TW: "+886",
  AE: "+971",
  NL: "+31",
  CH: "+41",
};

const DIAL_CODE_ENTRIES = Object.entries(DIAL_CODES).sort(
  (a, b) => b[1].length - a[1].length,
);

export function getDialCode(countryCode?: string | null) {
  if (!countryCode) return "+1";
  return DIAL_CODES[countryCode.toUpperCase()] ?? "+1";
}

export function listDialCodeOptions() {
  const seen = new Set<string>();

  return COUNTRIES.map((country) => {
    const dialCode = getDialCode(country.code);
    return {
      countryCode: country.code,
      countryName: country.name,
      dialCode,
    };
  }).filter((option) => {
    if (seen.has(option.dialCode)) return false;
    seen.add(option.dialCode);
    return true;
  });
}

export function combinePhone(
  dialCode: string | null | undefined,
  local: string | null | undefined,
) {
  const localDigits = (local ?? "").replace(/\D/g, "");
  if (!localDigits) return undefined;

  const normalizedDial = normalizeDialCode(dialCode);
  if (!normalizedDial) return localDigits;

  return `${normalizedDial} ${localDigits}`;
}

export function splitPhone(phone: string | undefined, countryCode?: string) {
  const fallbackDialCode = getDialCode(countryCode);

  if (!phone?.trim()) {
    return { dialCode: fallbackDialCode, local: "" };
  }

  const trimmed = phone.trim();

  if (trimmed.startsWith("+")) {
    for (const [, dialCode] of DIAL_CODE_ENTRIES) {
      if (trimmed.startsWith(dialCode)) {
        return {
          dialCode,
          local: trimmed.slice(dialCode.length).replace(/\D/g, ""),
        };
      }
    }
  }

  return {
    dialCode: fallbackDialCode,
    local: trimmed.replace(/\D/g, ""),
  };
}

export function formatPhoneDisplay(phone?: string | null, countryCode?: string) {
  if (!phone?.trim()) return null;

  const { dialCode, local } = splitPhone(phone, countryCode);
  if (!local) return null;

  if (dialCode === "+1" && local.length === 10) {
    return `${dialCode} (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  }

  return `${dialCode} ${local}`;
}

function normalizeDialCode(dialCode: string | null | undefined) {
  const digits = (dialCode ?? "").replace(/[^\d+]/g, "");
  if (!digits) return "";
  return digits.startsWith("+") ? digits : `+${digits}`;
}

export function getCountryName(countryCode?: string | null) {
  if (!countryCode) return null;
  return getCountryByCode(countryCode)?.name ?? countryCode;
}
