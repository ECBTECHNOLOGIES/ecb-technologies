import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ADDRESS_LINE, BUSINESS, MAPS_URL, SITE_URL, jsonLdHtml, whatsappUrl } from "@/lib/business";

export const metadata = {
  title: "Contact & Shop Location - Moi Avenue, Nairobi CBD",
  description:
    "Visit ECB Technologies at Iconic Business Plaza, Moi Avenue, Nairobi CBD, or call, WhatsApp or email us about laptops, phones and accessories.",
  alternates: { canonical: "/contact" },
};

const CONTACT_DETAILS = [
  {
    icon: Phone,
    label: "Call Us",
    value: BUSINESS.phoneDisplay,
    href: `tel:${BUSINESS.phoneE164}`,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: BUSINESS.phoneDisplay,
    href: whatsappUrl(),
  },
  {
    icon: Mail,
    label: "Email",
    value: BUSINESS.email,
    href: `mailto:${BUSINESS.email}`,
  },
  {
    icon: MapPin,
    label: "Shop Location",
    value: `${ADDRESS_LINE} (${BUSINESS.address.area})`,
    href: MAPS_URL,
  },
  {
    icon: Clock,
    label: "Opening Hours",
    value: BUSINESS.hoursDisplay,
  },
];

const contactPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  url: `${SITE_URL}/contact`,
  about: { "@id": `${SITE_URL}/#store` },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdHtml(contactPageJsonLd)}
      />
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Contact Us</h1>
      <p className="mt-2 text-gray-600">
        Have a question about a product or order? Reach out to us through any
        of the channels below, or visit our shop at {ADDRESS_LINE} in Nairobi
        CBD, where you can also pick up online orders for free.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {CONTACT_DETAILS.map(({ icon: Icon, label, value, href }) => {
          const className =
            "flex items-start gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:border-brand-blue hover:bg-brand-blue/5";
          const inner = (
            <>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  {label}
                </p>
                <p className="mt-1 font-medium text-gray-900">{value}</p>
              </div>
            </>
          );

          if (!href) {
            return (
              <div key={label} className={className}>
                {inner}
              </div>
            );
          }

          return (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className={className}
            >
              {inner}
            </a>
          );
        })}
      </div>
    </div>
  );
}
