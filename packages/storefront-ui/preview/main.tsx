import { useState, useEffect, useRef } from "react";
import {
  SiteShell,
  HomeView,
  ShopView,
  ProductView,
  CartView,
  DropView,
  ArchiveView,
  AboutView,
  type StoreProduct,
  type StoreDrop,
  type StoreCartLine,
} from "../src";
import { products, drops } from "./fixtures";
import { readRoute, routeHref, stockFor, loadCart, saveCart, cartStorageKey, type Page, type Route } from "./demo-state";

export function StorefrontDemo() {
  const [route, setRoute] = useState(readRoute);
  const page = route.page;
  const product = products.find((p) => p.slug === route.slug) ?? products[0];
  const drop = drops.find((d) => d.slug === route.slug) ?? drops[0];
  const [menu, setMenu] = useState(false);
  const [variant, setVariant] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("featured");
  const [cart, setCart] = useState<StoreCartLine[]>(loadCart);
  const [feedback, setFeedback] = useState("");
  const previousRoute = useRef(route);

  useEffect(() => {
    const handleBack = () => setRoute(readRoute());
    const handleStorage = (event: StorageEvent) => {
      if (event.key === cartStorageKey || event.key === null) setCart(loadCart());
    };
    window.addEventListener("popstate", handleBack);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("popstate", handleBack);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);
  useEffect(() => saveCart(cart), [cart]);
  useEffect(() => {
    const title = page === "product" ? product.name : page === "drop" ? drop.title
      : { home: "All Pieces", shop: "All Pieces", cart: "Your bag", archive: "Collections", about: "About" }[page];
    document.title = `${title} — VULGAR`;
    setMenu(false);
    setFeedback("");
    setVariant(undefined);
    setQuantity(1);
    setImage(0);
    if (previousRoute.current !== route) {
      window.scrollTo({ top: 0, behavior: "instant" });
      document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true });
      previousRoute.current = route;
    }
  }, [route, page, product.name, drop.title]);

  const openRoute = (next: Route) => {
    const href = routeHref(next);
    if (`${location.pathname}${location.search}` !== href) history.pushState(null, "", href);
    setRoute(next);
  };
  const navigate = (next: Page) => openRoute({ page: next });
  const selectProduct = (p: StoreProduct) => openRoute({ page: "product", slug: p.slug });
  const selectDrop = (d: StoreDrop) => openRoute({ page: "drop", slug: d.slug });
  const chosen = product.variants.find((v) => v.id === variant);
  const inBag = cart.find((l) => l.product.id === product.id && l.variantId === variant)?.quantity ?? 0;
  const remaining = chosen ? Math.max(0, stockFor(product, chosen.id) - inBag) : 0;
  const add = () => {
    if (!chosen || quantity < 1 || quantity > remaining) return;
    const key = `${product.id}:${chosen.id}`;
    setCart((lines) => {
      const existing = lines.find((l) => l.key === key);
      const max = stockFor(product, chosen.id);
      if ((existing?.quantity ?? 0) + quantity > max) return lines;
      return existing
        ? lines.map((l) => l.key === key ? { ...l, quantity: l.quantity + quantity } : l)
        : [...lines, { key, product, variantId: chosen.id, quantity }];
    });
    setQuantity(1);
    setFeedback(`Added to your bag — ${chosen.label}.`);
  };
  let filtered = products.filter((p) =>
    (filter === "all" || p.status === filter) &&
    `${p.name} ${p.description}`.toLowerCase().includes(search.trim().toLowerCase()),
  );
  if (sort === "price-low") filtered = [...filtered].sort((a, b) => a.priceCents - b.priceCents);
  if (sort === "price-high") filtered = [...filtered].sort((a, b) => b.priceCents - a.priceCents);
  const lines = cart;
  const lineTotals = Object.fromEntries(
    lines.map((l) => [
      l.key,
      (l.product.variants.find((v) => v.id === l.variantId)?.priceCents ??
        l.product.priceCents) * l.quantity,
    ]),
  );
  return (
    <SiteShell
      activePage={
        ["home", "shop", "archive", "about"].includes(page)
          ? (page as "home" | "shop" | "archive" | "about")
          : undefined
      }
      cartCount={cart.reduce((n, l) => n + l.quantity, 0)}
      menuOpen={menu}
      onMenuOpenChange={setMenu}
      onNavigate={navigate}
      onCartOpen={() => navigate("cart")}
      navigationHrefs={{
        home: routeHref({ page: "home" }), shop: routeHref({ page: "shop" }),
        archive: routeHref({ page: "archive" }), about: routeHref({ page: "about" }),
      }}
      cartHref={routeHref({ page: "cart" })}
      footerNote=""
    >
      {page === "home" && (
        <HomeView

          featuredProducts={products}
          currentDrop={drops[0]}
          pastDrops={drops.filter((d) => d.status === "ended")}
          onShop={() => navigate("shop")}
          onProductSelect={selectProduct}
          onDropSelect={selectDrop}
          onArchive={() => navigate("archive")}
          onAbout={() => navigate("about")}
        />
      )}
      {page === "shop" && (
        <ShopView
          products={filtered}
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          filters={[
            { value: "all", label: "All pieces" },
            { value: "available", label: "Available" },
            { value: "sold_out", label: "Sold out" },
          ]}
          onFilterChange={setFilter}
          sort={sort}
          sortOptions={[
            { value: "featured", label: "Featured" },
            { value: "price-low", label: "Price: low to high" },
            { value: "price-high", label: "Price: high to low" },
          ]}
          onSortChange={setSort}
          onClearFilters={() => {
            setSearch("");
            setFilter("all");
          }}
          onProductSelect={selectProduct}
        />
      )}
      {page === "product" && (
        <ProductView
          product={product}
          selectedVariantId={variant}
          onVariantChange={(id) => {
            setVariant(id); setQuantity(1); setFeedback("");
          }}
          quantity={quantity}
          maxQuantity={chosen ? Math.max(1, remaining) : 1}
          onQuantityChange={(value) => { setQuantity(value); setFeedback(""); }}
          selectedImageIndex={image}
          onImageChange={setImage}
          displayPriceCents={chosen?.priceCents ?? product.priceCents}
          canAddToCart={
            !!chosen?.available && quantity <= remaining && remaining > 0
          }
          onAddToCart={add}
          feedback={chosen && remaining === 0 ? "All available pieces in this size are already in your bag." : feedback}
          relatedProducts={products.filter((p) => p.id !== product.id)}
          onProductSelect={selectProduct}
          onBackToShop={() => navigate("shop")}
          details={[
            {
              title: "Design & fit",
              content:
                "Placeholder only. Final fit and measurements to follow.",
            },
            {
              title: "Shipping & care",
              content:
                "Orders are closed during this preview.",
            },
          ]}
        />
      )}
      {page === "cart" && (
        <CartView
          lines={lines}
          lineTotals={lineTotals}
          subtotalCents={Object.values(lineTotals).reduce((a, b) => a + b, 0)}
          maxQuantities={Object.fromEntries(lines.map((l) => [l.key, stockFor(l.product, l.variantId)]))}
          onQuantityChange={(key, value) =>
            setCart((c) =>
              c.map((l) => (l.key === key ? {
                ...l, quantity: Math.max(1, Math.min(stockFor(l.product, l.variantId), value)),
              } : l)),
            )
          }
          onRemove={(key) => {
            setCart((c) => c.filter((l) => l.key !== key));
            setFeedback("Item removed from your bag.");
          }}
          onContinueShopping={() => navigate("shop")}
          onProductSelect={selectProduct}
          feedback={feedback}
        />
      )}
      {page === "drop" && (
        <DropView
          drop={drop}
          products={products.filter((p) => p.dropId === drop.id)}
          onProductSelect={selectProduct}
          onArchive={() => navigate("archive")}
        />
      )}
      {page === "archive" && (
        <ArchiveView
          drops={drops}
          onDropSelect={selectDrop}
          onShop={() => navigate("shop")}
        />
      )}
      {page === "about" && (
        <AboutView

          onShop={() => navigate("shop")}
        />
      )}
    </SiteShell>
  );
}
