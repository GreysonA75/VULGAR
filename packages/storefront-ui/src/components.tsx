import {
  useId,
  useState,
  useEffect,
  type ReactNode,
  type MouseEvent,
} from "react";
import type {
  StoreProduct,
  StoreDrop,
  StoreCartLine,
  NavigationTarget,
  CreatorLinks,
  ProductNavigation,
  CountdownValue,
  FilterOption,
} from "./types";
import s from "./storefront.module.css";

export const defaultCreatorLinks: CreatorLinks = {
  youtube: "https://www.youtube.com/@vulg6r",
  patreon: "https://www.patreon.com/Vulg5r",
};
export const formatPrice = (cents: number, currency: "USD" = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100,
  );
const productStatuses = {
  available: "Available",
  coming_soon: "Coming soon",
  sold_out: "Sold out",
};
const dropStatuses = {
  draft: "Preview",
  upcoming: "Upcoming",
  live: "Live now",
  ended: "Unavailable",
};
function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
export function Wordmark({ className = "" }: { className?: string }) {
  return <span className={`${s.wordmark} ${className}`}>VULGAR</span>;
}
export function BrandIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={s.brandIcon}>
      <path d="M12 11h12l8 31 8-31h12L34 56h-4z" fill="currentColor" />
      <path d="M8 32h48" stroke="var(--v-bg)" strokeWidth="3" />
    </svg>
  );
}
export function Artwork({
  src,
  alt = "",
  className = "",
  eager = false,
}: {
  src?: string;
  alt?: string;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return src && !failed ? (
    <img
      className={`${s.image} ${className}`}
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  ) : (
    <div
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={!alt || undefined}
      className={`${s.fallbackArt} ${className}`}
    >
      <BrandIcon />
      <span>IMAGE UNAVAILABLE</span>
    </div>
  );
}
function Button({
  children,
  onClick,
  quiet = false,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  quiet?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={quiet ? s.quietButton : s.button}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
function SectionHeading({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className={s.sectionHeading}>
      <div>
        {eyebrow && <p className={s.eyebrow}>{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {action && onAction && (
        <Button quiet onClick={onAction}>
          {action} <Arrow />
        </Button>
      )}
    </div>
  );
}
function CreatorNavigation({
  links = defaultCreatorLinks,
}: {
  links?: CreatorLinks;
}) {
  return (
    <div className={s.creatorLinks}>
      <a href={links.youtube} target="_blank" rel="noreferrer">
        YouTube <Arrow />
      </a>
      <a href={links.patreon} target="_blank" rel="noreferrer">
        Patreon <Arrow />
      </a>
    </div>
  );
}
function navClick(event: MouseEvent<HTMLAnchorElement>, run: () => void) {
  if (
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.altKey &&
    event.button === 0
  ) {
    event.preventDefault();
    run();
  }
}
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
export function SiteShell({
  children,
  activePage,
  cartCount,
  menuOpen,
  onMenuOpenChange,
  onNavigate,
  onCartOpen,
  creatorLinks,
  navigationHrefs = {},
  cartHref = "/cart",
  notice,
  footerNote = "REALITY IS DARKER THAN FICTION.",
}: SiteShellProps) {
  const navId = useId(),
    mainId = useId();
  const paths = {
    home: "/",
    shop: "/shop",
    archive: "/archive",
    about: "/about",
    ...navigationHrefs,
  };
  const navigate = (target: NavigationTarget) => {
    onMenuOpenChange(false);
    onNavigate(target);
  };
  return (
    <div className={s.theme}>
      <a className={s.skipLink} href={`#${mainId}`}>
        Skip to content
      </a>
      {notice && <div className={s.notice}>{notice}</div>}
      <header
        className={s.header}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onMenuOpenChange(false);
            e.currentTarget
              .querySelector<HTMLButtonElement>("[aria-controls]")
              ?.focus();
          }
        }}
      >
        <a
          className={s.logo}
          href={paths.home}
          aria-label="Vulgar home"
          onClick={(e) => navClick(e, () => navigate("home"))}
        >
          <Wordmark />
        </a>
        <button
          type="button"
          className={s.menuToggle}
          aria-expanded={menuOpen}
          aria-controls={navId}
          onClick={() => onMenuOpenChange(!menuOpen)}
        >
          {menuOpen ? "Close −" : "Menu +"}
        </button>
        <nav
          id={navId}
          aria-label="Main navigation"
          className={`${s.navigation} ${menuOpen ? s.navigationOpen : ""}`}
        >
          {(["shop", "archive", "about"] as const).map((item) => (
            <a
              key={item}
              href={paths[item]}
              aria-current={activePage === item ? "page" : undefined}
              onClick={(e) => navClick(e, () => navigate(item))}
            >
              {{ shop: "All Pieces", archive: "Collections", about: "About" }[item]}
            </a>
          ))}
        </nav>
        <a
          className={s.cartLink}
          href={cartHref}
          onClick={(e) =>
            navClick(e, () => {
              onMenuOpenChange(false);
              onCartOpen();
            })
          }
          aria-label={`Bag, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
        >
          Bag{" "}
          <span className={s.cartCount}>
            {cartCount.toString().padStart(2, "0")}
          </span>
        </a>
      </header>
      <main id={mainId} tabIndex={-1}>
        {children}
      </main>
      <footer className={s.footer}>
        <div className={s.footerTop}>
          {footerNote && <p>{footerNote}</p>}
          <CreatorNavigation links={creatorLinks} />
        </div>
      </footer>
    </div>
  );
}
export type ProductCardProps = {
  product: StoreProduct;
  index?: number;
  onSelect: (product: StoreProduct) => void;
};
export function ProductCard({
  product,
  index = 0,
  onSelect,
}: ProductCardProps) {
  return (
    <article className={s.productCard}>
      <button
        type="button"
        className={s.productLink}
        onClick={() => onSelect(product)}
        aria-label={`View ${product.name}`}
      >
        <div className={s.productImage}>
          <Artwork src={product.images[0]} alt={product.name} />
          {product.images[1] && (
            <Artwork src={product.images[1]} className={s.productAlternate} />
          )}
          {product.status !== "available" && (
            <span className={s.badge}>{productStatuses[product.status]}</span>
          )}
        </div>
        <div className={s.productMeta}>
          <h3>{product.name}</h3>
          <span>{formatPrice(product.priceCents, product.currency)}</span>
        </div>
        <p className={s.productCaption}>
          {product.status === "available"
            ? "View piece"
            : productStatuses[product.status]}
        </p>
      </button>
    </article>
  );
}
function ProductGrid({
  products,
  onProductSelect,
}: { products: StoreProduct[] } & ProductNavigation) {
  return (
    <div className={s.productGrid}>
      {products.map((p, i) => (
        <ProductCard
          key={p.id}
          product={p}
          index={i}
          onSelect={onProductSelect}
        />
      ))}
    </div>
  );
}
function EmptyState({
  title,
  children,
  action,
  onAction,
}: {
  title: string;
  children: ReactNode;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className={s.emptyState}>
      <BrandIcon />
      <h2>{title}</h2>
      <p>{children}</p>
      {action && onAction && (
        <Button onClick={onAction}>
          {action} <Arrow />
        </Button>
      )}
    </div>
  );
}
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
export function HomeView({ featuredProducts, onProductSelect }: HomeViewProps) {
  return (
    <section className={`${s.section} ${s.catalog}`}>
      <h1 className={s.catalogTitle}>All Pieces</h1>
      {featuredProducts.length ? (
        <ProductGrid products={featuredProducts} onProductSelect={onProductSelect} />
      ) : (
        <EmptyState title="No products yet.">Check back soon.</EmptyState>
      )}
    </section>
  );
}
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
export function ShopView({
  products,
  search,
  onSearchChange,
  filter,
  filters,
  onFilterChange,
  sort,
  sortOptions,
  onSortChange,
  onClearFilters,
  resultCount = products.length,
  onProductSelect,
}: ShopViewProps) {
  const id = useId();
  return (
    <section className={s.section}>
      <div className={s.pageHeading}><h1>All Pieces</h1></div>
      <div className={s.shopToolbar}>
        <div className={s.filters} role="group" aria-label="Filter products">
          {filters.map((f) => (
            <button
              type="button"
              key={f.value}
              aria-pressed={filter === f.value}
              onClick={() => onFilterChange(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className={s.searchSort}>
          <label className={s.search}>
            <span className={s.srOnly}>Search products</span>
            <input
              type="search"
              placeholder="Search the collection"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <span aria-hidden="true">⌕</span>
          </label>
          <label htmlFor={id} className={s.srOnly}>
            Sort products
          </label>
          <select
            id={id}
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className={s.resultCount} role="status">
        {resultCount} {resultCount === 1 ? "piece" : "pieces"}
      </p>
      {products.length ? (
        <ProductGrid products={products} onProductSelect={onProductSelect} />
      ) : (
        <EmptyState
          title="Nothing in this corner."
          action="Reset filters"
          onAction={onClearFilters}
        >
          Try another search or explore the full collection.
        </EmptyState>
      )}
    </section>
  );
}
export type QuantityControlProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  label?: string;
};
export function QuantityControl({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  label = "Quantity",
}: QuantityControlProps) {
  return (
    <div className={s.quantity} role="group" aria-label={label}>
      <button
        type="button"
        aria-label={`Decrease ${label.toLowerCase()}`}
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <output aria-label={label}>{value}</output>
      <button
        type="button"
        aria-label={`Increase ${label.toLowerCase()}`}
        disabled={disabled || (max !== undefined && value >= max)}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
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
  details?: { title: string; content: ReactNode }[];
};
export function ProductView({
  product,
  selectedVariantId,
  onVariantChange,
  quantity,
  onQuantityChange,
  maxQuantity,
  selectedImageIndex,
  onImageChange,
  displayPriceCents,
  canAddToCart,
  onAddToCart,
  isAdding = false,
  feedback,
  relatedProducts = [],
  onProductSelect,
  onBackToShop,
  details = [],
}: ProductViewProps) {
  const id = useId();
  return (
    <div className={s.section}>
      <Button quiet onClick={onBackToShop}>
        ← Back to collection
      </Button>
      <div className={s.productDetail}>
        <div>
          <div className={s.detailImage}>
            <Artwork
              src={product.images[selectedImageIndex] ?? product.images[0]}
              alt={`${product.name}, view ${selectedImageIndex + 1}`}
              eager
            />
            {product.status !== "available" && (
              <span className={s.badge}>{productStatuses[product.status]}</span>
            )}
          </div>
          {product.images.length > 1 && (
            <div
              className={s.thumbnails}
              role="group"
              aria-label="Product images"
            >
              {product.images.map((img, i) => (
                <button
                  type="button"
                  key={`${img}-${i}`}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={selectedImageIndex === i}
                  onClick={() => onImageChange(i)}
                >
                  <Artwork src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={s.detailInfo}>
          <p className={s.eyebrow}>
            VULGAR / {productStatuses[product.status]}
          </p>
          <h1>{product.name}</h1>
          <p className={s.detailPrice}>
            {formatPrice(displayPriceCents, product.currency)}
          </p>
          <p className={s.description}>{product.description}</p>
          <fieldset className={s.variants}>
            <legend>Select size</legend>
            {product.variants.map((variant) => (
              <button
                type="button"
                key={variant.id}
                disabled={!variant.available || product.status !== "available"}
                aria-pressed={selectedVariantId === variant.id}
                aria-label={`${variant.label}${!variant.available ? ", unavailable" : ""}`}
                onClick={() => onVariantChange(variant.id)}
              >
                {variant.label}
              </button>
            ))}
          </fieldset>
          <div className={s.purchaseRow}>
            <QuantityControl
              value={quantity}
              onChange={onQuantityChange}
              max={maxQuantity}
              disabled={product.status !== "available" || isAdding}
            />
            <button
              type="button"
              className={s.button}
              aria-describedby={id}
              aria-busy={isAdding}
              disabled={
                !canAddToCart ||
                isAdding ||
                product.status !== "available" ||
                !selectedVariantId
              }
              onClick={onAddToCart}
            >
              {isAdding
                ? "Adding…"
                : product.status === "sold_out"
                  ? "Sold out"
                  : product.status === "coming_soon"
                    ? "Coming soon"
                    : !selectedVariantId
                      ? "Select a size"
                      : "Add to bag"}
              {canAddToCart &&
                !isAdding &&
                product.status === "available" &&
                selectedVariantId && <Arrow />}
            </button>
          </div>
          <p id={id} className={s.feedback} role="status">
            {feedback ||
              (product.status === "sold_out"
                ? "This piece is currently unavailable."
                : product.status === "coming_soon"
                  ? "Release information will be provided here."
                  : !selectedVariantId
                    ? "Choose an available size to continue."
                    : "")}
          </p>
          {details.map((detail, i) => (
            <details key={`${detail.title}-${i}`} className={s.accordion}>
              <summary>{detail.title}</summary>
              <div>{detail.content}</div>
            </details>
          ))}
        </div>
      </div>
      {relatedProducts.length > 0 && (
        <section className={s.related}>
          <SectionHeading title="More pieces" />
          <ProductGrid
            products={relatedProducts}
            onProductSelect={onProductSelect}
          />
        </section>
      )}
    </div>
  );
}
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
export function CartView({
  lines,
  subtotalCents,
  lineTotals,
  maxQuantities = {},
  lineMessages = {},
  onQuantityChange,
  onRemove,
  onContinueShopping,
  onProductSelect,
  feedback,
}: CartViewProps) {
  return (
    <section className={s.section}>
      <div className={s.pageHeading}>

        <h1>
          The bag
          <span className={s.headingCount}>
            [{lines.length.toString().padStart(2, "0")}]
          </span>
        </h1>
      </div>
      {lines.length ? (
        <div className={s.cartLayout}>
          <div className={s.cartLines}>
            {lines.map((line) => (
              <article className={s.cartLine} key={line.key}>
                <button
                  type="button"
                  className={s.cartThumbnail}
                  onClick={() => onProductSelect(line.product)}
                  aria-label={`View ${line.product.name}`}
                >
                  <Artwork
                    src={line.product.images[0]}
                    alt={line.product.name}
                  />
                </button>
                <div className={s.cartLineInfo}>
                  <button
                    type="button"
                    className={s.textButton}
                    onClick={() => onProductSelect(line.product)}
                  >
                    <h2>{line.product.name}</h2>
                  </button>
                  <p>
                    Size:{" "}
                    {line.product.variants.find((v) => v.id === line.variantId)
                      ?.label ?? "Unavailable variant"}
                  </p>
                  {lineMessages[line.key] && (
                    <p className={s.lineMessage}>{lineMessages[line.key]}</p>
                  )}
                  <QuantityControl
                    value={line.quantity}
                    max={maxQuantities[line.key]}
                    onChange={(value) => onQuantityChange(line.key, value)}
                    label={`Quantity for ${line.product.name}`}
                  />
                </div>
                <div className={s.lineEnd}>
                  <span>
                    {lineTotals[line.key] !== undefined
                      ? formatPrice(lineTotals[line.key])
                      : "—"}
                  </span>
                  <button
                    type="button"
                    className={s.removeButton}
                    onClick={() => onRemove(line.key)}
                    aria-label={`Remove ${line.product.name}`}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
            <Button quiet onClick={onContinueShopping}>
              ← Continue shopping
            </Button>
          </div>
          <aside className={s.cartSummary} aria-label="Bag summary">
            <p className={s.eyebrow}>ORDER SUMMARY</p>
            <div className={s.subtotal}>
              <span>Subtotal</span>
              <strong>{formatPrice(subtotalCents)}</strong>
            </div>
            <p>Shipping and taxes are not calculated.</p>
            <Button disabled>Checkout unavailable</Button>
            <p className={s.summaryNote}>
              Ordering is not open yet. No payment will be taken.
            </p>
            <BrandIcon />
          </aside>
        </div>
      ) : (
        <EmptyState
          title="Nothing here. Yet."
          action="Explore the collection"
          onAction={onContinueShopping}
        >
          Choose a piece to add to your bag.
        </EmptyState>
      )}
      <p className={s.feedback} role="status">
        {feedback}
      </p>
    </section>
  );
}
export type DropViewProps = ProductNavigation & {
  drop: StoreDrop;
  products: StoreProduct[];
  countdown?: CountdownValue[];
  countdownLabel?: string;
  releaseLabel?: string;
  onArchive: () => void;
};
export function DropView({
  drop,
  products,
  countdown,
  countdownLabel = "Release begins in",
  releaseLabel,
  onProductSelect,
  onArchive,
}: DropViewProps) {
  return (
    <>
      <section className={s.dropHero}>
        <div className={s.dropContent}>
          <p className={s.eyebrow}>
            <span className={s.statusDot} /> {dropStatuses[drop.status]} /
            VULGAR COLLECTION
          </p>
          <h1>{drop.title}</h1>
          <p>{drop.status === "ended" ? "This collection is no longer available." : drop.description}</p>
          {releaseLabel && <p className={s.releaseLabel}>{releaseLabel}</p>}
          {drop.status === "upcoming" && countdown && (
            <div className={s.countdownWrap}>
              <p className={s.eyebrow}>{countdownLabel}</p>
              <div
                className={s.countdown}
                role="group"
                aria-label={countdownLabel}
              >
                {countdown.map((part) => (
                  <div key={part.label}>
                    <span>{part.value}</span>
                    <small>{part.label}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
          {drop.status === "ended" && (
            <Button quiet onClick={onArchive}>
              Back to collections <Arrow />
            </Button>
          )}
        </div>
      </section>
      {drop.status !== "ended" && <section className={s.section}>
        <SectionHeading
          eyebrow={dropStatuses[drop.status]}
          title="Products"
        />
        {products.length ? (
          <ProductGrid products={products} onProductSelect={onProductSelect} />
        ) : (
          <EmptyState
            title={
              drop.status === "upcoming"
                ? "Not everything is visible."
                : "No pieces to display."
            }
          >
            {drop.status === "upcoming"
              ? "The collection will be revealed here."
              : "Check back for collection information."}
          </EmptyState>
        )}
      </section>}
    </>
  );
}
export type CollectionCardProps = {
  drop: StoreDrop;
  index?: number;
  releaseLabel?: string;
  onSelect: (drop: StoreDrop) => void;
};
export function CollectionCard({
  drop,
  index = 0,
  releaseLabel,
  onSelect,
}: CollectionCardProps) {
  return (
    <article className={s.collectionCard}>
      <button
        type="button"
        onClick={() => onSelect(drop)}
        aria-label={`Explore ${drop.title}`}
      >
        <div className={s.collectionMeta}>
          <h3>{drop.title}</h3>
          <span>{drop.status === "ended" ? "Unavailable" : releaseLabel ?? "Available"}</span>
        </div>
      </button>
    </article>
  );
}
export type ArchiveViewProps = {
  drops: StoreDrop[];
  releaseLabels?: Record<string, string>;
  onDropSelect: (drop: StoreDrop) => void;
  onShop: () => void;
};
export function ArchiveView({
  drops,
  releaseLabels = {},
  onDropSelect,
  onShop,
}: ArchiveViewProps) {
  const available = drops.filter((drop) => drop.status === "live" || drop.status === "upcoming");
  const previous = drops.filter((drop) => drop.status === "ended");
  return (
    <section className={s.section}>
      <div className={s.pageHeading}><h1>Collections</h1></div>
      {drops.length ? (
        <>
          <section className={s.collectionGroup} aria-label="Available collections">
            <h2>Available collections</h2>
            {available.length ? available.map((drop) => (
              <CollectionCard key={drop.id} drop={drop} releaseLabel={releaseLabels[drop.id]} onSelect={onDropSelect} />
            )) : <p>No collections are available right now.</p>}
          </section>
          <section className={s.collectionGroup} aria-label="Previous collections">
            <h2>Previous collections</h2>
            {previous.length ? previous.map((drop) => (
              <CollectionCard key={drop.id} drop={drop} onSelect={onDropSelect} />
            )) : <p>No previous collections.</p>}
          </section>
        </>
      ) : (
        <EmptyState title="The record begins here." action="View all pieces" onAction={onShop}>
          Collections will appear here.
        </EmptyState>
      )}
    </section>
  );
}
export type AboutViewProps = {
  image?: string;
  imageAlt?: string;
  creatorLinks?: CreatorLinks;
  onShop: () => void;
};
export function AboutView(_props: AboutViewProps) {
  return (
    <section className={`${s.section} ${s.aboutIntro}`} aria-label="About Vulgar">
      <h1>Reality is darker than fiction.</h1>
      <p><a href="mailto:contact@vulgar.example">contact@vulgar.example</a></p>
    </section>
  );
}
