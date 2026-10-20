import type { StoreProduct, StoreDrop } from "../src";
// Design fixtures only. None of these are approved products, prices, or releases.
const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;
const sizes = ["S", "M", "L", "XL", "XXL"];
export const products: StoreProduct[] = [
  {
    id: "smile-dog",
    slug: "smile-dog",
    name: "Smile Dog",
    description:
      "Smile Dog placeholder. Final artwork and garment details to follow.",
    priceCents: 3800,
    currency: "USD",
    images: [asset("smile-dog.svg")],
    status: "available",
    variants: sizes.map((label, i) => ({
      id: `smile-${label}`,
      label,
      sku: `DEMO-SMILE-${label}`,
      available: i !== 4,
      stock: i === 4 ? 0 : 5,
    })),
    dropId: "demo-001",
  },
  {
    id: "russian-sleep-experiment",
    slug: "russian-sleep-experiment",
    name: "Russian Sleep Experiment",
    description:
      "Russian Sleep Experiment placeholder. Final artwork and garment details to follow.",
    priceCents: 6800,
    currency: "USD",
    images: [asset("russian-sleep-experiment.svg")],
    status: "available",
    variants: sizes.map((label) => ({
      id: `sleep-${label}`,
      label,
      sku: `DEMO-SLEEP-${label}`,
      available: true,
      stock: 5,
    })),
    dropId: "demo-001",
  },
  {
    id: "captain-clark",
    slug: "captain-clark",
    name: "Captain Clark",
    description:
      "Captain Clark placeholder. Final artwork and garment details to follow.",
    priceCents: 3800,
    currency: "USD",
    images: [asset("captain-clark.svg")],
    status: "sold_out",
    variants: sizes.map((label) => ({
      id: `captain-${label}`,
      label,
      sku: `DEMO-CAPTAIN-${label}`,
      available: false,
      stock: 0,
    })),
    dropId: "demo-001",
  },
];
export const drops: StoreDrop[] = [
  {
    id: "demo-001",
    slug: "demo-001",
    title: "The Creepypasta Collection",
    description:
      "Smile Dog, Russian Sleep Experiment, and Captain Clark.",
    status: "live",
  },
  {
    id: "demo-000",
    slug: "demo-000",
    title: "The SCP Collection",
    description:
      "This collection is no longer available.",
    status: "ended",
  },
  {
    id: "demo-002",
    slug: "demo-002",
    title: "The Tung Tung Tapes Collection",
    description:
      "This collection is no longer available.",
    status: "ended",
  },
];
