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
  ended: "Archived",
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
              {item}
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
          <BrandIcon />
          <p>{footerNote}</p>
          <CreatorNavigation links={creatorLinks} />
        </div>
        <a
          href={paths.home}
          onClick={(e) => navClick(e, () => navigate("home"))}
          className={s.footerWordmark}
          aria-label="Vulgar home"
        >
          <Wordmark />
        </a>
        <div className={s.footerBottom}>
          <span>VULGAR / INDEPENDENT MERCHANDISE</span>
          <span>FROM THE OTHER SIDE OF THE SCREEN.</span>
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
          <span className={s.cardIndex}>
            [{String(index + 1).padStart(2, "0")}]
          </span>
          {product.status !== "available" && (
            <span className={s.badge}>{productStatuses[product.status]}</span>
          )}
          <span className={s.cardArrow} aria-hidden="true">
            ↗
          </span>
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
export function HomeView({
  heroImage,
  heroImageAlt = "A distant silhouette in a dark forest",
  featuredProducts,
  currentDrop,
  pastDrops = [],
  onShop,
  onProductSelect,
  onDropSelect,
  onArchive,
  onAbout,
  creatorLinks,
}: HomeViewProps) {
  const heroId = useId();
  return (
    <>
      <section className={s.hero} aria-labelledby={heroId}>
        <Artwork
          src={heroImage}
          alt={heroImageAlt}
          className={s.heroImage}
          eager
        />
        <div className={s.heroShade} />
        <div className={s.heroTop}>
          <span className={s.eyebrow}>INDEPENDENT MERCHANDISE</span>
          <span className={s.eyebrow}>EST. IN THE DARK</span>
        </div>
        <h1 id={heroId} className={s.heroTitle}>
          <Wordmark />
        </h1>
        <div className={s.heroBottom}>
          <div>
            <p className={s.heroTagline}>
              REALITY IS DARKER
              <br />
              THAN FICTION.
            </p>
            <p className={s.heroSmall}>For those who look a little closer.</p>
          </div>
          <Button
            onClick={currentDrop ? () => onDropSelect(currentDrop) : onShop}
          >
            {currentDrop?.status === "upcoming"
              ? "Explore the next drop"
              : "Enter the collection"}{" "}
            <Arrow />
          </Button>
        </div>
        <span className={s.heroRegistration} aria-hidden="true">
          V / 001 — TRANSMISSION RECEIVED
        </span>
      </section>
      <div className={s.signalStrip}>
        <span>VULGAR / OBJECTS FROM THE DARK</span>
        <span aria-hidden="true">✳</span>
        <span>REALITY IS DARKER THAN FICTION.</span>
      </div>
      <section className={s.section}>
        <SectionHeading
          eyebrow={
            currentDrop
              ? `${dropStatuses[currentDrop.status]} / ${currentDrop.title}`
              : "THE COLLECTION"
          }
          title="Wear what stays with you."
          action="Shop all"
          onAction={onShop}
        />
        {featuredProducts.length ? (
          <ProductGrid
            products={featuredProducts}
            onProductSelect={onProductSelect}
          />
        ) : (
          <EmptyState title="Something is taking shape.">
            New pieces will appear here.
          </EmptyState>
        )}
      </section>
      <section className={s.editorial}>
        <div className={s.editorialArt}>
          <Artwork src={heroImage} alt="" />
          <span className={s.registration}>FIG. 01 / BEYOND THE VISIBLE</span>
        </div>
        <div className={s.editorialCopy}>
          <p className={s.eyebrow}>A WORLD BEYOND THE SCREEN</p>
          <h2>
            Some things
            <br />
            stay with you.
          </h2>
          <p>
            The obscure. The unsettling. The things you find when you look a
            little further. An extension of the world of Vulgar.
          </p>
          <Button quiet onClick={onAbout}>
            About Vulgar <Arrow />
          </Button>
          <CreatorNavigation links={creatorLinks} />
        </div>
      </section>
      {pastDrops.length > 0 && (
        <section className={s.section}>
          <SectionHeading
            eyebrow="PREVIOUS TRANSMISSIONS"
            title="Nothing disappears."
            action="Visit the archive"
            onAction={onArchive}
          />
          <div className={s.archivePreview}>
            {pastDrops.slice(0, 2).map((drop, i) => (
              <CollectionCard
                key={drop.id}
                drop={drop}
                index={i}
                onSelect={onDropSelect}
              />
            ))}
          </div>
        </section>
      )}
    </>
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
      <div className={s.pageHeading}>
        <p className={s.eyebrow}>VULGAR / THE COLLECTION</p>
        <h1>
          Objects from
          <br />
          <em>the dark.</em>
        </h1>
        <p>Wear what stays with you.</p>
      </div>
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
          <SectionHeading
            eyebrow="FROM THE SAME WORLD"
            title="Look a little further."
          />
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
        <p className={s.eyebrow}>YOUR SELECTION</p>
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
              ← Continue exploring
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
          A little room for something that stays with you.
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
        <Artwork
          src={drop.heroImage}
          alt=""
          className={s.dropHeroImage}
          eager
        />
        <div className={s.dropShade} />
        <div className={s.dropContent}>
          <p className={s.eyebrow}>
            <span className={s.statusDot} /> {dropStatuses[drop.status]} /
            VULGAR COLLECTION
          </p>
          <h1>{drop.title}</h1>
          <p>{drop.description}</p>
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
              Return to the archive <Arrow />
            </Button>
          )}
        </div>
      </section>
      <section className={s.section}>
        <SectionHeading
          eyebrow={dropStatuses[drop.status]}
          title={
            drop.status === "ended"
              ? "The remaining traces."
              : "Inside the collection."
          }
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
      </section>
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
        <div className={s.collectionArt}>
          <Artwork src={drop.heroImage} alt="" />
          <span className={s.collectionNumber}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className={s.badge}>{dropStatuses[drop.status]}</span>
          <span className={s.cardArrow} aria-hidden="true">
            ↗
          </span>
        </div>
        <div className={s.collectionMeta}>
          <h3>{drop.title}</h3>
          <span>{releaseLabel ?? dropStatuses[drop.status]}</span>
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
  return (
    <section className={s.section}>
      <div className={s.pageHeading}>
        <p className={s.eyebrow}>VULGAR / PREVIOUS TRANSMISSIONS</p>
        <h1>
          Nothing
          <br />
          <em>disappears.</em>
        </h1>
        <p>A record of what came before.</p>
      </div>
      {drops.length ? (
        <div className={s.archiveGrid}>
          {drops.map((drop, i) => (
            <CollectionCard
              key={drop.id}
              drop={drop}
              index={i}
              releaseLabel={releaseLabels[drop.id]}
              onSelect={onDropSelect}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="The record begins here."
          action="Explore the collection"
          onAction={onShop}
        >
          Past releases will be preserved in this archive.
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
export function AboutView({
  image,
  imageAlt = "An indistinct silhouette beyond a dark forest",
  creatorLinks,
  onShop,
}: AboutViewProps) {
  return (
    <>
      <section className={s.aboutIntro}>
        <p className={s.eyebrow}>THE WORLD OF VULGAR</p>
        <h1>
          Reality is darker
          <br />
          than <em>fiction.</em>
        </h1>
        <div className={s.aboutColumns}>
          <p>
            Vulgar explores lesser-known, disturbing content from around the
            internet.
          </p>
          <div>
            <p>
              Beyond the screen, the same curiosity takes a different form.
              Objects, images, and things that stay with you.
            </p>
            <CreatorNavigation links={creatorLinks} />
          </div>
        </div>
      </section>
      <div className={s.aboutImage}>
        <Artwork src={image} alt={imageAlt} />
        <span className={s.registration}>V / THERE IS MORE TO SEE</span>
      </div>
      <section className={s.aboutOutro}>
        <BrandIcon />
        <h2>Look a little closer.</h2>
        <Button onClick={onShop}>
          Enter the collection <Arrow />
        </Button>
      </section>
    </>
  );
}
