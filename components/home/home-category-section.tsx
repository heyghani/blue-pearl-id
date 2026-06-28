import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { HomepageCategoryItem } from "@/lib/categories";
import { cn } from "@/lib/utils";

const CATEGORY_GRADIENTS = [
  "from-stone-200/90 via-stone-100 to-amber-50",
  "from-neutral-200/90 via-neutral-100 to-stone-50",
  "from-zinc-200/90 via-zinc-100 to-neutral-50",
  "from-amber-100/80 via-stone-100 to-white",
] as const;

function getCategoryInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

export function HomeCategorySection({
  categories,
  title,
  description,
  viewAllLabel,
  productLabel,
  productsLabel,
  className,
}: {
  categories: HomepageCategoryItem[];
  title: string;
  description: string;
  viewAllLabel: string;
  productLabel: string;
  productsLabel: string;
  className?: string;
}) {
  if (categories.length === 0) return null;

  const visibleCategories = categories.slice(0, 8);

  return (
    <section className={cn("py-10 sm:py-14", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="ghost" size="sm" asChild className="hidden shrink-0 sm:inline-flex">
            <Link href="/products">
              {viewAllLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {visibleCategories.map((category, index) => {
            const countLabel =
              category.productCount === 1 ? productLabel : productsLabel;

            return (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="group block"
              >
                <article className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md active:scale-[0.99]">
                  <div
                    className={cn(
                      "relative aspect-[5/4] overflow-hidden bg-muted",
                      !category.imageUrl &&
                        `bg-gradient-to-br ${CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length]}`,
                    )}
                  >
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-3xl font-semibold tracking-tight text-foreground/20 sm:text-4xl">
                          {getCategoryInitials(category.name)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-80" />
                  </div>

                  <div className="space-y-1 px-3.5 py-3 sm:px-4 sm:py-3.5">
                    <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground sm:text-[15px]">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {category.productCount} {countLabel}
                    </p>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        <div className="mt-5 sm:hidden">
          <Button variant="outline" size="sm" className="w-full rounded-full" asChild>
            <Link href="/products">{viewAllLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
