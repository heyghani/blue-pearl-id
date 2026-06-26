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
      />

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
    </div>
  );
}
