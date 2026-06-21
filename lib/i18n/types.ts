export const LOCALES = ["en", "zh", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  es: "Español",
};

export const LOCALE_COOKIE = "bp-locale";

export interface Dictionary {
  nav: {
    shop: string;
    featured: string;
    faq: string;
    shipping: string;
    signIn: string;
    account: string;
    search: string;
    openMenu: string;
    closeMenu: string;
  };
  home: {
    eyebrow: string;
    headline: string;
    subhead: string;
    shopNow: string;
    viewFeatured: string;
    trustLine: string;
    featuredTitle: string;
    featuredDesc: string;
    trendingTitle: string;
    trendingDesc: string;
    viewAll: string;
    emptyFeatured: string;
    emptyProducts: string;
    faqTitle: string;
    faqSubtitle: string;
    shopByCategory: string;
  };
  faqs: Array<{ question: string; answer: string }>;
  trust: {
    secure: string;
    shipping: string;
    returns: string;
  };
  footer: {
    tagline: string;
    shop: string;
    support: string;
    legal: string;
    allProducts: string;
    newArrivals: string;
    contact: string;
    whatsapp: string;
    privacy: string;
    terms: string;
    returns: string;
    copyright: string;
    priceNote: string;
  };
  catalog: {
    collection: string;
    shopAll: string;
    featured: string;
    product: string;
    products: string;
    searchFor: string;
    searchPlaceholder: string;
    clearSearch: string;
    sortLabel: string;
    categories: string;
    allProducts: string;
    sortNewest: string;
    sortFeatured: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    emptyResults: string;
    clearFilters: string;
    previous: string;
    next: string;
    pageOf: string;
  };
  product: {
    description: string;
    specifications: string;
    related: string;
    inStock: string;
    outOfStock: string;
    noImage: string;
    noImageAvailable: string;
    viewImage: string;
    back: string;
    shop: string;
    buyNow: string;
    addToCart: string;
    adding: string;
    addedToCart: string;
    viewCart: string;
    noDescription: string;
    noSpecs: string;
    selectOptions: string;
  };
  common: {
    taxNotice: string;
  };
  whatsapp: {
    label: string;
    ariaLabel: string;
    prefilledMessage: string;
  };
  checkout: {
    informationLead: string;
    secureBadge: string;
    processingTitle: string;
    processingCardNote: string;
    processingPayPalNote: string;
    openingPayment: string;
    redirectingPayPal: string;
    cardCharge: string;
    liveRate: string;
    fallbackRate: string;
    manualOpen: string;
    continuePayment: string;
    paymentNotConfigured: string;
    viewOrderStatus: string;
  };
}
