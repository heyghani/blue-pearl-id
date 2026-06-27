import Link from "next/link";

import { BrandForm } from "@/components/admin/brand-form";
import { Button } from "@/components/ui/button";

export default function NewBrandPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New brand</h1>
          <p className="text-muted-foreground">Add a brand to assign to products.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/brands">Back to brands</Link>
        </Button>
      </div>

      <BrandForm />
    </div>
  );
}
