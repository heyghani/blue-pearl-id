import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface RecommendationCategory {
  slug: string;
  title: string;
  description: string;
  href: string;
  imageUrl?: string | null;
  productCount: number;
  productLabel: string;
  productsLabel: string;
  shopLabel: string;
}

export function HomeRecommendationsSection({
  categories,
  title,
  description,
  className,
}: {
  categories: RecommendationCategory[];
  title: string;
  description: string;
  className?: string;
}) {
  if (categories.length === 0) return null;

  return (
    <section className={cn("py-10 sm:py-14", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 max-w-xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:max-w-2xl">
          {categories.map((category, index) => {
            const countLabel =
              category.productCount === 1 ? category.productLabel : category.productsLabel;

            return (
              <Link
                key={category.slug}
                href={category.href}
                className={cn("group block", index === 0 && "sm:col-span-2 lg:col-span-1")}
              >
                <article className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md active:scale-[0.99]">
                  <div
                    className={cn(
                      "relative aspect-[5/3] overflow-hidden bg-muted sm:aspect-[16/9]",
                      !category.imageUrl && "bg-gradient-to-br from-stone-200/90 via-stone-100 to-amber-50",
                    )}
                  >
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 512px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-foreground/15" strokeWidth={1.25} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white sm:p-5">
                      <h3 className="font-display text-lg font-semibold tracking-tight sm:text-xl">
                        {category.title}
                      </h3>
                      <p className="mt-1 text-xs text-white/80 sm:text-sm">{category.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <p className="text-xs text-muted-foreground">
                      {category.productCount} {countLabel}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground sm:text-sm">
                      {category.shopLabel}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
