// Sample businesses for the playground. Each brings its own content
// structure (menu items or products), sample data, brand colour, drawn
// images and preview layout, all on the same Flowforge interface. The café
// is the same Harbour Café the rest of the site shows.

import type { JSONContent } from "@flowforge/ui";

export type BusinessId = "cafe" | "restaurant" | "retail";

export type Item = { id: string; name: string; price: string };

export type Draft = {
  name: string;
  announcement: string;
  headline: string;
  description: string;
  image: 0 | 1 | 2;
  items: Item[];
  doc: JSONContent;
};

export type Business = {
  label: string;
  site: string;
  action: string;
  /** Background class for the brand colour (a sample-* token). */
  accent: string;
  /** What the repeating rows are called, plural and singular. */
  items: { plural: string; singular: string };
  layout: "menu" | "courses" | "grid";
  images: [string, string, string];
  sample: Draft;
};

export const MAX_ITEMS = 5;

const doc = (...paragraphs: string[]): JSONContent => ({
  type: "doc",
  content: paragraphs.map((text) => ({ type: "paragraph", content: [{ type: "text", text }] })),
});

export const BUSINESSES: Record<BusinessId, Business> = {
  cafe: {
    label: "Café",
    site: "harbourcafe.flowforge.site",
    action: "See the menu",
    accent: "bg-sample-forest",
    items: { plural: "Menu items", singular: "menu item" },
    layout: "menu",
    images: ["The counter", "Latte art", "The terrace"],
    sample: {
      name: "Harbour Café",
      announcement: "Rhubarb tart is back this week",
      headline: "Spring menu, now serving",
      description: "Coffee from the harbour roastery and cakes baked every morning, on Quay Street since 2014.",
      image: 0,
      items: [
        { id: "c1", name: "Flat white", price: "3.20" },
        { id: "c2", name: "Wild garlic soup", price: "6.50" },
        { id: "c3", name: "Sourdough toast", price: "4.00" },
      ],
      doc: doc("Walk-ins welcome, and dogs on leads are fine. Lunch from twelve, Tuesday to Sunday."),
    },
  },
  restaurant: {
    label: "Restaurant",
    site: "oliveandember.flowforge.site",
    action: "Book a table",
    accent: "bg-sample-clay",
    items: { plural: "Menu items", singular: "menu item" },
    layout: "courses",
    images: ["The open kitchen", "The wood oven", "Table for two"],
    sample: {
      name: "Olive & Ember",
      announcement: "Autumn menu from 1 October",
      headline: "Cooked over fire, served at the table",
      description: "A small menu that changes with the season, from the wood oven and the grill.",
      image: 0,
      items: [
        { id: "r1", name: "Burrata, blood orange", price: "9.00" },
        { id: "r2", name: "Hake, brown butter", price: "22.00" },
        { id: "r3", name: "Olive oil cake", price: "7.50" },
      ],
      doc: doc("Tables for up to eight. Vegetarian and gluten-free dishes are marked on the menu."),
    },
  },
  retail: {
    label: "Retail",
    site: "linenandloom.flowforge.site",
    action: "Shop the collection",
    accent: "bg-sample-ink",
    items: { plural: "Products", singular: "product" },
    layout: "grid",
    images: ["The kitchen collection", "Folded linen", "The workroom"],
    sample: {
      name: "Linen & Loom",
      announcement: "Free returns for thirty days",
      headline: "The kitchen collection",
      description: "Washed linen aprons, totes and cloths, cut and sewn in our own workroom.",
      image: 0,
      items: [
        { id: "s1", name: "Linen apron", price: "38.00" },
        { id: "s2", name: "Market tote", price: "24.00" },
        { id: "s3", name: "Tea towels, set of two", price: "16.00" },
      ],
      doc: doc("Every piece is machine washable and softens with each wash."),
    },
  },
};

export const BUSINESS_IDS = Object.keys(BUSINESSES) as BusinessId[];
