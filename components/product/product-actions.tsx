"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { addToCartAction } from "@/lib/actions/cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProductActionsProps {
  productId: string;
  inStock: boolean;
}

export function ProductActions({
  productId,
  inStock,
}: ProductActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  function handleAdd(redirectToCart = false) {
    setError(null);
    setAdded(false);

    startTransition(async () => {
      const result = await addToCartAction(productId, 1);
      if (result.error) {
        setError(result.error);
        return;
      }
      setAdded(true);
      router.refresh();
      if (redirectToCart) {
        router.push("/cart");
      }
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {added && !error && (
        <Alert variant="success">
          <AlertDescription>
            Added to cart.{" "}
            <Link href="/cart" className="font-medium underline">
              View cart
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="flex-1"
          disabled={!inStock || isPending}
          onClick={() => handleAdd(false)}
        >
          {isPending ? "Adding…" : "Add to cart"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          disabled={!inStock || isPending}
          onClick={() => handleAdd(true)}
        >
          Buy now
        </Button>
      </div>

      {!inStock && <Badge variant="secondary">Out of stock</Badge>}
    </div>
  );
}
