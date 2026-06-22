"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronLeft } from "lucide-react";

import { useTranslations } from "@/components/i18n/locale-provider";
import { addToCartAction } from "@/lib/actions/cart";
import { WHATSAPP_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductActionsProps {
  productId: string;
  variantId?: string;
  inStock: boolean;
  requiresSelection?: boolean;
  layout?: "inline" | "sticky";
}

export function ProductActions({
  productId,
  variantId,
  inStock,
  requiresSelection = false,
  layout = "inline",
}: ProductActionsProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  function handleAdd(redirectToCart = false) {
    setError(null);
    setAdded(false);

    if (requiresSelection) {
      setError(t.product.selectOptions);
      return;
    }

    startTransition(async () => {
      const result = await addToCartAction(productId, 1, variantId);
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

  if (layout === "sticky") {
    return (
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/90">
        {error ? (
          <p className="mb-2 text-center text-xs text-destructive">{error}</p>
        ) : added ? (
          <p className="mb-2 text-center text-xs text-[var(--pearl)]">
            {t.product.addedToCart}{" "}
            <Link href="/cart" className="font-semibold underline">
              {t.product.viewCart}
            </Link>
          </p>
        ) : null}
        <div className="mx-auto flex max-w-lg gap-2">
          <Button
            size="lg"
            variant="outline"
            className="h-12 flex-1 rounded-full text-sm font-semibold shadow-sm"
            disabled={!inStock || isPending || requiresSelection}
            onClick={() => handleAdd(false)}
          >
            {isPending ? t.product.adding : t.product.addToCart}
          </Button>
          <Button
            size="lg"
            className="h-12 flex-[1.2] rounded-full text-sm font-semibold"
            disabled={!inStock || isPending || requiresSelection}
            onClick={() => handleAdd(true)}
          >
            {t.product.buyNow}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {added && !error ? (
        <p className="text-sm text-[var(--pearl)]">
          {t.product.addedToCart}{" "}
          <Link href="/cart" className="font-semibold underline">
            {t.product.viewCart}
          </Link>
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="h-12 flex-1 rounded-full text-sm font-semibold"
          disabled={!inStock || isPending || requiresSelection}
          onClick={() => handleAdd(false)}
        >
          {isPending ? t.product.adding : t.product.addToCart}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 flex-1 rounded-full text-sm font-semibold"
          disabled={!inStock || isPending || requiresSelection}
          onClick={() => handleAdd(true)}
        >
          {t.product.buyNow}
        </Button>
      </div>

      {!inStock ? (
        <p className="text-sm font-medium text-destructive">{t.product.outOfStock}</p>
      ) : null}
    </div>
  );
}

export function ProductBackNav({ href = "/products" }: { href?: string }) {
  const t = useTranslations();

  return (
    <Link
      href={href}
      className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden"
    >
      <ChevronLeft className="h-4 w-4" />
      {t.product.back}
    </Link>
  );
}

export function ProductWhatsAppLink({
  productName,
  className,
}: {
  productName: string;
  className?: string;
}) {
  const t = useTranslations();
  const message = `${t.whatsapp.prefilledMessage} (${productName})`;
  const href = `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex w-full items-center justify-center rounded-full border border-[#25D366]/30 bg-[#25D366]/5 px-4 py-2.5 text-sm font-medium text-[#128C7E] transition-colors hover:bg-[#25D366]/10 sm:w-auto",
        className,
      )}
    >
      {t.whatsapp.label}
    </a>
  );
}
