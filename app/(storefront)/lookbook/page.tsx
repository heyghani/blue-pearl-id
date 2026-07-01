import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "Editorial highlights from the PrimeLuxr collection.",
};

const LOOKBOOK_IMAGES = [
  {
    src: "/images/hero-cover.jpg",
    alt: "Structured leather tote in warm light",
    caption: "Structured carry",
  },
  {
    src: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80",
    alt: "Crossbody bag styled for evening",
    caption: "Evening edit",
  },
  {
    src: "https://images.unsplash.com/photo-1584917865442-de89d76ffb48?auto=format&fit=crop&w=1200&q=80",
    alt: "Minimal shoulder bag on marble",
    caption: "Quiet luxury",
  },
  {
    src: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80",
    alt: "Compact clutch with gold hardware",
    caption: "Hardware detail",
  },
];

export default async function LookbookPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="pb-16">
      <section className="border-b border-border/60 bg-muted/20 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            {t.lookbook.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {t.lookbook.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t.lookbook.lead}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:px-8">
        {LOOKBOOK_IMAGES.map((image, index) => (
          <figure
            key={image.caption}
            className={index === 0 ? "sm:col-span-2" : undefined}
          >
            <div
              className={`relative overflow-hidden rounded-3xl bg-muted ${
                index === 0 ? "aspect-[21/9]" : "aspect-[4/5]"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes={
                  index === 0
                    ? "(max-width: 768px) 100vw, 1200px"
                    : "(max-width: 768px) 100vw, 600px"
                }
                priority={index === 0}
              />
            </div>
            <figcaption className="mt-3 text-sm text-muted-foreground">
              {image.caption}
            </figcaption>
          </figure>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t.lookbook.closing}
        </p>
        <Button size="lg" className="mt-8 rounded-full px-8" asChild>
          <Link href="/products">
            {t.lookbook.shopCta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
