import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgressBar from "@/components/ProgressBar";

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
  metadataBase: new URL("https://www.ecbtechkenya.com"),
  title: "ECB Technologies | Electronics Store in Nairobi, Kenya",
  description:
    "Shop laptops, phones, accessories and more at ECB Technologies, Nairobi's trusted electronics store.",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ECB Technologies",
  url: "https://www.ecbtechkenya.com",
  logo: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/2025/04/Ebc-864-by-216-6.png`,
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
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
