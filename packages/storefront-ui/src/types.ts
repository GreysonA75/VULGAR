export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: "USD";
  images: string[];
  status: "available" | "coming_soon" | "sold_out";
  variants: {
    id: string;
    label: string;
    sku: string;
    available: boolean;
    stock: number;
    priceCents?: number;
  }[];
  dropId?: string | null;
};
export type StoreDrop = {
  id: string;
  slug: string;
  title: string;
  description: string;
  heroImage?: string;
  startsAt?: string;
  endsAt?: string;
  status: "draft" | "upcoming" | "live" | "ended";
};
export type StoreCartLine = {
  key: string;
  product: StoreProduct;
  variantId: string;
  quantity: number;
};
export type NavigationTarget = "home" | "shop" | "archive" | "about";
export type CreatorLinks = { youtube: string; patreon: string };
export type ProductNavigation = {
  onProductSelect: (product: StoreProduct) => void;
};
export type CountdownValue = { value: string; label: string };
export type FilterOption = { value: string; label: string };
