import Link from "next/link";
import { BUSINESS, SITE_URL, STREET_ADDRESS, jsonLdHtml, whatsappUrl } from "@/lib/business";
import { DELIVERY_STATS, SURCHARGE_NOTE, deliveryZones } from "@/lib/delivery";
import { pageMetadata } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";

const { townCount, minFee, maxFee } = DELIVERY_STATS;

export const metadata = pageMetadata({
  title: "Electronics Delivery Across Kenya: Fees by Town",
  description: `ECB Technologies delivers laptops, phones and accessories to ${townCount} towns across Kenya via Fargo Courier, from ${formatPrice(minFee)}. Free pickup in Nairobi CBD.`,
  path: "/delivery",
});

const FAQS = [
  {
    q: "Do you deliver outside Nairobi?",
    a: `Yes. We deliver to ${townCount} towns across Kenya through Fargo Courier. Find your town in the list below to see the fee.`,
  },
  {
    q: "How much does delivery cost?",
    a: `Between ${formatPrice(minFee)} and ${formatPrice(maxFee)} depending on the town. The exact fee for your town is added at checkout before you pay.`,
  },
  {
    q: "Where do I collect my order?",
    a: "Orders are delivered to the Fargo Courier branch in the town you choose, and you collect them from there.",
  },
  {
    q: "Can I collect from your shop instead?",
    a: `Yes, pickup is free at ${STREET_ADDRESS}, ${BUSINESS.address.area}. ${BUSINESS.hoursDisplay}.`,
  },
  {
    q: "How do I pay?",
    a: "Pay online with M-Pesa or a debit/credit card at checkout. We start processing your order once payment is confirmed.",
  },
  {
    q: "My town is not on the list. Can you still deliver?",
    a: `Message us on WhatsApp on ${BUSINESS.phoneDisplay} with your town and the product you want, and we'll tell you the options.`,
  },
];

export default function DeliveryPage() {
  const zones = deliveryZones();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Delivery", item: `${SITE_URL}/delivery` },
    ],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd)} />

      <section className="mx-auto max-w-[980px] px-6 pb-14 pt-14 sm:pt-20">
        <h1 className="type-hero text-ink">Delivery across Kenya.</h1>
        <p className="type-lead mt-4 max-w-2xl text-ink-80">
          We deliver to {townCount} towns through Fargo Courier, from {formatPrice(minFee)}. Or
          pick up free at our shop on {BUSINESS.address.street}, {BUSINESS.address.area}.
        </p>

        <nav aria-label="Delivery regions" className="mt-8 flex flex-wrap gap-2">
          {zones.map((zone) => (
            <a key={zone.slug} href={`#${zone.slug}`} className="chip">
              {zone.label}
            </a>
          ))}
        </nav>
      </section>

      <section className="bg-parchment py-14 sm:py-20">
        <div className="mx-auto max-w-[980px] space-y-14 px-6">
          {zones.map((zone) => (
            <div key={zone.slug} id={zone.slug} className="scroll-mt-24">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="type-tagline text-ink">{zone.label}</h2>
                <p className="type-caption text-ink-48">
                  {zone.towns.length} towns ·{" "}
                  {zone.minFee === zone.maxFee
                    ? formatPrice(zone.minFee)
                    : `${formatPrice(zone.minFee)}–${formatPrice(zone.maxFee)}`}
                </p>
              </div>
              <table className="mt-4 w-full overflow-hidden rounded-[18px] bg-white text-[15px]">
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Town</th>
                    <th scope="col">Delivery fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {zone.towns.map((town) => (
                    <tr key={town.town}>
                      <th scope="row" className="px-5 py-3 text-left font-normal text-ink">
                        {town.town}
                        {town.surcharge && (
                          <span className="type-fine mt-0.5 block text-ink-48">{SURCHARGE_NOTE}</span>
                        )}
                      </th>
                      <td className="px-5 py-3 text-right align-top text-ink-80">{formatPrice(town.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[980px] px-6 py-16 sm:py-20">
        <h2 className="type-display text-ink">Questions.</h2>
        <dl className="mt-8 divide-y divide-hairline border-y border-hairline">
          {FAQS.map((faq) => (
            <div key={faq.q} className="py-6">
              <dt className="type-tagline text-ink">{faq.q}</dt>
              <dd className="mt-2 text-[17px] text-ink-80">{faq.a}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/products" className="btn-primary">
            Shop now
          </Link>
          <a href={whatsappUrl("Hi ECB Technologies, I'd like to ask about delivery to my town.")} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            Ask on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
