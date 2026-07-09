"use client";

import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listDialCodeOptions, splitPhone } from "@/lib/phone";

type Props = {
  defaultPhone?: string;
  defaultCountry?: string;
  countryFieldId?: string;
  fieldErrors?: string[];
};

export function PhoneField({
  defaultPhone,
  defaultCountry = "US",
  countryFieldId,
  fieldErrors,
}: Props) {
  const initial = useMemo(
    () => splitPhone(defaultPhone, defaultCountry),
    [defaultPhone, defaultCountry],
  );
  const [dialCode, setDialCode] = useState(initial.dialCode);
  const [local, setLocal] = useState(initial.local);
  const dialCodeOptions = useMemo(() => listDialCodeOptions(), []);

  useEffect(() => {
    if (!countryFieldId) return;

    const select = document.getElementById(countryFieldId) as HTMLSelectElement | null;
    if (!select) return;

    const syncDialCode = () => {
      const option = dialCodeOptions.find((item) => item.countryCode === select.value);
      if (option) {
        setDialCode(option.dialCode);
      }
    };

    syncDialCode();
    select.addEventListener("change", syncDialCode);
    return () => select.removeEventListener("change", syncDialCode);
  }, [countryFieldId, dialCodeOptions]);

  return (
    <div className="space-y-2">
      <Label htmlFor="phoneLocal">Phone (optional)</Label>
      <div className="flex gap-2">
        <select
          id="phoneDialCode"
          name="phoneDialCode"
          value={dialCode}
          onChange={(event) => setDialCode(event.target.value)}
          className="flex h-10 w-[110px] shrink-0 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Country dial code"
        >
          {dialCodeOptions.map((option) => (
            <option key={`${option.countryCode}-${option.dialCode}`} value={option.dialCode}>
              {option.dialCode}
            </option>
          ))}
        </select>
        <Input
          id="phoneLocal"
          name="phoneLocal"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="Phone number"
          value={local}
          onChange={(event) => setLocal(event.target.value)}
          className="min-w-0 flex-1"
        />
      </div>
      {fieldErrors?.[0] ? (
        <p className="text-sm text-destructive">{fieldErrors[0]}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Include your area code in the phone number.
        </p>
      )}
    </div>
  );
}
