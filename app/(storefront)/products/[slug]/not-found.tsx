import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Product not found</h1>
      <p className="mt-2 text-muted-foreground">
        This product may have been removed or is no longer available.
      </p>
      <Button className="mt-8" asChild>
        <Link href="/products">Browse all products</Link>
      </Button>
    </div>
  );
}
