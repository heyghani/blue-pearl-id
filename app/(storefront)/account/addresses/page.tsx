import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { COUNTRIES } from "@/lib/countries";
import { getUserAddresses } from "@/lib/services/account.service";

export default async function AddressesPage() {
  const session = await auth();
  const addresses = session?.user?.id
    ? await getUserAddresses(session.user.id)
    : [];

  if (addresses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 p-10 text-center">
        <h2 className="text-xl font-semibold tracking-tight">No saved addresses</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Saved addresses will appear here once you add them to your profile. You can still
          enter a shipping address at checkout as a guest or signed-in customer.
        </p>
        <Button className="mt-6" variant="outline" asChild>
          <Link href="/checkout/information">Go to checkout</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Saved addresses</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use these for faster checkout in future orders.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <div key={address.id} className="rounded-lg border bg-card p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">
                {address.label ?? `${address.firstName} ${address.lastName}`}
              </p>
              {address.isDefault ? (
                <Badge variant="secondary">Default</Badge>
              ) : null}
            </div>
            <address className="mt-3 not-italic text-sm text-muted-foreground">
              {address.firstName} {address.lastName}
              <br />
              {address.line1}
              {address.line2 ? (
                <>
                  <br />
                  {address.line2}
                </>
              ) : null}
              <br />
              {address.city}
              {address.state ? `, ${address.state}` : ""} {address.postalCode}
              <br />
              {COUNTRIES.find((c) => c.code === address.country)?.name ?? address.country}
            </address>
          </div>
        ))}
      </div>
    </div>
  );
}
