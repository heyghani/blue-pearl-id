import { CURRENCY } from "@/lib/constants";

interface ProductJsonLdProps {
  name: string;
  description?: string | null;
  sku: string;
  image: string[];
  price: string;
  inStock: boolean;
  url: string;
}

export function ProductJsonLd({
  name,
  description,
  sku,
  image,
  price,
  inStock,
  url,
}: ProductJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description ?? undefined,
    sku,
    image: image.length > 0 ? image : undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: CURRENCY,
      price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
