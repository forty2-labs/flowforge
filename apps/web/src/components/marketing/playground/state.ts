// The playground's state: which business, what is being written (the
// draft), what was last published, and where publishing stands. The
// previews always show the draft, so editing feels live; the status says
// whether it has gone out. Nothing leaves the page.

import { BUSINESSES, MAX_ITEMS, type BusinessId, type Draft, type Item } from "./businesses";

export type Status = "published" | "changed" | "publishing";

export type State = {
  business: BusinessId;
  draft: Draft;
  published: Draft;
  status: Status;
  /** Counts publishes, so the publish moment can replay each time. */
  publishes: number;
  /** Increments on switch and reset, so the rich-text editor remounts. */
  version: number;
};

export type Action =
  | { type: "edit"; patch: Partial<Omit<Draft, "items">> }
  | { type: "editItem"; id: string; patch: Partial<Omit<Item, "id">> }
  | { type: "addItem" }
  | { type: "removeItem"; id: string }
  | { type: "switch"; business: BusinessId }
  | { type: "reset" }
  | { type: "publish" }
  | { type: "published" };

export function initialState(business: BusinessId = "cafe"): State {
  const sample = BUSINESSES[business].sample;
  return { business, draft: sample, published: sample, status: "published", publishes: 0, version: 0 };
}

let nextId = 0;

function changed(state: State, draft: Draft): State {
  return { ...state, draft, status: "changed" };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "edit":
      return changed(state, { ...state.draft, ...action.patch });
    case "editItem":
      return changed(state, {
        ...state.draft,
        items: state.draft.items.map((item) => (item.id === action.id ? { ...item, ...action.patch } : item)),
      });
    case "addItem":
      if (state.draft.items.length >= MAX_ITEMS) return state;
      return changed(state, { ...state.draft, items: [...state.draft.items, { id: `new-${nextId++}`, name: "", price: "" }] });
    case "removeItem":
      return changed(state, { ...state.draft, items: state.draft.items.filter((item) => item.id !== action.id) });
    case "switch":
    case "reset": {
      const business = action.type === "switch" ? action.business : state.business;
      return { ...initialState(business), version: state.version + 1 };
    }
    case "publish":
      return state.status === "changed" ? { ...state, status: "publishing", publishes: state.publishes + 1 } : state;
    case "published":
      return state.status === "publishing" ? { ...state, published: state.draft, status: "published" } : state;
  }
}
