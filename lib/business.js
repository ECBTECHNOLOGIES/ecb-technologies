// Single source of truth for ECB's public business details (name, address,
// phone, hours). Everything that shows or marks up these details - footer,
// contact page, checkout pickup note, JSON-LD - should read from here so the
// website never contradicts itself or the Google Business Profile.

export const SITE_URL = "https://www.ecbtechkenya.com";

export const BUSINESS = {
  name: "ECB Technologies",
  url: SITE_URL,
  logo: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/2025/04/Ebc-864-by-216-6.png`,
  phoneDisplay: "0717 040 531",
  phoneE164: "+254717040531",
  whatsappNumber: "254717040531",
  email: "ecbtechnologies001@gmail.com",
  address: {
    building: "Iconic Business Plaza",
    street: "Moi Avenue",
    area: "Nairobi CBD",
    city: "Nairobi",
    country: "KE",
  },
  // Same hours shown to customers choosing store pickup at checkout.
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

export const ADDRESS_LINE = `${BUSINESS.address.building}, ${BUSINESS.address.street}, ${BUSINESS.address.city}`;

export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  ADDRESS_LINE
)}`;

export function whatsappUrl(message) {
  const base = `https://wa.me/${BUSINESS.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

// Escapes "<" so product/category text from WooCommerce can't break out of
// the <script> tag (per the Next.js JSON-LD guide).
export function jsonLdHtml(data) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
