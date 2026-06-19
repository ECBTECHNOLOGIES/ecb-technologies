// Lists all WooCommerce shipping zones and their methods for manual
// verification against the Fargo Courier tariff sheet.
//
// Usage: node --env-file=.env.local scripts/verify-shipping-zones.mjs

import axios from "axios";

const baseURL = `${process.env.NEXT_PUBLIC_WP_URL}/wp-json/wc/v3`;

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    consumer_key: process.env.WC_CONSUMER_KEY,
    consumer_secret: process.env.WC_CONSUMER_SECRET,
  };
  return config;
});

async function main() {
  const { data: zones } = await api.get("/shipping/zones");
  let totalFlatRates = 0;
  let totalLocalPickups = 0;

  for (const zone of zones) {
    if (zone.id === 0) continue; // skip the default "Locations not covered" zone
    const { data: methods } = await api.get(`/shipping/zones/${zone.id}/methods`);
    console.log(`\n=== ${zone.name} (id ${zone.id}) ===`);
    for (const m of methods) {
      const title = m.settings?.title?.value ?? m.title;
      const cost = m.settings?.cost?.value;
      if (m.method_id === "flat_rate") {
        totalFlatRates++;
        console.log(`  flat_rate    | ${title.padEnd(20)} | KSh ${cost} | enabled=${m.enabled}`);
      } else if (m.method_id === "local_pickup") {
        totalLocalPickups++;
        console.log(`  local_pickup | ${title.padEnd(20)} | KSh ${cost ?? "0"} | enabled=${m.enabled}`);
      } else {
        console.log(`  ${m.method_id} | ${title}`);
      }
    }
  }

  console.log(`\nTotal zones: ${zones.length - (zones.some((z) => z.id === 0) ? 1 : 0)}`);
  console.log(`Total flat_rate methods: ${totalFlatRates} (expected 146)`);
  console.log(`Total local_pickup methods: ${totalLocalPickups} (expected 6)`);
}

main().catch((error) => {
  console.error("Failed:", error.response?.data ?? error.message);
  process.exit(1);
});
