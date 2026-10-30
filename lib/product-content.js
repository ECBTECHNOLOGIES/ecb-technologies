import { BUSINESS, STREET_ADDRESS } from "@/lib/business";
import { DELIVERY_STATS } from "@/lib/delivery";
import { decodeEntities, formatPrice } from "@/lib/utils";

// Product-page content generated strictly from WooCommerce data and verified
// business facts. Anything not in the data (warranty, battery life,
// performance claims) is deliberately left out rather than guessed.

const clean = (value) => decodeEntities(String(value ?? "")).trim();

// Visible, non-variation attributes are the product's fixed specifications
// (e.g. Processor, RAM, Display). Variation attributes are the options a
// customer picks, listed separately.
export function getSpecifications(product) {
  return (product.attributes ?? [])
    .filter((attr) => attr.visible !== false && !attr.variation && attr.options?.length)
    .map((attr) => ({ name: clean(attr.name), value: attr.options.map(clean).join(", ") }));
}

export function getOptionAttributes(product) {
  return (product.attributes ?? [])
    .filter((attr) => attr.variation && attr.options?.length && !/warranty/i.test(attr.name))
    .map((attr) => ({ name: clean(attr.name), options: attr.options.map(clean) }));
}

function priceRange(product, variations) {
  const prices = variations.map((v) => Number(v.price)).filter((p) => p > 0);
  if (prices.length) return { low: Math.min(...prices), high: Math.max(...prices) };
  const price = Number(product.price);
  return price > 0 ? { low: price, high: price } : null;
}

const listJoin = (items) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

export function buildProductFaqs(product, productName, variations = []) {
  const faqs = [];
  const range = priceRange(product, variations);
  const options = getOptionAttributes(product);
  const specs = getSpecifications(product);

  if (range) {
    let answer;
    if (range.low !== range.high) {
      const optionNames = options.map((o) => o.name.toLowerCase());
      answer = `The ${productName} costs ${formatPrice(range.low)} to ${formatPrice(range.high)} at ECB Technologies, depending on the ${listJoin(optionNames) || "option"} you choose.`;
    } else if (product.on_sale && Number(product.regular_price) > range.low) {
      answer = `The ${productName} is ${formatPrice(range.low)} at ECB Technologies, reduced from ${formatPrice(product.regular_price)}.`;
    } else {
      answer = `The ${productName} is ${formatPrice(range.low)} at ECB Technologies.`;
    }
    faqs.push({ q: `How much is the ${productName} in Kenya?`, a: `${answer} Prices on this page come straight from our live catalogue.` });
  }

  const inStock =
    product.stock_status === "instock" || variations.some((v) => v.stock_status === "instock");
  faqs.push({
    q: `Is the ${productName} in stock?`,
    a: inStock
      ? "Yes, it is currently in stock. You can order online or pick it up at our shop."
      : `It is currently out of stock. Message us on WhatsApp on ${BUSINESS.phoneDisplay} and we'll suggest an available alternative.`,
  });

  if (specs.length >= 2) {
    faqs.push({
      q: `What are the specifications of the ${productName}?`,
      a: `${specs.map((s) => `${s.name}: ${s.value}`).join(". ")}.`,
    });
  }

  const condition = options.find((o) => /condition/i.test(o.name));
  if (condition) {
    faqs.push({
      q: `Is the ${productName} new or refurbished?`,
      a: `It is available as ${listJoin(condition.options)}. Choose the condition you want before adding it to your cart; the price updates to match.`,
    });
  }

  faqs.push({
    q: `Can you deliver the ${productName} outside Nairobi?`,
    a: `Yes. We deliver to ${DELIVERY_STATS.townCount} towns across Kenya through Fargo Courier, for ${formatPrice(DELIVERY_STATS.minFee)} to ${formatPrice(DELIVERY_STATS.maxFee)} depending on the town. You collect from the Fargo branch in your town.`,
  });
  faqs.push({
    q: `Can I see the ${productName} in person?`,
    a: `Yes. Visit us at ${STREET_ADDRESS}, ${BUSINESS.address.area} (${BUSINESS.hoursDisplay.toLowerCase()}). Store pickup of online orders is free.`,
  });
  faqs.push({
    q: "How can I pay?",
    a: "With M-Pesa or a debit/credit card at checkout, without leaving the site.",
  });

  return faqs;
}
