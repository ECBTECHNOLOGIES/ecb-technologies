import { BUSINESS, GOOGLE_PROFILE_URL, GOOGLE_REVIEWS, STREET_ADDRESS, whatsappUrl } from "@/lib/business";

export default function StoreVisit() {
  return (
    <section className="bg-white px-6 py-16 text-center sm:py-24">
      <p className="type-caption font-semibold text-ink-48">Visit the shop</p>
      <h2 className="type-display mx-auto mt-2 max-w-2xl text-ink">See it in person before you buy.</h2>
      <p className="type-lead mx-auto mt-4 max-w-xl text-ink-80">
        {STREET_ADDRESS}, {BUSINESS.address.area}. {BUSINESS.hoursDisplay}.
      </p>
      <p className="type-caption mt-3 text-ink-48">
        Rated {GOOGLE_REVIEWS.rating} from {GOOGLE_REVIEWS.count} Google reviews
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
          Get directions
        </a>
        <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn-secondary">
          Chat on WhatsApp
        </a>
      </div>
    </section>
  );
}
