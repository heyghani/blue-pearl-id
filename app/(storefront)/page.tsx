import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductRail } from "@/components/catalog/product-rail";
import { HomeCategorySection } from "@/components/home/home-category-section";
import { HomeRecommendationsSection } from "@/components/home/home-recommendation-card";
import { getActiveCategoryTree, getHomepageCategoryItems } from "@/lib/categories";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import {
  getFeaturedRecommendationsByCategory,
  getHalloweenProducts,
  toProductCard,
} from "@/lib/products";

const HomeFaq = dynamic(
  () => import("@/components/home/home-faq").then((mod) => mod.HomeFaq),
);

export const revalidate = 60;

async function getFeaturedSection() {
  try {
    const categories = await getFeaturedRecommendationsByCategory();
    return { categories };
  } catch {
    return { categories: [] };
  }
}

async function getHalloweenSection() {
  try {
    const products = await getHalloweenProducts(8);
    return { products: products.map(toProductCard) };
  } catch {
    return { products: [] };
  }
}

export default async function HomePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const [{ categories: featuredCategories }, categoryTree, halloween] =
    await Promise.all([
      getFeaturedSection(),
      getActiveCategoryTree().catch(() => []),
      getHalloweenSection(),
    ]);

  const categories = getHomepageCategoryItems(
    categoryTree.filter(
      (category) =>
        category._count.products > 0 ||
        category.children.length > 0 ||
        category.children.some((child) => child._count.products > 0),
    ),
  );

  const recommendationCards = featuredCategories.map((category) => ({
    slug: category.slug,
    title: category.name,
    description: category.description?.trim() || t.home.featuredCategoryDesc,
    href: `/products?featured=true&category=${category.slug}`,
    imageUrl: category.imageUrl,
    productCount: category.productCount,
  }));

  return (
    <>
      <section className="relative -mx-4 overflow-hidden sm:mx-0 sm:rounded-3xl">
        <div className="relative aspect-[4/5] sm:aspect-[21/9] sm:min-h-[420px]">
          <Image
            src="/images/hero-cover.jpg"
            alt={t.home.headline}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_35%]"
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
                  className="h-12 rounded-md bg-white px-8 font-display text-sm font-semibold uppercase tracking-wide text-foreground shadow-lg hover:bg-white/90"
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
                  className="h-12 rounded-md border-white/40 bg-white/10 px-8 font-display text-sm font-semibold uppercase tracking-wide text-white backdrop-blur hover:bg-white/20 hover:text-white"
                  asChild
                >
                  <Link href="/#recommendations">{t.home.viewFeatured}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {halloween.products.length > 0 ? (
        <ProductRail
          id="halloween"
          title={t.home.halloweenTitle}
          description={t.home.halloweenDesc}
          products={halloween.products}
          viewAllLabel={t.home.halloweenCta}
          viewAllHref="/halloween"
          className="border-t border-border/60 bg-[linear-gradient(180deg,rgba(28,16,8,0.04),transparent_60%)]"
        />
      ) : (
        <section id="halloween" className="scroll-mt-20 border-t border-border/60 py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/halloween"
              className="group relative block overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(120,40,10,0.18),transparent_55%),linear-gradient(135deg,rgba(20,12,8,0.92),rgba(40,22,12,0.75))]" />
              <div className="relative flex flex-col gap-4 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
                <div className="max-w-xl text-white">
                  <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/60">
                    {t.nav.halloween}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    {t.home.halloweenTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-base">
                    {t.home.halloweenDesc}
                  </p>
                </div>
                <div className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 text-sm font-medium text-white backdrop-blur transition-colors group-hover:bg-white/20">
                  {t.home.halloweenCta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {recommendationCards.length > 0 ? (
        <HomeRecommendationsSection
          id="recommendations"
          title={t.home.recommendationsTitle}
          description={t.home.recommendationsDesc}
          cards={recommendationCards}
          productLabel={t.catalog.product}
          productsLabel={t.catalog.products}
          viewAllLabel={t.home.viewAll}
        />
      ) : null}

      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/lookbook"
            className="group relative block overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="absolute inset-0 bg-[url('/images/hero-cover.jpg')] bg-cover bg-center opacity-25 transition-opacity group-hover:opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
            <div className="relative flex flex-col gap-4 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
              <div className="max-w-xl">
                <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
                  {t.lookbook.eyebrow}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  {t.home.lookbookTitle}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {t.home.lookbookDesc}
                </p>
              </div>
              <div className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-input bg-background px-6 text-sm font-medium shadow-sm transition-colors group-hover:bg-accent">
                {t.home.lookbookCta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      <HomeCategorySection
        categories={categories}
        title={t.home.shopByCategory}
        description={t.home.shopByCategoryDesc}
        viewAllLabel={t.home.viewAll}
        productLabel={t.catalog.product}
        productsLabel={t.catalog.products}
        className="border-t border-border/60 bg-muted/20"
      />

      {recommendationCards.length === 0 ? (
        <section className="py-16">
          <p className="mx-auto max-w-md rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">
            {t.home.emptyProducts}
          </p>
        </section>
      ) : null}

      <HomeFaq title={t.home.faqTitle} subtitle={t.home.faqSubtitle} faqs={t.faqs} />
    </>
  );
}
