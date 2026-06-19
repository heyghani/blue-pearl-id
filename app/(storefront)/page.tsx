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
import { ProductCard } from "@/components/catalog/product-card";
import { TrustBar } from "@/components/layout/trust-bar";
import { DutiesNotice } from "@/components/shared/duties-notice";
import { homeCopy } from "@/lib/copy";
import {
  getBestSellerProducts,
  getFeaturedProducts,
  toProductCard,
} from "@/lib/products";

async function getProductSections() {
  try {
    const [featured, bestSellers] = await Promise.all([
      getFeaturedProducts(),
      getBestSellerProducts(),
    ]);
    return {
      featured: featured.map(toProductCard),
      bestSellers: bestSellers.map(toProductCard),
    };
  } catch {
    return { featured: [], bestSellers: [] };
  }
}

export default async function HomePage() {
  const { featured, bestSellers } = await getProductSections();

  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1920&q=80"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[var(--pearl)]">
              {homeCopy.eyebrow}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              {homeCopy.headline}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {homeCopy.subhead}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="shadow-sm" asChild>
                <Link href="/products">
                  Shop Collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-background/80 backdrop-blur" asChild>
                <Link href="/products?featured=true">Featured Pieces</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-[var(--pearl)]" aria-hidden />
              <span>Card & PayPal accepted · Prices in USD</span>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      <ProductSection
        title={homeCopy.featured.title}
        description={homeCopy.featured.description}
        products={featured}
        emptyMessage="No featured products yet."
      />

      <ProductSection
        title={homeCopy.bestSellers.title}
        description={homeCopy.bestSellers.description}
        products={bestSellers}
        emptyMessage="No products yet."
        className="bg-muted/30"
      />

      <section className="border-y bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Customer notes</h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
            {homeCopy.testimonials.map((item) => (
              <blockquote
                key={item.author}
                className="rounded-xl border bg-card p-6 text-left shadow-sm ring-1 ring-black/[0.03]"
              >
                <p className="text-muted-foreground">&ldquo;{item.quote}&rdquo;</p>
                <footer className="mt-4 text-sm font-medium">
                  {item.author}
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    · {item.location}
                  </span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
            <p className="mt-2 text-muted-foreground">
              Shipping, payment, and duties — the basics.
            </p>
          </div>
          <Accordion type="single" collapsible className="mt-10">
            {homeCopy.faqs.map((faq, index) => (
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

function ProductSection({
  title,
  description,
  products,
  emptyMessage,
  className,
}: {
  title: string;
  description: string;
  products: ReturnType<typeof toProductCard>[];
  emptyMessage: string;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-1 text-muted-foreground">{description}</p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/products">View all</Link>
          </Button>
        </div>

        {products.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-10 rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        )}
      </div>
    </section>
  );
}
