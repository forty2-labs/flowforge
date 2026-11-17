// Sample businesses for the editor demo. The café is the same entry the
// sign-in page shows, so the product tells one story.

export type PresetId = "cafe" | "studio" | "shop";
export type Accent = "forest" | "ocean" | "ink";

export type DemoContent = { title: string; body: string; accent: Accent };

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
      title: "Spring menu, now serving",
      body: "Wild garlic soup, rhubarb tart with crème fraîche, and the first asparagus from Hollow Farm. Lunch from twelve, Tuesday to Sunday.",
      accent: "forest",
    },
  },
  studio: {
    label: "Studio",
    business: "Northstar Studio",
    site: "northstar.flowforge.site",
    action: "Read the notes",
    content: {
      title: "Notes from the print room",
      body: "This month we printed the spring catalogue in three colours on the risograph. Here is what worked, what smudged, and what we would do again.",
      accent: "ocean",
    },
  },
  shop: {
    label: "Shop",
    business: "Linen & Loom",
    site: "linenandloom.flowforge.site",
    action: "Shop the apron",
    content: {
      title: "The linen apron, back in stock",
      body: "Washed linen, a long tie and two deep pockets. Back in oat and charcoal, with free returns for thirty days.",
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
