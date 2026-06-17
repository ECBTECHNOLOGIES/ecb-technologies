import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export const metadata = {
  title: "Contact Us | ECB Technologies",
  description:
    "Get in touch with ECB Technologies in Nairobi, Kenya - call, WhatsApp or email us for laptops, phones, accessories and more.",
};

const CONTACT_DETAILS = [
  {
    icon: Phone,
    label: "Call Us",
    value: "0717 040 531",
    href: "tel:+254717040531",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "0717 040 531",
    href: "https://wa.me/254717040531",
  },
  {
    icon: Mail,
    label: "Email",
    value: "ecbtechnologies001@gmail.com",
    href: "mailto:ecbtechnologies001@gmail.com",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Iconic Business Plaza, Nairobi, Kenya",
    href: "https://www.google.com/maps/search/?api=1&query=Iconic+Business+Plaza+Nairobi",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Contact Us</h1>
      <p className="mt-2 text-gray-600">
        Have a question about a product or order? Reach out to us through any
        of the channels below and our team will get back to you.
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
