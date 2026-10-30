import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgressBar from "@/components/ProgressBar";
import { BUSINESS, GOOGLE_PROFILE_URL, MAPS_URL, SITE_URL, STREET_ADDRESS, jsonLdHtml } from "@/lib/business";
import { DEFAULT_SHARE_IMAGE, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | ECB Technologies",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: BUSINESS.name,
    locale: "en_KE",
    images: [DEFAULT_SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_SHARE_IMAGE.url],
  },
};

const storeId = `${SITE_URL}/#store`;

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: BUSINESS.name,
      url: SITE_URL,
      publisher: { "@id": storeId },
      inLanguage: "en-KE",
    },
    {
      "@type": "ElectronicsStore",
      "@id": storeId,
      name: BUSINESS.name,
      alternateName: BUSINESS.alternateName,
      url: SITE_URL,
      logo: BUSINESS.logo,
      image: BUSINESS.logo,
      telephone: BUSINESS.phoneE164,
      email: BUSINESS.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: STREET_ADDRESS,
        addressLocality: BUSINESS.address.city,
        addressCountry: BUSINESS.address.country,
      },
      hasMap: MAPS_URL,
      // Ties this website to the Google Business Profile as the same entity.
      sameAs: [GOOGLE_PROFILE_URL],
      openingHoursSpecification: BUSINESS.openingHours.map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.days,
        opens: h.opens,
        closes: h.closes,
      })),
      paymentAccepted: "M-Pesa, Credit Card, Debit Card",
      currenciesAccepted: "KES",
      areaServed: { "@type": "Country", name: "Kenya" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdHtml(siteJsonLd)}
        />
        <Suspense fallback={null}>
          <ProgressBar />
        </Suspense>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
