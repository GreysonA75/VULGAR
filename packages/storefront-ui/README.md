# @vulgar/storefront-ui

A standalone React + TypeScript presentation package for VULGAR. Eight page components, scoped CSS Modules, local fonts, original provisional artwork, and an independent design lab. No router dependency, requests, storage, checkout, or scheduling. The public API is versioned at **0.1.0**.

## Run and integrate

From this package directory, using Node 20.19+ or 22.12+:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run dev -- --port 5174
```

`npm run dev` opens the independent preview at `http://127.0.0.1:5174`. Use the Design Lab selectors to inspect every view, five fixed viewport widths, empty states, product availability, and drop states. The iframe uses actual viewport media queries. Preview state is memory-only and resets on refresh or changing the viewport. Its fixtures and cart simulation are excluded from the library build.

Agent 1 should add this package to the consuming workspace and build it before import. React and ReactDOM 18 or 19 are peers; there are no other runtime dependencies. The package is private to prevent accidental npm publication. Root workspace wiring is intentionally left to Agent 1.

```tsx
import { SiteShell, HomeView, type StoreProduct } from '@vulgar/storefront-ui';
import '@vulgar/storefront-ui/styles.css';
```

Wrap exactly one page view in `SiteShell` to provide theme tokens, navigation, main landmark, skip link, and footer. Import the CSS once in the application's global layout. The built ES module preserves `"use client"` for React server-component consumers. CSS Modules are compiled; the consumer does not need a CSS Modules transform for this package. The generated `.d.ts` files preserve exact contracts.

Copy approved files from `assets/` into the application's public asset directory, or import their exported package asset subpaths using the application's bundler. Pass the resulting URLs as `heroImage`, `image`, or `product.images`. **There are no hard-coded production image paths in the components.** The `/assets/…` paths belong only to the local preview. Fonts are embedded in the built CSS; no Google Fonts request is made. Preserve `assets/FONT-LICENSE.txt` when redistributing fonts.

```tsx
<SiteShell
  activePage="home" cartCount={cartCount}
  menuOpen={menuOpen} onMenuOpenChange={setMenuOpen}
  onNavigate={navigate} onCartOpen={openCart}
>
  <HomeView
    heroImage="/vulgar/forest-signal.png"
    featuredProducts={featuredProducts}
    currentDrop={currentDrop} pastDrops={pastDrops}
    onShop={() => navigate('shop')} onProductSelect={openProduct}
    onDropSelect={openDrop} onArchive={() => navigate('archive')}
    onAbout={() => navigate('about')}
  />
</SiteShell>
```

The identifiers above are supplied by the application. `preview/main.tsx` contains a runnable, fully wired example.

## Responsibility boundaries

- `ShopView` receives the already filtered and sorted array. Its search/filter/sort controls emit values only. `resultCount` defaults to the visible array length; supply the full count when paginating externally.
- `ProductView` receives selected image, selected variant, quantity, final display price, purchase eligibility, submission state, feedback, and constraints. `onAddToCart()` has no arguments: the parent already owns the full selection. The parent must validate stock, eligibility, quantity, and price. Use `key={product.id}` or reset controlled selections when opening another product. Images fall back if the selected index is out of range.
- `CartView` receives line totals and subtotal in integer USD cents; it never calculates business totals. `lineTotals` and `maxQuantities` are keyed by `StoreCartLine.key`. A missing line total renders an em dash. The parent provides `lineMessages` for stale inventory or unavailable variants, validates quantities, and owns removals. Checkout is intentionally disabled and has no payment callback.
- `DropView` renders the supplied status, preformatted release label, and countdown parts. It does not parse dates, run timers, or decide whether a drop is live. Draft drops display “Preview”; filter drafts before supplying public content. Only upcoming drops display countdown values. Countdown is not an aria-live region, avoiding second-by-second announcements.
- `ArchiveView` displays the array exactly as supplied. Supply only appropriate historical collections and formatted `releaseLabels`; ended does not imply sold out.
- `SiteShell` emits navigation destinations and menu state changes. Native hrefs support modified clicks; override `navigationHrefs`/`cartHref` for the application's real routes. The parent owns route changes, history, page titles, scroll restoration, and route-focus management. The mobile navigation is an inline disclosure, not a modal or focus trap. Escape closes it and returns focus to its toggle.
- Only image loading/failure is internal component state. Native `details` handles disclosure presentation. No component stores cart/product/catalog state.
- Merchandise cards remain inspectable when sold out. Their buttons emit the full product; the application decides the destination. There is no invented restock guarantee, shipping promise, fabric specification, edition size, or release date.

## Public exports

| Export | Purpose |
| --- | --- |
| `SiteShell` | Responsive navigation, global theme wrapper, footer |
| `HomeView` | Hero, current collection, products, creator editorial, archive previews |
| `ShopView` | Controlled catalog filters, search, sort, and empty state |
| `ProductView` | Controlled gallery, variants, quantity, purchase presentation, related products |
| `CartView` | Full bag page, supplied totals, quantity/removal controls, unavailable checkout |
| `DropView` | Draft, upcoming, live, and ended collection presentation |
| `ArchiveView` | Staggered desktop archive and stacked mobile cards |
| `AboutView` | Verified channel identity and creator links |
| `ProductCard`, `CollectionCard` | Reusable callback-driven cards |
| `QuantityControl` | Controlled increment/decrement presentation |
| `Wordmark({className?})`, `BrandIcon()` | Typography and compact original symbol |
| `Artwork({src?, alt?, className?, eager?})` | Standard image with loading/failure fallback; empty alt is decorative |
| `formatPrice(cents, currency = 'USD')` | Deterministic US-dollar formatting, no price calculation |
| `defaultCreatorLinks` | Verified YouTube and Patreon destinations |

Props marked `?` below are optional. All callbacks are synchronous notifications returning `void`; asynchronous requests belong to the parent, which feeds back `isAdding` and `feedback`. `className` on the small visual helpers is additive. All page props and shared contracts are exported types.

## Exact type contracts

```ts
import type { ReactNode } from "react";
export type StoreProduct = {
    id: string;
    slug: string;
    name: string;
    description: string;
    priceCents: number;
    currency: 'USD';
    images: string[];
    status: 'available' | 'coming_soon' | 'sold_out';
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
    status: 'draft' | 'upcoming' | 'live' | 'ended';
};

export type StoreCartLine = {
    key: string;
    product: StoreProduct;
    variantId: string;
    quantity: number;
};

export type NavigationTarget = 'home' | 'shop' | 'archive' | 'about';

export type CreatorLinks = {
    youtube: string;
    patreon: string;
};

export type ProductNavigation = {
    onProductSelect: (product: StoreProduct) => void;
};

export type CountdownValue = {
    value: string;
    label: string;
};

export type FilterOption = {
    value: string;
    label: string;
};

export type SiteShellProps = {
    children: ReactNode;
    activePage?: NavigationTarget;
    cartCount: number;
    menuOpen: boolean;
    onMenuOpenChange: (open: boolean) => void;
    onNavigate: (target: NavigationTarget) => void;
    onCartOpen: () => void;
    creatorLinks?: CreatorLinks;
    navigationHrefs?: Partial<Record<NavigationTarget, string>>;
    cartHref?: string;
    notice?: string;
    footerNote?: string;
};

export type ProductCardProps = {
    product: StoreProduct;
    index?: number;
    onSelect: (product: StoreProduct) => void;
};

export type HomeViewProps = ProductNavigation & {
    heroImage?: string;
    heroImageAlt?: string;
    featuredProducts: StoreProduct[];
    currentDrop?: StoreDrop;
    pastDrops?: StoreDrop[];
    onShop: () => void;
    onDropSelect: (drop: StoreDrop) => void;
    onArchive: () => void;
    onAbout: () => void;
    creatorLinks?: CreatorLinks;
};

export type ShopViewProps = ProductNavigation & {
    products: StoreProduct[];
    search: string;
    onSearchChange: (value: string) => void;
    filter: string;
    filters: FilterOption[];
    onFilterChange: (value: string) => void;
    sort: string;
    sortOptions: FilterOption[];
    onSortChange: (value: string) => void;
    onClearFilters: () => void;
    resultCount?: number;
};

export type QuantityControlProps = {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
    label?: string;
};

export type ProductViewProps = ProductNavigation & {
    product: StoreProduct;
    selectedVariantId?: string;
    onVariantChange: (id: string) => void;
    quantity: number;
    onQuantityChange: (value: number) => void;
    maxQuantity?: number;
    selectedImageIndex: number;
    onImageChange: (index: number) => void;
    displayPriceCents: number;
    canAddToCart: boolean;
    onAddToCart: () => void;
    isAdding?: boolean;
    feedback?: string;
    relatedProducts?: StoreProduct[];
    onBackToShop: () => void;
    details?: {
        title: string;
        content: ReactNode;
    }[];
};

export type CartViewProps = ProductNavigation & {
    lines: StoreCartLine[];
    subtotalCents: number;
    lineTotals: Record<string, number>;
    maxQuantities?: Record<string, number>;
    lineMessages?: Record<string, string>;
    onQuantityChange: (key: string, quantity: number) => void;
    onRemove: (key: string) => void;
    onContinueShopping: () => void;
    feedback?: string;
};

export type DropViewProps = ProductNavigation & {
    drop: StoreDrop;
    products: StoreProduct[];
    countdown?: CountdownValue[];
    countdownLabel?: string;
    releaseLabel?: string;
    onArchive: () => void;
};

export type CollectionCardProps = {
    drop: StoreDrop;
    index?: number;
    releaseLabel?: string;
    onSelect: (drop: StoreDrop) => void;
};

export type ArchiveViewProps = {
    drops: StoreDrop[];
    releaseLabels?: Record<string, string>;
    onDropSelect: (drop: StoreDrop) => void;
    onShop: () => void;
};

export type AboutViewProps = {
    image?: string;
    imageAlt?: string;
    creatorLinks?: CreatorLinks;
    onShop: () => void;
};

```

## Styling and accessibility

Theme variables are scoped to the shell (see `docs/brand/DESIGN_SYSTEM.md`). No reset touches elements outside it. Set application body margin to zero in the consuming application. Display text uses bundled Bodoni Moda; body text uses Arial/Helvetica; metadata uses Courier New. Small uppercase labels are secondary, never the only place essential product information appears.

Keyboard focus is explicit. All buttons have accessible names, variants use `aria-pressed`, disabled variants use native disabled controls, and announcements use `role="status"`. Product galleries use labeled buttons. Empty image alt text is reserved for decorative images. Hover motion is disabled by `prefers-reduced-motion`; no blinking, autoplay, canvas effects, or continuous animation is used.

Media breakpoints: 1100, 760, 560, and 359px, with a 1600px wide-screen refinement. Catalogs use three columns on desktop and two on mobile; product detail and cart become a single column. No forced viewport overflow is used. Test in the consuming application after integration, especially if its own global reset changes fonts, buttons, or SVGs.

## Artwork status

The creator's identity, tagline, and destinations were verified against public profiles. All campaign imagery and apparel mockups in this package are **provisional original art**, not approved merchandise. Do not ship demo names, prices, availability, countdowns, or drops as actual catalog data. See `docs/brand/ASSET_MANIFEST.md`, `RESEARCH.md`, and `DESIGN_STATUS.md` for provenance, generation prompts, and verification limits.

## Share the demo on GitHub Pages

`npm run build:demo` builds the standalone Design Lab into `demo-dist/`.
Relative asset paths support both a domain root and a repository subdirectory.
The library build remains `npm run build`.

After pushing this repository to GitHub, select **Settings → Pages → Source →
GitHub Actions**. Run **Publish VULGAR demo** from the Actions tab, selecting
the branch containing the demo. The workflow reports the published URL.
The site contains demonstration data only and does not accept orders.
