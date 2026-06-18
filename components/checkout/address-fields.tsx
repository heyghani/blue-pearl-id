import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COUNTRIES } from "@/lib/countries";
import type { AddressInput } from "@/lib/validations/checkout";

export function AddressFields({
  prefix = "",
  defaultValues,
  fieldErrors,
}: {
  prefix?: string;
  defaultValues?: Partial<AddressInput>;
  fieldErrors?: Record<string, string[]>;
}) {
  const field = (name: keyof AddressInput) => (prefix ? `${prefix}.${name}` : name);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={field("firstName")}>First name</Label>
          <Input
            id={field("firstName")}
            name={field("firstName")}
            defaultValue={defaultValues?.firstName}
            required
          />
          {fieldErrors?.firstName && (
            <p className="text-sm text-destructive">{fieldErrors.firstName[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor={field("lastName")}>Last name</Label>
          <Input
            id={field("lastName")}
            name={field("lastName")}
            defaultValue={defaultValues?.lastName}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={field("company")}>Company (optional)</Label>
        <Input
          id={field("company")}
          name={field("company")}
          defaultValue={defaultValues?.company ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={field("line1")}>Address</Label>
        <Input
          id={field("line1")}
          name={field("line1")}
          defaultValue={defaultValues?.line1}
          required
        />
        {fieldErrors?.line1 && (
          <p className="text-sm text-destructive">{fieldErrors.line1[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={field("line2")}>Apartment, suite, etc. (optional)</Label>
        <Input
          id={field("line2")}
          name={field("line2")}
          defaultValue={defaultValues?.line2 ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={field("city")}>City</Label>
          <Input
            id={field("city")}
            name={field("city")}
            defaultValue={defaultValues?.city}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={field("state")}>State / Province</Label>
          <Input
            id={field("state")}
            name={field("state")}
            defaultValue={defaultValues?.state ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={field("postalCode")}>Postal code</Label>
          <Input
            id={field("postalCode")}
            name={field("postalCode")}
            defaultValue={defaultValues?.postalCode}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={field("country")}>Country</Label>
          <select
            id={field("country")}
            name={field("country")}
            defaultValue={defaultValues?.country ?? "US"}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={field("phone")}>Phone (optional)</Label>
        <Input
          id={field("phone")}
          name={field("phone")}
          type="tel"
          defaultValue={defaultValues?.phone ?? ""}
        />
      </div>
    </div>
  );
}
