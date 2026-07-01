import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export interface RecommendationCardItem {
  slug: string;
  title: string;
  description: string;
  href: string;
  imageUrl?: string | null;
  productCount: number;
}

function RecommendationCard({
  card,
  productLabel,
  productsLabel,
  viewAllLabel,
}: {
  card: RecommendationCardItem;
  productLabel: string;
  productsLabel: string;
  viewAllLabel: string;
}) {
  const countLabel = card.productCount === 1 ? productLabel : productsLabel;

  return (
    <Link href={card.href} className="group block">
      <article className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md active:scale-[0.99]">
        <div
          className={cn(
            "relative aspect-[5/4] overflow-hidden bg-muted",
            !card.imageUrl && "bg-gradient-to-br from-stone-200/90 via-stone-100 to-amber-50",
          )}
        >
          {card.imageUrl ? (
            <Image
              src={card.imageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-foreground/15" strokeWidth={1.25} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-4">
            <h3 className="line-clamp-1 font-display text-base font-semibold tracking-tight text-white sm:text-[17px]">
              {card.title}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-white/80">{card.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-3.5 py-3 sm:px-4">
          <p className="text-xs text-muted-foreground">
            {card.productCount} {countLabel}
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground sm:text-sm">
            {viewAllLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </article>
    </Link>
  );
}

export function HomeRecommendationsSection({
  id,
  title,
  description,
  cards,
  productLabel,
  productsLabel,
  viewAllLabel,
  className,
}: {
  id?: string;
  title: string;
  description: string;
  cards: RecommendationCardItem[];
  productLabel: string;
  productsLabel: string;
  viewAllLabel: string;
  className?: string;
}) {
  if (cards.length === 0) return null;

  return (
    <section id={id} className={cn("py-8 sm:py-10 scroll-mt-20", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 max-w-xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {cards.map((card) => (
            <RecommendationCard
              key={card.slug}
              card={card}
              productLabel={productLabel}
              productsLabel={productsLabel}
              viewAllLabel={viewAllLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
