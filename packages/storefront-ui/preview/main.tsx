import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
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
import "./preview.css";
type Page = "home" | "shop" | "product" | "cart" | "drop" | "archive" | "about";
const pages: Page[] = [
  "home",
  "shop",
  "product",
  "cart",
  "drop",
  "archive",
  "about",
];
const query = new URLSearchParams(location.search);
function Preview() {
  const [page, setPage] = useState<Page>(
    pages.includes(query.get("view") as Page)
      ? (query.get("view") as Page)
      : "home",
  );
  const [width, setWidth] = useState(query.get("width") ?? "full");
  const [menu, setMenu] = useState(false),
    [product, setProduct] = useState(products[0]),
    [drop, setDrop] = useState(drops[0]);
  const [variant, setVariant] = useState<string>(),
    [quantity, setQuantity] = useState(1),
    [image, setImage] = useState(0);
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [sort, setSort] = useState("featured");
  const [cart, setCart] = useState<StoreCartLine[]>([]),
    [feedback, setFeedback] = useState("");
  const [empty, setEmpty] = useState(false),
    [status, setStatus] = useState("default");
  const embedded = query.has("embed");
  const [metrics, setMetrics] = useState("");
  useEffect(() => {
    const report = () => {
      const value = `${page} / ${document.documentElement.clientWidth}px / overflow ${Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)}px`;
      if (embedded)
        window.parent.postMessage(
          { type: "vulgar-preview-metrics", value },
          location.origin,
        );
      else if (width === "full") setMetrics(value);
    };
    const observer = new ResizeObserver(report);
    observer.observe(document.documentElement);
    document.fonts.ready.then(report);
    requestAnimationFrame(report);
    return () => observer.disconnect();
  }, [page, width, embedded]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin === location.origin &&
        event.source === document.querySelector("iframe")?.contentWindow &&
        event.data?.type === "vulgar-preview-metrics"
      )
        setMetrics(event.data.value);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  const navigate = (next: Page) => {
    setPage(next);
    setMenu(false);
    setFeedback("");
    setStatus("default");
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const selectProduct = (p: StoreProduct) => {
    setProduct(p);
    setVariant(undefined);
    setQuantity(1);
    setImage(0);
    navigate("product");
  };
  const selectDrop = (d: StoreDrop) => {
    setDrop(d);
    navigate("drop");
  };
  useEffect(() => {
    document.title = `VULGAR — ${page} design preview`;
  }, [page]);
  const shownProduct = {
    ...product,
    status:
      status === "default"
        ? product.status
        : (status as StoreProduct["status"]),
  };
  const chosen = product.variants.find((v) => v.id === variant);
  const add = () => {
    if (!chosen) return;
    const key = `${product.id}:${chosen.id}`;
    setCart((lines) => {
      const existing = lines.find((l) => l.key === key);
      return existing
        ? lines.map((l) =>
            l.key === key ? { ...l, quantity: l.quantity + quantity } : l,
          )
        : [...lines, { key, product, variantId: chosen.id, quantity }];
    });
    setFeedback("Added to your preview bag.");
  };
  let filtered = empty
    ? []
    : products.filter(
        (p) =>
          (filter === "all" || p.status === filter) &&
          p.name.toLowerCase().includes(search.toLowerCase()),
      );
  if (sort === "price-low")
    filtered = [...filtered].sort((a, b) => a.priceCents - b.priceCents);
  if (sort === "price-high")
    filtered = [...filtered].sort((a, b) => b.priceCents - a.priceCents);
  const lines = empty ? [] : cart;
  const lineTotals = Object.fromEntries(
    lines.map((l) => [
      l.key,
      (l.product.variants.find((v) => v.id === l.variantId)?.priceCents ??
        l.product.priceCents) * l.quantity,
    ]),
  );
  const toolbar = (
    <div className="preview-tools">
      <strong>
        DESIGN LAB <span> / PROVISIONAL</span>
      </strong>
      {!embedded && <output className="preview-metrics">{metrics}</output>}
      <label>
        View
        <select value={page} onChange={(e) => navigate(e.target.value as Page)}>
          {pages.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      {!embedded && (
        <label>
          Viewport
          <select value={width} onChange={(e) => setWidth(e.target.value)}>
            <option value="full">Full width</option>
            {["1440", "1024", "768", "390", "320"].map((w) => (
              <option key={w} value={w}>
                {w}px
              </option>
            ))}
          </select>
        </label>
      )}
      {(embedded || width === "full") && (
        <label>
          <input
            type="checkbox"
            checked={empty}
            onChange={(e) => setEmpty(e.target.checked)}
          />{" "}
          Empty
        </label>
      )}
      {(embedded || width === "full") && page === "product" && (
        <label>
          Status
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setVariant(undefined);
            }}
          >
            {["default", "available", "coming_soon", "sold_out"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      )}
      {(embedded || width === "full") && page === "drop" && (
        <label>
          Drop
          <select
            value={drop.id}
            onChange={(e) =>
              setDrop(drops.find((d) => d.id === e.target.value)!)
            }
          >
            {drops.map((d) => (
              <option key={d.id} value={d.id}>
                {d.status}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
  if (!embedded && width !== "full")
    return (
      <>
        {toolbar}
        <div className="preview-frame-wrap">
          <iframe
            title={`${width}px responsive preview`}
            style={{ width: Number(width) }}
            src={`${location.pathname}?embed=1&view=${page}`}
          />
        </div>
      </>
    );
  return (
    <>
      {toolbar}
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
        notice="DESIGN PREVIEW — CONCEPT ART, PRODUCTS & PRICES. ORDERING IS NOT OPEN."
        footerNote="REALITY IS DARKER THAN FICTION."
      >
        {page === "home" && (
          <HomeView
            heroImage={`${import.meta.env.BASE_URL}assets/forest-signal.png`}
            featuredProducts={empty ? [] : products}
            currentDrop={drops[0]}
            pastDrops={[drops[1], { ...drops[2], status: "ended" }]}
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
              setEmpty(false);
            }}
            onProductSelect={selectProduct}
          />
        )}
        {page === "product" && (
          <ProductView
            product={shownProduct}
            selectedVariantId={variant}
            onVariantChange={setVariant}
            quantity={quantity}
            maxQuantity={5}
            onQuantityChange={setQuantity}
            selectedImageIndex={image}
            onImageChange={setImage}
            displayPriceCents={chosen?.priceCents ?? product.priceCents}
            canAddToCart={
              !!chosen?.available && shownProduct.status === "available"
            }
            onAddToCart={add}
            feedback={feedback}
            relatedProducts={products.filter((p) => p.id !== product.id)}
            onProductSelect={selectProduct}
            onBackToShop={() => navigate("shop")}
            details={[
              {
                title: "Design & fit",
                content:
                  "Visual concept only. Fabric, measurements, print method, and final fit will be provided with approved merchandise.",
              },
              {
                title: "Shipping & care",
                content:
                  "Shipping and care details are not yet available. This preview does not take orders.",
              },
            ]}
          />
        )}
        {page === "cart" && (
          <CartView
            lines={lines}
            lineTotals={lineTotals}
            subtotalCents={Object.values(lineTotals).reduce((a, b) => a + b, 0)}
            onQuantityChange={(key, value) =>
              setCart((c) =>
                c.map((l) => (l.key === key ? { ...l, quantity: value } : l)),
              )
            }
            onRemove={(key) => {
              setCart((c) => c.filter((l) => l.key !== key));
              setFeedback("Item removed from your preview bag.");
            }}
            onContinueShopping={() => navigate("shop")}
            onProductSelect={selectProduct}
            feedback={feedback}
          />
        )}
        {page === "drop" && (
          <DropView
            drop={drop}
            products={empty ? [] : products}
            countdown={[
              { label: "Days", value: "02" },
              { label: "Hours", value: "14" },
              { label: "Minutes", value: "38" },
              { label: "Seconds", value: "09" },
            ]}
            releaseLabel={
              drop.status === "upcoming"
                ? "Demonstration countdown — not a scheduled release"
                : undefined
            }
            onProductSelect={selectProduct}
            onArchive={() => navigate("archive")}
          />
        )}
        {page === "archive" && (
          <ArchiveView
            drops={empty ? [] : [drops[1], { ...drops[2], status: "ended" }]}
            releaseLabels={{
              "demo-000": "Concept archive / 001",
              "demo-002": "Concept archive / 002",
            }}
            onDropSelect={selectDrop}
            onShop={() => navigate("shop")}
          />
        )}
        {page === "about" && (
          <AboutView
            image={`${import.meta.env.BASE_URL}assets/forest-signal.png`}
            onShop={() => navigate("shop")}
          />
        )}
      </SiteShell>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Preview />
  </React.StrictMode>,
);
