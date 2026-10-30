import shippingRates from "@/lib/shipping-rates.json";

// Delivery facts derived from the Fargo Courier tariff in shipping-rates.json
// (the same table checkout charges from), so published fees can never drift
// from what customers actually pay.

// Fargo Courier's own route groupings (they don't follow county lines -
// e.g. Garissa is on the Outer Nairobi route), shown in this order.
const ZONE_ORDER = [
  "Nairobi Routes",
  "Outer Nairobi Routes",
  "Mt Kenya Routes",
  "Rift Valley Routes",
  "Lake Routes",
  "Coast Routes",
];


export const DELIVERY_TOWNS = Object.entries(shippingRates)
  .map(([town, rate]) => ({ town, zone: rate.zone, cost: rate.cost, surcharge: rate.surcharge }))
  .sort((a, b) => a.town.localeCompare(b.town));

export const DELIVERY_STATS = {
  townCount: DELIVERY_TOWNS.length,
  minFee: Math.min(...DELIVERY_TOWNS.map((t) => t.cost)),
  maxFee: Math.max(...DELIVERY_TOWNS.map((t) => t.cost)),
};

export const SURCHARGE_NOTE =
  "Orders over 5kg to this town may incur an extra KSh 150/kg. We confirm the final cost before dispatch.";

export function deliveryZones() {
  const zones = new Map();
  for (const town of DELIVERY_TOWNS) {
    if (!zones.has(town.zone)) zones.set(town.zone, []);
    zones.get(town.zone).push(town);
  }
  return [...zones.entries()]
    .sort(([a], [b]) => ZONE_ORDER.indexOf(a) - ZONE_ORDER.indexOf(b))
    .map(([zone, towns]) => ({
      zone,
      label: zone.replace(/ Routes$/, " route"),
      slug: zone.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, ""),
      towns,
      minFee: Math.min(...towns.map((t) => t.cost)),
      maxFee: Math.max(...towns.map((t) => t.cost)),
    }));
}
