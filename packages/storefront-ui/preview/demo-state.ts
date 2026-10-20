import type { StoreCartLine, StoreProduct } from "../src";
import { products, drops } from "./fixtures";

export type Page = "home" | "shop" | "product" | "cart" | "drop" | "archive" | "about";
export type Route = { page: Page; slug?: string };
const pages: Page[] = ["home", "shop", "product", "cart", "drop", "archive", "about"];
export const cartStorageKey = "vulgar-demo-bag-v1";

export function readRoute(search = location.search): Route {
  const query = new URLSearchParams(search);
  const page = query.get("view") as Page;
  if (!pages.includes(page)) return { page: "home" };
  if (page === "product") {
    const product = products.find((p) => p.slug === query.get("product"));
    return { page, slug: (product ?? products[0]).slug };
  }
  if (page === "drop") {
    const drop = drops.find((d) => d.slug === query.get("drop"));
    return { page, slug: (drop ?? drops[0]).slug };
  }
  return { page };
}

// Query routes work on static hosting, including /VULGAR/, without rewrites.
export function routeHref(route: Route, pathname = location.pathname) {
  if (route.page === "home") return pathname;
  const query = new URLSearchParams({ view: route.page });
  if (route.slug && route.page === "product") query.set("product", route.slug);
  if (route.slug && route.page === "drop") query.set("drop", route.slug);
  return `${pathname}?${query}`;
}

export function stockFor(product: StoreProduct, variantId: string) {
  const variant = product.variants.find((v) => v.id === variantId);
  return product.status === "available" && variant?.available
    ? Math.max(0, Math.floor(variant.stock)) : 0;
}

// Store identifiers only; restore prices and eligibility from the current catalog.
export function restoreCart(raw: string | null): StoreCartLine[] {
  try {
    const saved: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(saved)) return [];
    const lines: StoreCartLine[] = [];
    for (const item of saved) {
      if (!item || typeof item !== "object") continue;
      const product = products.find((p) => p.id === item.productId);
      if (!product || typeof item.variantId !== "string" || !Number.isSafeInteger(item.quantity) || item.quantity <= 0) continue;
      const max = stockFor(product, item.variantId);
      if (!max) continue;
      const key = `${product.id}:${item.variantId}`;
      const existing = lines.find((l) => l.key === key);
      if (existing) existing.quantity = Math.min(max, existing.quantity + item.quantity);
      else lines.push({ key, product, variantId: item.variantId, quantity: Math.min(max, item.quantity) });
    }
    return lines;
  } catch { return []; }
}

export function loadCart() {
  try { return restoreCart(localStorage.getItem(cartStorageKey)); }
  catch { return []; }
}

export function saveCart(cart: StoreCartLine[]) {
  try {
    localStorage.setItem(cartStorageKey, JSON.stringify(cart.map((line) => ({
      productId: line.product.id, variantId: line.variantId, quantity: line.quantity,
    }))));
  } catch { /* Browsers with storage disabled can still use the bag in memory. */ }
}
