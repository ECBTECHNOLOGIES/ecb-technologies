// One-off script to provision WooCommerce Shipping Zones from the Fargo
// Courier tariff (reviewed 1 Oct 2023). Idempotent: re-running it will not
// duplicate zones or methods that already exist.
//
// Usage: node --env-file=.env.local scripts/setup-shipping-zones.mjs

import axios from "axios";
import { writeFile } from "node:fs/promises";

const baseURL = `${process.env.NEXT_PUBLIC_WP_URL}/wp-json/wc/v3`;

if (!process.env.WC_CONSUMER_KEY || !process.env.WC_CONSUMER_SECRET) {
  console.error("Missing WC_CONSUMER_KEY / WC_CONSUMER_SECRET in environment.");
  process.exit(1);
}

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

// Towns with excess-weight surcharges (KSh 150/kg above 5kg, vs the standard
// KSh 65-100/kg). WooCommerce's flat_rate method has no free-text note field
// exposed over the REST API, so these are recorded in the output mapping and
// flagged in the console report instead of embedded in the method itself.
const SURCHARGE_TOWNS = new Set(["Lodwar", "Lokichogio", "Lamu", "Mpeketoni", "Taveta"]);

const ZONES = {
  "Rift Valley Routes": {
    Baraton: 700, Bungoma: 600, "Burnt forest": 520, Chwele: 600, "Eldama Ravine": 470,
    Eldoret: 450, Engineer: 400, Gilgil: 350, Iten: 450, Kabarnet: 450, Kapenguria: 780,
    Kapsabet: 620, Kijabe: 350, Kimilili: 600, Kitale: 600, Limuru: 350, Lodwar: 2050,
    Lokichogio: 2850, Lugari: 600, Malaba: 600, Maralal: 1100, "Moi's Bridge": 530,
    Molo: 480, Mumias: 600, Nairetoi: 950, Naivasha: 350, Nakuru: 360, "Nandi Hills": 620,
    Narok: 420, Njoro: 480, Nyahururu: 480, Nzoia: 710, Olkalau: 480, Rumuruti: 500,
    Talek: 680, Turbo: 450, Webuye: 600,
  },
  "Mt Kenya Routes": {
    Chogoria: 480, Chuka: 420, Embu: 420, Isiolo: 650, Juja: 380, Kagio: 400, Kangari: 350,
    Kangema: 420, Karatina: 400, Kerugoya: 400, Kiganjo: 410, Kutus: 410, Makutano: 460,
    Makuyu: 360, Marsabit: 950, Matuu: 420, Maua: 650, Meru: 480, Moyale: 3050,
    Mukurweini: 410, "Murang'a": 420, Murarandia: 420, Mwea: 410, Mwingi: 550, Nanyuki: 520,
    Naromoru: 520, Nkubu: 460, Nyeri: 420, Othaya: 420, Ruiru: 360, Runyenjes: 420,
    Sabasaba: 360, Sagana: 480, Thika: 360, Timau: 520,
  },
  "Lake Routes": {
    Ahero: 640, Awendo: 600, Bomet: 500, Bondo: 640, Busia: 660, Homabay: 700, Isebania: 740,
    Kakamega: 740, Kehancha: 740, Kendubay: 750, Kericho: 480, Keroka: 600, Kilgoris: 600,
    Kisii: 500, Kisumu: 500, Litein: 500, Londiani: 660, Luanda: 600, Maseno: 500,
    Mbale: 480, Mbita: 720, Migori: 600, Muhoroni: 660, Nambale: 670, Nyamira: 500,
    Ogembo: 600, Oyugis: 600, Rachuonyo: 750, Rongo: 600, Sabatia: 650, Siaya: 650,
    Sotik: 500, Ugunja: 650,
  },
  "Coast Routes": {
    Diani: 770, Garsen: 1400, Kilifi: 800, Lamu: 2050, Malindi: 840, Mariakani: 640,
    Mombasa: 640, Mpeketoni: 2050, Mtwapa: 640, Mwatate: 840, "Sultan hamud": 580,
    Taveta: 850, Voi: 600, Watamu: 850, Wundanyi: 800,
  },
  "Outer Nairobi Routes": {
    "Athi River": 360, Emali: 580, Garissa: 750, Isinya: 420, Kajiado: 420, Kangundo: 400,
    Kibwezi: 580, Kitengela: 360, Kitui: 450, Machakos: 420, Makindu: 580, Masii: 500,
    "Mtito Andei": 600, Mutomo: 600, Mwala: 600, Namanga: 670, Oloitoktok: 670, Tala: 420,
    Wote: 600,
  },
  "Nairobi Routes": {
    Gatundu: 350, Githunguri: 350, Kiambu: 350, Kikuyu: 350, Nairobi: 300, Ngong: 350,
    "Ongata rongai": 350,
  },
};

async function findOrCreateZone(name, order) {
  const { data: zones } = await api.get("/shipping/zones");
  const existing = zones.find((z) => z.name === name);
  if (existing) {
    console.log(`Zone exists: ${name} (id ${existing.id})`);
    return existing;
  }
  const { data: created } = await api.post("/shipping/zones", { name, order });
  console.log(`Created zone: ${name} (id ${created.id})`);
  return created;
}

async function findOrCreateFlatRate(zoneId, town, cost) {
  const { data: methods } = await api.get(`/shipping/zones/${zoneId}/methods`);
  const existing = methods.find(
    (m) => m.method_id === "flat_rate" && m.settings?.title?.value === town
  );
  if (existing) {
    console.log(`  exists: ${town} - KSh ${existing.settings.cost.value}`);
    return existing;
  }
  const { data: created } = await api.post(`/shipping/zones/${zoneId}/methods`, {
    method_id: "flat_rate",
    settings: { title: town, cost: String(cost) },
  });
  console.log(`  added: ${town} - KSh ${cost}${SURCHARGE_TOWNS.has(town) ? "  [SURCHARGE TOWN]" : ""}`);
  return created;
}

async function findOrCreateLocalPickup(zoneId) {
  const { data: methods } = await api.get(`/shipping/zones/${zoneId}/methods`);
  const existing = methods.find((m) => m.method_id === "local_pickup");
  if (existing) {
    console.log("  exists: Store Pickup");
    return existing;
  }
  const { data: created } = await api.post(`/shipping/zones/${zoneId}/methods`, {
    method_id: "local_pickup",
    settings: { title: "Store Pickup", cost: "0" },
  });
  console.log("  added: Store Pickup - KSh 0");
  return created;
}

async function main() {
  const mapping = {};
  let order = 1;

  for (const [zoneName, towns] of Object.entries(ZONES)) {
    console.log(`\n${zoneName}`);
    const zone = await findOrCreateZone(zoneName, order++);

    for (const [town, cost] of Object.entries(towns)) {
      const method = await findOrCreateFlatRate(zone.id, town, cost);
      mapping[town] = {
        zone: zoneName,
        zoneId: zone.id,
        methodInstanceId: method.instance_id ?? method.id,
        cost,
        surcharge: SURCHARGE_TOWNS.has(town)
          ? "KSh 150/kg above 5kg (standard is KSh 65-100/kg)"
          : null,
      };
    }

    await findOrCreateLocalPickup(zone.id);
  }

  await writeFile(
    new URL("../lib/shipping-rates.json", import.meta.url),
    JSON.stringify(mapping, null, 2) + "\n"
  );

  console.log(`\nWrote town -> rate mapping for ${Object.keys(mapping).length} towns to lib/shipping-rates.json`);

  console.log("\nSurcharge towns (flagged, not enforced by WooCommerce):");
  for (const town of SURCHARGE_TOWNS) {
    console.log(`  - ${town}: ${mapping[town]?.surcharge}`);
  }
}

main().catch((error) => {
  console.error("Failed:", error.response?.data ?? error.message);
  process.exit(1);
});
