import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgressBar from "@/components/ProgressBar";
import { BUSINESS, GOOGLE_PROFILE_URL, MAPS_URL, SITE_URL, STREET_ADDRESS, jsonLdHtml } from "@/lib/business";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ECB Technologies | Laptops, Phones & Electronics Shop in Nairobi CBD",
    template: "%s | ECB Technologies",
  },
  description:
    "Shop laptops, phones and accessories at ECB Technologies, Iconic Business Plaza (3rd Floor, Room T12), Moi Avenue, Nairobi CBD. Order online with M-Pesa or card, pick up in store or get delivery across Kenya.",
  openGraph: {
    type: "website",
    siteName: BUSINESS.name,
    locale: "en_KE",
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
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
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
