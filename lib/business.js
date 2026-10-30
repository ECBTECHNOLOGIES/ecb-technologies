// Single source of truth for ECB's public business details (name, address,
// phone, hours). Everything that shows or marks up these details - footer,
// contact page, checkout pickup note, JSON-LD - should read from here so the
// website never contradicts itself or the Google Business Profile.

export const SITE_URL = "https://www.ecbtechkenya.com";

export const BUSINESS = {
  name: "ECB Technologies",
  // The Google Business Profile is listed as "ECB TECHNOLOGIES KENYA".
  alternateName: "ECB Technologies Kenya",
  url: SITE_URL,
  logo: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/2025/04/Ebc-864-by-216-6.png`,
  phoneDisplay: "0717 040 531",
  phoneE164: "+254717040531",
  whatsappNumber: "254717040531",
  email: "ecbtechnologies001@gmail.com",
  address: {
    // Building name as Google Maps lists it ("Located in"); floor and room
    // from the Business Profile description.
    building: "Techmart Iconic Business Plaza",
    unit: "3rd Floor, Room T12",
    street: "Moi Avenue",
    area: "Nairobi CBD",
    city: "Nairobi",
    country: "KE",
  },
  // Same hours shown to customers choosing store pickup at checkout.
  // TODO: the Google Business Profile shows an 8:30am opening - confirm
  // which is right and make both match.
  hoursDisplay: "Mon–Fri 8am–5:30pm, Sat–Sun & public holidays 8am–12pm",
  openingHours: [
    {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:30",
    },
    { days: ["Saturday", "Sunday"], opens: "08:00", closes: "12:00" },
  ],
};

export const STREET_ADDRESS = `${BUSINESS.address.building}, ${BUSINESS.address.unit}, ${BUSINESS.address.street}`;

export const ADDRESS_LINE = `${STREET_ADDRESS}, ${BUSINESS.address.city}`;

// The real Google Business Profile listing - opens the pin, directions and
// reviews, rather than a fuzzy Maps text search.
export const GOOGLE_PROFILE_URL = "https://share.google/56ymLkB3i6DS0HHvJ";
export const MAPS_URL = GOOGLE_PROFILE_URL;

// Keyless Google Maps embed, searched by the profile's own name and street so
// the pin lands on the Business Profile listing.
export const MAPS_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  `ECB TECHNOLOGIES KENYA, ${BUSINESS.address.street}, ${BUSINESS.address.city}`
)}&output=embed`;

// As shown on the Google Business Profile on 2026-10-30. Display only - never
// put this in structured data (Google ignores self-serving LocalBusiness
// review markup). Update periodically.
export const GOOGLE_REVIEWS = { rating: 4.9, count: 183 };

export function whatsappUrl(message) {
  const base = `https://wa.me/${BUSINESS.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// Escapes "<" so product/category text from WooCommerce can't break out of
// the <script> tag (per the Next.js JSON-LD guide).
export function jsonLdHtml(data) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
