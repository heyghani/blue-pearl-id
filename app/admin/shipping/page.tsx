import { ShippingRateForm } from "@/components/admin/shipping-rate-form";
import { listShippingRates } from "@/lib/services/admin/shipping.service";

export default async function AdminShippingPage() {
  const rates = await listShippingRates();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Shipping rates</h1>
        <p className="text-muted-foreground">
          Configure worldwide flat rates for Standard and Express shipping.
        </p>
      </div>

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
