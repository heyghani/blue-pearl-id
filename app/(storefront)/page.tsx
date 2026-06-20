import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ProductRail } from "@/components/catalog/product-rail";
import { TrustBar } from "@/components/layout/trust-bar";
import { DutiesNotice } from "@/components/shared/duties-notice";
import { getActiveCategories } from "@/lib/categories";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import {
  getBestSellerProducts,
  getFeaturedProducts,
  toProductCard,
} from "@/lib/products";

async function getProductSections() {
  try {
    const [featured, trending] = await Promise.all([
      getFeaturedProducts(),
      getBestSellerProducts(),
    ]);
    return {
      featured: featured.map(toProductCard),
      trending: trending.map(toProductCard),
    };
  } catch {
    return { featured: [], trending: [] };
  }
}

export default async function HomePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const [{ featured, trending }, categories] = await Promise.all([
    getProductSections(),
    getActiveCategories().catch(() => []),
  ]);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1920&q=80"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--pearl)] sm:text-sm">
              {t.home.eyebrow}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              {t.home.headline}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.home.subhead}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="h-12 min-w-[160px] rounded-full px-8 shadow-sm" asChild>
                <Link href="/products">
                  {t.home.shopNow}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 min-w-[160px] rounded-full bg-background/80 px-8 backdrop-blur"
                asChild
              >
                <Link href="/products?featured=true">{t.home.viewFeatured}</Link>
              </Button>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground sm:text-sm">
              <ShieldCheck className="h-4 w-4 text-[var(--pearl)]" aria-hidden />
              <span>{t.home.trustLine}</span>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <section className="border-b bg-background py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.home.shopByCategory}
            </p>
            <div className="flex justify-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                  className="shrink-0 rounded-full border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-[var(--pearl)] hover:text-[var(--pearl)]"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <TrustBar />

      <ProductRail
        title={t.home.featuredTitle}
        description={t.home.featuredDesc}
        products={featured}
        viewAllLabel={t.home.viewAll}
        viewAllHref="/products?featured=true"
      />

      <ProductRail
        title={t.home.trendingTitle}
        description={t.home.trendingDesc}
        products={trending}
        viewAllLabel={t.home.viewAll}
        className="border-t bg-muted/20"
      />

      {featured.length === 0 && trending.length === 0 ? (
        <section className="py-16">
          <p className="mx-auto max-w-md rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">
            {t.home.emptyProducts}
          </p>
        </section>
      ) : null}

      <section id="faq" className="border-t py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">{t.home.faqTitle}</h2>
            <p className="mt-2 text-muted-foreground">{t.home.faqSubtitle}</p>
          </div>
          <Accordion type="single" collapsible className="mt-10">
            {t.faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <DutiesNotice className="mt-8 text-center" />
        </div>
      </section>
    </>
  );
}
