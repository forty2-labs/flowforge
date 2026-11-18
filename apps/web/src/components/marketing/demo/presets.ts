// Sample businesses for the editor demo. The café is the same entry the
// sign-in page shows, so the product tells one story. Content is a rich-text
// document, the same shape the editor produces.

import type { JSONContent } from "@flowforge/ui";

export type PresetId = "cafe" | "studio" | "shop";
export type Accent = "forest" | "ocean" | "ink";

export type DemoContent = { doc: JSONContent; accent: Accent };

export type Preset = {
  label: string;
  business: string;
  site: string;
  action: string;
  content: DemoContent;
};

export const PRESETS: Record<PresetId, Preset> = {
  cafe: {
    label: "Café",
    business: "Harbour Café",
    site: "harbourcafe.flowforge.site",
    action: "See the menu",
    content: {
      doc: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Spring menu, now serving" }] },
          { type: "paragraph", content: [{ type: "text", text: "Wild garlic soup, rhubarb tart with crème fraîche, and the first asparagus from Hollow Farm. " }, { type: "text", text: "Lunch from twelve,", marks: [{ type: "bold" }] }, { type: "text", text: " Tuesday to Sunday." }] },
          {
            type: "bulletList",
            content: [
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Walk-ins welcome" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Dogs on leads are fine" }] }] },
            ],
          },
        ],
      },
      accent: "forest",
    },
  },
  studio: {
    label: "Studio",
    business: "Northstar Studio",
    site: "northstar.flowforge.site",
    action: "Read the notes",
    content: {
      doc: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Notes from the print room" }] },
          { type: "paragraph", content: [{ type: "text", text: "This month we printed the spring catalogue in three colours on the risograph. Here is what " }, { type: "text", text: "worked", marks: [{ type: "italic" }] }, { type: "text", text: ", what smudged, and what we would do again." }] },
        ],
      },
      accent: "ocean",
    },
  },
  shop: {
    label: "Shop",
    business: "Linen & Loom",
    site: "linenandloom.flowforge.site",
    action: "Shop the apron",
    content: {
      doc: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "The linen apron, back in stock" }] },
          { type: "paragraph", content: [{ type: "text", text: "Washed linen, a long tie and two deep pockets. " }, { type: "text", text: "Back in oat and charcoal,", marks: [{ type: "bold" }] }, { type: "text", text: " with free returns for thirty days." }] },
          {
            type: "bulletList",
            content: [
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Machine washable" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "One size, adjustable" }] }] },
            ],
          },
        ],
      },
      accent: "ink",
    },
  },
};

export const PRESET_IDS = Object.keys(PRESETS) as PresetId[];

// Stand-ins for a customer's brand colour. They use their own tokens, not
// the interface's signal or status colours, which carry meaning.
export const ACCENTS: Record<Accent, { label: string; fill: string }> = {
  forest: { label: "Forest", fill: "bg-sample-forest" },
  ocean: { label: "Ocean", fill: "bg-sample-ocean" },
  ink: { label: "Ink", fill: "bg-sample-ink" },
};
