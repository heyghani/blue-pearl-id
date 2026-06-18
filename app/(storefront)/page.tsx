import Link from "next/link";
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
import { APP_NAME } from "@/lib/constants";
import {
  getBestSellerProducts,
  getFeaturedProducts,
  toProductCard,
} from "@/lib/products";

const faqs = [
  {
    question: "Do you ship internationally?",
    answer:
      "Yes. We offer Standard and Express shipping worldwide. Rates are shown at checkout in USD.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept major credit cards via Midtrans and PayPal for a secure, familiar checkout experience.",
  },
  {
    question: "Are import duties included?",
    answer:
      "Import duties, VAT, and local taxes are not included and may be charged upon delivery depending on your country.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order ships, you will receive a confirmation email with tracking details.",
  },
];

const testimonials = [
  {
    quote:
      "Exceptional quality and a seamless checkout. My necklace arrived beautifully packaged.",
    author: "Mei L.",
    location: "Shanghai",
  },
  {
    quote:
      "Fast international shipping and clear pricing. Exactly what I expected from a premium brand.",
    author: "Sarah K.",
    location: "Singapore",
  },
];

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
      <section className="relative overflow-hidden border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Fine Jewelry · Worldwide
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Pearls of distinction, delivered to your door
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Discover curated pearl collections crafted for discerning collectors.
              Secure checkout, worldwide shipping, and transparent USD pricing.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/products">
                  Shop Collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/products?featured=true">Featured Pieces</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              <span>Secure payment · Guest checkout available</span>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      <ProductSection
        title="Featured"
        description="Hand-selected pieces from our latest collection."
        products={featured}
        emptyMessage="Featured products will appear here once the catalog is seeded."
      />

      <ProductSection
        title="Best Sellers"
        description="Beloved by collectors around the world."
        products={bestSellers}
        emptyMessage="Best sellers will appear here once products are added."
        className="bg-muted/30"
      />

      <section className="border-y bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Trusted by collectors worldwide
            </h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
            {testimonials.map((item) => (
              <blockquote
                key={item.author}
                className="rounded-lg border bg-card p-6 text-left shadow-sm"
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
            <h2 className="text-2xl font-semibold tracking-tight">
              Frequently asked questions
            </h2>
            <p className="mt-2 text-muted-foreground">
              Everything you need to know about shopping with {APP_NAME}.
            </p>
          </div>
          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((faq, index) => (
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
