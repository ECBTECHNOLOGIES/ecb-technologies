import { pageMetadata } from "@/lib/seo";
import { Clock, Mail, MapPin, MessageCircle, Phone, Star } from "lucide-react";
import { ADDRESS_LINE, BUSINESS, STREET_ADDRESS, GOOGLE_PROFILE_URL, GOOGLE_REVIEWS, MAPS_EMBED_URL, MAPS_URL, SITE_URL, jsonLdHtml, whatsappUrl } from "@/lib/business";

export const metadata = pageMetadata({
  title: "Contact & Shop Location, Moi Avenue Nairobi",
  description:
    "Visit ECB Technologies at Iconic Business Plaza, 3rd Floor, Room T12, Moi Avenue, Nairobi CBD. Open daily 9am–7pm. Call or WhatsApp 0717 040 531.",
  path: "/contact",
});

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
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdHtml(contactPageJsonLd)}
      />

      <section className="mx-auto max-w-[980px] px-6 pb-16 pt-14 sm:pt-20">
        <h1 className="type-hero text-ink">Get in touch.</h1>
        <p className="type-lead mt-4 max-w-2xl text-ink-80">
          Questions about a product or an order? Call, WhatsApp or email us, or visit the
          shop, where you can also pick up online orders for free.
        </p>

        <dl className="mt-12 grid gap-x-12 border-t border-hairline sm:grid-cols-2">
          {CONTACT_DETAILS.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex gap-4 border-b border-hairline py-6">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ink-48" strokeWidth={1.5} />
              <div className="min-w-0">
                <dt className="type-caption text-ink-48">{label}</dt>
                <dd className="mt-0.5 text-[17px] text-ink">
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="break-words hover:text-primary"
                    >
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-parchment py-16 sm:py-20">
        <div className="mx-auto max-w-[980px] px-6">
          <h2 className="type-display text-ink">Find the shop.</h2>
          <p className="type-lead mt-3 text-ink-80">
            {STREET_ADDRESS}, {BUSINESS.address.area}.
          </p>
          <div className="mt-8 aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-white sm:aspect-video">
            <iframe
              src={MAPS_EMBED_URL}
              title={`Map showing ${BUSINESS.name} at ${ADDRESS_LINE}`}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={GOOGLE_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Get directions
            </a>
            <a
              href={GOOGLE_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              ★ {GOOGLE_REVIEWS.rating} · Read {GOOGLE_REVIEWS.count} Google reviews
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
