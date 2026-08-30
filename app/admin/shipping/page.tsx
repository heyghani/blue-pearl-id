import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ShippingQuantityTierCreateForm } from "@/components/admin/shipping-quantity-tier-create-form";
import { ShippingQuantityTierForm } from "@/components/admin/shipping-quantity-tier-form";
import { ShippingRateForm } from "@/components/admin/shipping-rate-form";
import {
  listShippingQuantityTiers,
  listShippingRates,
} from "@/lib/services/admin/shipping.service";

export default async function AdminShippingPage() {
  const [rates, tiers] = await Promise.all([
    listShippingRates(),
    listShippingQuantityTiers(),
  ]);

  const standardPrice =
    rates.find((rate) => rate.method === "STANDARD")?.price.toString() ?? "15.00";
  const expressPrice =
    rates.find((rate) => rate.method === "EXPRESS")?.price.toString() ?? "35.00";

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Shipping rates"
        description="Quantity packs on product pages map to Standard and Express prices below. Checkout uses the pack that matches the number of pairs in the cart."
        meta={`${tiers.length} pack${tiers.length === 1 ? "" : "s"}`}
      />

      <section className="space-y-4">
        <div className="border-b pb-2">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Quantity packs
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These sizes appear on every product page. Set a shipping price per
            pack for Standard and Express. Cart totals that fall between packs
            use the next larger pack; quantities above the largest pack scale
            from that pack’s price.
          </p>
        </div>

        {tiers.length === 0 ? (
          <div className="rounded-xl border bg-card shadow-sm">
            <AdminEmptyState
              title="No quantity packs"
              description="Add pack sizes such as 3, 5, or 10 pairs so customers can choose them on product pages."
            />
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {tiers.map((tier) => (
              <ShippingQuantityTierForm
                key={tier.id}
                id={tier.id}
                quantity={tier.quantity}
                standardPrice={tier.standardPrice.toString()}
                expressPrice={tier.expressPrice.toString()}
                isActive={tier.isActive}
              />
            ))}
          </div>
        )}

        <ShippingQuantityTierCreateForm
          defaultStandardPrice={standardPrice}
          defaultExpressPrice={expressPrice}
        />
      </section>

      <section className="space-y-4">
        <div className="border-b pb-2">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Delivery methods
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Transit windows and whether Standard or Express is offered at
            checkout. The method price is only used if no quantity packs are
            configured.
          </p>
        </div>

        {rates.length === 0 ? (
          <div className="rounded-xl border bg-card shadow-sm">
            <AdminEmptyState
              title="No shipping rates"
              description="Shipping methods will appear here once they are seeded for the store."
            />
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {rates.map((rate) => (
              <ShippingRateForm
                key={rate.id}
                method={rate.method}
                name={rate.name}
                price={rate.price.toString()}
                estimatedDaysMin={rate.estimatedDaysMin}
                estimatedDaysMax={rate.estimatedDaysMax}
                isActive={rate.isActive}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
