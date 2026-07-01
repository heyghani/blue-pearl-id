import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export function HomeRecommendationCard({
  id,
  title,
  description,
  cardTitle,
  cardDescription,
  href,
  imageUrl,
  productCount,
  productLabel,
  productsLabel,
  viewAllLabel,
  className,
}: {
  id?: string;
  title: string;
  description: string;
  cardTitle: string;
  cardDescription: string;
  href: string;
  imageUrl?: string | null;
  productCount: number;
  productLabel: string;
  productsLabel: string;
  viewAllLabel: string;
  className?: string;
}) {
  const countLabel = productCount === 1 ? productLabel : productsLabel;

  return (
    <section id={id} className={cn("py-10 sm:py-14 scroll-mt-20", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 max-w-xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        </div>

        <Link href={href} className="group block">
          <article className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md active:scale-[0.995]">
            <div
              className={cn(
                "relative aspect-[16/9] overflow-hidden bg-muted sm:aspect-[21/9]",
                !imageUrl && "bg-gradient-to-br from-stone-200/90 via-stone-100 to-amber-50",
              )}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-foreground/15" strokeWidth={1.25} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <h3 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {cardTitle}
                </h3>
                <p className="mt-1.5 max-w-md text-sm text-white/85 sm:text-base">
                  {cardDescription}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
              <p className="text-sm text-muted-foreground">
                {productCount} {countLabel}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                {viewAllLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </article>
        </Link>
      </div>
    </section>
  );
}
