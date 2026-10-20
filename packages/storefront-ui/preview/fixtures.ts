import type { StoreProduct, StoreDrop } from "../src";
// Design fixtures only. None of these are approved products, prices, or releases.
const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;
const sizes = ["S", "M", "L", "XL", "XXL"];
export const products: StoreProduct[] = [
  {
    id: "demo-mask",
    slug: "demo-mask",
    name: "The witness / washed black",
    description:
      "An original mask study, imagined as a distressed print on a washed black tee. This is a design sample; fabric, fit, price, and production details are not confirmed.",
    priceCents: 3800,
    currency: "USD",
    images: [asset("mask-tee.png"), asset("forest-signal.png")],
    status: "available",
    variants: sizes.map((label, i) => ({
      id: `mask-${label}`,
      label,
      sku: `DEMO-MASK-${label}`,
      available: i !== 4,
      stock: i === 4 ? 0 : 5,
    })),
    dropId: "demo-001",
  },
  {
    id: "demo-root",
    slug: "demo-root",
    name: "Afterimage / heavyweight hood",
    description:
      "An original tree engraving study on a black hooded sweatshirt. Provisional artwork and demonstration price only.",
    priceCents: 6800,
    currency: "USD",
    images: [asset("root-hoodie.png"), asset("signal.svg")],
    status: "available",
    variants: sizes.map((label) => ({
      id: `root-${label}`,
      label,
      sku: `DEMO-ROOT-${label}`,
      available: true,
      stock: 5,
    })),
    dropId: "demo-001",
  },
  {
    id: "demo-forest",
    slug: "demo-forest",
    name: "No signal / bone",
    description:
      "A forest transmission, imagined in black ink on bone cotton. This concept is not an announced product.",
    priceCents: 3800,
    currency: "USD",
    images: [asset("forest-tee.png")],
    status: "sold_out",
    variants: sizes.map((label) => ({
      id: `forest-${label}`,
      label,
      sku: `DEMO-FOREST-${label}`,
      available: false,
      stock: 0,
    })),
    dropId: "demo-000",
  },
];
export const drops: StoreDrop[] = [
  {
    id: "demo-001",
    slug: "demo-001",
    title: "The unseen",
    description:
      "A collection of things that linger. Three studies from the other side of the screen.",
    heroImage: asset("forest-signal.png"),
    status: "live",
  },
  {
    id: "demo-000",
    slug: "demo-000",
    title: "Dead air",
    description:
      "A trace of a previous transmission. Archive concept for design demonstration.",
    heroImage: asset("signal.svg"),
    status: "ended",
  },
  {
    id: "demo-002",
    slug: "demo-002",
    title: "After the last light",
    description:
      "An imagined next chapter. Release date and product details have not been announced.",
    heroImage: asset("forest-signal.png"),
    status: "upcoming",
  },
];
