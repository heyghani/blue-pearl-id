import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ShippingRateForm } from "@/components/admin/shipping-rate-form";
import { listShippingRates } from "@/lib/services/admin/shipping.service";

export default async function AdminShippingPage() {
  const rates = await listShippingRates();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Shipping rates"
        description="Configure worldwide flat rates for Standard and Express delivery."
        meta={`${rates.length} rate${rates.length === 1 ? "" : "s"}`}
      />

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
    </div>
  );
}
