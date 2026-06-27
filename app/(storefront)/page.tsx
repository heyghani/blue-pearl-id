import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ProductRail } from "@/components/catalog/product-rail";
import { getActiveCategoryTree } from "@/lib/categories";
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
  const [{ featured, trending }, categoryTree] = await Promise.all([
    getProductSections(),
    getActiveCategoryTree().catch(() => []),
  ]);

  const categories = categoryTree.filter(
    (category) =>
      category._count.products > 0 ||
      category.children.length > 0 ||
      category.children.some((child) => child._count.products > 0),
  );

  return (
    <>
      <section className="relative -mx-4 overflow-hidden sm:mx-0 sm:rounded-3xl">
        <div className="relative aspect-[4/5] sm:aspect-[21/9] sm:min-h-[420px]">
          <Image
            src="/images/hero-cover.png"
            alt=""
            fill
            priority
            className="object-cover object-[center_35%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10 sm:bg-gradient-to-r sm:from-black/70 sm:via-black/35 sm:to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:justify-center sm:p-12 lg:p-16">
            <div className="max-w-lg text-white">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.3em] text-white/70 sm:text-xs">
                {t.home.eyebrow}
              </p>
              <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                {t.home.headline}
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
                {t.home.subhead}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-white px-8 text-foreground shadow-lg hover:bg-white/90"
                  asChild
                >
                  <Link href="/products">
                    {t.home.shopNow}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/40 bg-white/10 px-8 text-white backdrop-blur hover:bg-white/20 hover:text-white"
                  asChild
                >
                  <Link href="/products?featured=true">{t.home.viewFeatured}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <section className="py-8 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-4 font-display text-lg font-medium tracking-tight sm:text-xl">
              {t.home.shopByCategory}
            </p>
            <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                  className="shrink-0 rounded-full border border-border/80 bg-card/90 px-5 py-2.5 text-sm font-medium shadow-sm transition-all hover:border-[var(--pearl)] hover:shadow-md active:scale-[0.98]"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

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
        className="border-t border-border/60 bg-muted/30"
      />

      {featured.length === 0 && trending.length === 0 ? (
        <section className="py-16">
          <p className="mx-auto max-w-md rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">
            {t.home.emptyProducts}
          </p>
        </section>
      ) : null}

      <section id="faq" className="border-t border-border/60 py-14 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-10">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {t.home.faqTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{t.home.faqSubtitle}</p>
          </div>
          <Accordion type="single" collapsible className="surface-card divide-y px-1">
            {t.faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`} className="border-0 px-4">
                <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
