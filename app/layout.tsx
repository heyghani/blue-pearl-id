import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";

import { LocaleProvider } from "@/components/i18n/locale-provider";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const OG_IMAGE = {
  url: "/images/og-image.png",
  width: 787,
  height: 1024,
  alt: "PrimeLuxr — Luxury OEM handbags and accessories",
};

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? "854c868d465b316a",
  },
  icons: {
    icon: [
      { url: "/images/logo-icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);

  return (
    <html lang={locale} className={`${inter.variable} ${cormorant.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans">
        <LocaleProvider locale={locale} dictionary={dictionary}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
