import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone, Star } from "lucide-react";
import { ADDRESS_LINE, BUSINESS, STREET_ADDRESS, GOOGLE_PROFILE_URL, GOOGLE_REVIEWS, MAPS_EMBED_URL, MAPS_URL, SITE_URL, jsonLdHtml, whatsappUrl } from "@/lib/business";

export const metadata = {
  title: "Contact & Shop Location - Moi Avenue, Nairobi CBD",
  description:
    "Visit ECB Technologies at Iconic Business Plaza, 3rd Floor, Room T12, Moi Avenue, Nairobi CBD, or call, WhatsApp or email us about laptops, phones and accessories.",
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
  {
    icon: Star,
    label: "Google Reviews",
    value: `Rated ${GOOGLE_REVIEWS.rating} from ${GOOGLE_REVIEWS.count} reviews`,
    href: GOOGLE_PROFILE_URL,
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
        of the channels below, or visit our shop at {STREET_ADDRESS},{" "}
        {BUSINESS.address.area}, where you can also pick up online orders for free.
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

      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-900">Find Our Shop</h2>
        <p className="mt-1 text-sm text-gray-600">
          {STREET_ADDRESS}, {BUSINESS.address.area}.
        </p>
        <div className="mt-4 aspect-[4/3] w-full overflow-hidden rounded-lg border border-gray-200 sm:aspect-video">
          <iframe
            src={MAPS_EMBED_URL}
            title={`Map showing ${BUSINESS.name} at ${ADDRESS_LINE}`}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <a
            href={GOOGLE_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2651AB]"
          >
            <Navigation className="h-4 w-4" />
            Get Directions on Google
          </a>
          <a
            href={GOOGLE_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue transition-colors hover:bg-brand-blue hover:text-white"
          >
            <Star className="h-4 w-4" />
            {GOOGLE_REVIEWS.rating} ★ · Read our {GOOGLE_REVIEWS.count} Google reviews
          </a>
        </div>
      </section>
    </div>
  );
}
