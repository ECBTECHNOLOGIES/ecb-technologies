import { getCategories, getProducts } from "@/lib/woocommerce";
import { decodeEntities } from "@/lib/utils";
import OurProductsClient from "./OurProductsClient";

// Homepage category sections shown below the filter pills, in display order.
const NAMED_GROUPS = [
  { label: "Laptops", match: /laptop/i },
  { label: "Smartphones", match: /smartphone|phone/i },
  { label: "TV & Home Appliances", match: /tv|television|appliance/i },
  { label: "Audio & Speakers", match: /audio|speaker/i },
  { label: "Apple", match: /apple/i },
  { label: "Mobile Accessories", match: /accessor/i },
  { label: "Printers", match: /printer/i },
];

export default async function OurProducts() {
  let categories = [];
  try {
    categories = await getCategories({ parent: 0, orderby: "count", order: "desc" });
    categories = categories.filter(
      (category) => category.slug !== "uncategorized" && category.id !== 274 && category.count > 0
    );
  } catch {
    categories = [];
  }

  const tabs = [
    { label: "All", categoryId: null },
    ...categories.map((category) => ({
      label: decodeEntities(category.name),
      categoryId: category.id,
      image: category.image?.src ?? null,
    })),
  ];

  const productsByTab = await Promise.all(
    tabs.map(async (tab) => {
      try {
        return await getProducts(
          tab.categoryId
            ? { category: tab.categoryId, per_page: 8 }
            : { per_page: 8, orderby: "date", order: "desc" }
        );
      } catch {
        return [];
      }
    })
  );

  const tabsWithProducts = tabs
    .map((tab, i) => ({ ...tab, products: productsByTab[i] }))
    .filter((tab) => tab.products.length > 0);

  if (!tabsWithProducts.length) return null;

  // All categories (not just top-level), used to match the named groups below.
  let allCategories = [];
  try {
    allCategories = await getCategories({});
  } catch {
    allCategories = [];
  }

  const groups = [];
  for (const { label, match } of NAMED_GROUPS) {
    const category = allCategories.find((c) => match.test(c.name));
    if (category) groups.push({ label, categoryId: category.id });
  }

  const productsByGroup = await Promise.all(
    groups.map(async (group) => {
      try {
        return await getProducts({ category: group.categoryId, per_page: 4 });
      } catch {
        return [];
      }
    })
  );

  const groupsWithProducts = groups
    .map((group, i) => ({ ...group, products: productsByGroup[i] }))
    .filter((group) => group.products.length > 0);

  return <OurProductsClient tabs={tabsWithProducts} groups={groupsWithProducts} />;
}
