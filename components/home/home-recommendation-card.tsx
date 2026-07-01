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
  featured,
}: {
  card: RecommendationCardItem;
  productLabel: string;
  productsLabel: string;
  viewAllLabel: string;
  featured?: boolean;
}) {
  const countLabel = card.productCount === 1 ? productLabel : productsLabel;

  return (
    <Link href={card.href} className="group block">
      <article className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md active:scale-[0.995]">
        <div
          className={cn(
            "relative overflow-hidden bg-muted",
            featured ? "aspect-[16/9] sm:aspect-[21/9]" : "aspect-[16/9]",
            !card.imageUrl && "bg-gradient-to-br from-stone-200/90 via-stone-100 to-amber-50",
          )}
        >
          {card.imageUrl ? (
            <Image
              src={card.imageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes={
                featured
                  ? "(max-width: 1280px) 100vw, 1280px"
                  : "(max-width: 768px) 100vw, 600px"
              }
              priority={featured}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-foreground/15" strokeWidth={1.25} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <h3
              className={cn(
                "font-display font-semibold tracking-tight text-white",
                featured ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
              )}
            >
              {card.title}
            </h3>
            <p className="mt-1.5 line-clamp-2 max-w-md text-sm text-white/85">{card.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <p className="text-sm text-muted-foreground">
            {card.productCount} {countLabel}
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            {viewAllLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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

  const isSingle = cards.length === 1;

  return (
    <section id={id} className={cn("py-10 sm:py-14 scroll-mt-20", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 max-w-xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        </div>

        {isSingle ? (
          <RecommendationCard
            card={cards[0]}
            productLabel={productLabel}
            productsLabel={productsLabel}
            viewAllLabel={viewAllLabel}
            featured
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
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
        )}
      </div>
    </section>
  );
}
