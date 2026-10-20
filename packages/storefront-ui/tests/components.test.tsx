// @vitest-environment happy-dom
import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  SiteShell,
  HomeView,
  ShopView,
  ProductView,
  CartView,
  DropView,
  ArchiveView,
  AboutView,
  Artwork,
  QuantityControl,
} from "../src";
import { products, drops } from "../preview/fixtures";
afterEach(cleanup);
const noop = () => {};
const productProps = {
  product: products[0],
  quantity: 1,
  onQuantityChange: noop,
  selectedImageIndex: 0,
  onImageChange: noop,
  displayPriceCents: 3800,
  canAddToCart: false,
  onAddToCart: noop,
  onVariantChange: noop,
  onProductSelect: noop,
  onBackToShop: noop,
};
describe("presentational contracts", () => {
  it("keeps add disabled until the parent grants eligibility and reports variant selection", () => {
    const select = vi.fn(),
      add = vi.fn();
    const { rerender } = render(
      <ProductView
        {...productProps}
        onVariantChange={select}
        onAddToCart={add}
      />,
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Select a size",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "M" }));
    expect(select).toHaveBeenCalledWith("smile-M");
    expect(
      (
        screen.getByRole("button", {
          name: "XXL, unavailable",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    rerender(
      <ProductView
        {...productProps}
        selectedVariantId="smile-M"
        canAddToCart
        onAddToCart={add}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Add to bag" }));
    expect(add).toHaveBeenCalledOnce();
  });
  it.each(["sold_out", "coming_soon"] as const)(
    "presents %s without an enabled purchase",
    (status) => {
      render(
        <ProductView
          {...productProps}
          product={{ ...products[0], status }}
          canAddToCart
          selectedVariantId="smile-M"
        />,
      );
      expect(
        (
          screen.getByRole("button", {
            name: status === "sold_out" ? "Sold out" : "Coming soon",
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);
    },
  );
  it("uses parent price and routes image changes without selecting internally", () => {
    const image = vi.fn();
    render(
      <ProductView
        {...productProps}
        displayPriceCents={4250}
        product={{ ...products[0], images: ["front.svg", "back.svg"] }}
        onImageChange={image}
      />,
    );
    expect(screen.getByText("$42.50")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "View image 2" }));
    expect(image).toHaveBeenCalledWith(1);
    expect(
      screen
        .getByRole("button", { name: "View image 1" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });
  it("respects quantity bounds and emits the intended value", () => {
    const change = vi.fn();
    const { rerender } = render(
      <QuantityControl value={1} max={2} onChange={change} />,
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Decrease quantity",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(change).toHaveBeenCalledWith(2);
    rerender(<QuantityControl value={2} max={2} onChange={change} />);
    expect(
      (
        screen.getByRole("button", {
          name: "Increase quantity",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });
  it("uses supplied cart totals and routes quantity and remove callbacks by line key", () => {
    const remove = vi.fn(),
      change = vi.fn();
    render(
      <CartView
        lines={[
          {
            key: "line-1",
            product: products[0],
            variantId: "smile-M",
            quantity: 1,
          },
        ]}
        lineTotals={{ "line-1": 1234 }}
        subtotalCents={5678}
        onQuantityChange={change}
        onRemove={remove}
        onContinueShopping={noop}
        onProductSelect={noop}
      />,
    );
    expect(screen.getByText("$12.34")).toBeTruthy();
    expect(screen.getByText("$56.78")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Increase quantity/ }));
    expect(change).toHaveBeenCalledWith("line-1", 2);
    fireEvent.click(screen.getByRole("button", { name: /Remove Smile Dog/ }));
    expect(remove).toHaveBeenCalledWith("line-1");
    expect(
      (
        screen.getByRole("button", {
          name: "Checkout unavailable",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });
  it("supports empty cart recovery", () => {
    const shop = vi.fn();
    render(
      <CartView
        lines={[]}
        lineTotals={{}}
        subtotalCents={0}
        onQuantityChange={noop}
        onRemove={noop}
        onContinueShopping={shop}
        onProductSelect={noop}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Explore the collection" }),
    );
    expect(shop).toHaveBeenCalledOnce();
  });
  it("routes controlled search, filters, sort, and reset", () => {
    const search = vi.fn(),
      filter = vi.fn(),
      sort = vi.fn(),
      reset = vi.fn();
    render(
      <ShopView
        products={[]}
        search=""
        onSearchChange={search}
        filter="all"
        filters={[
          { value: "all", label: "All" },
          { value: "sold_out", label: "Sold out" },
        ]}
        onFilterChange={filter}
        sort="default"
        sortOptions={[
          { value: "default", label: "Featured" },
          { value: "price", label: "Price" },
        ]}
        onSortChange={sort}
        onClearFilters={reset}
        onProductSelect={noop}
      />,
    );
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "mask" },
    });
    expect(search).toHaveBeenCalledWith("mask");
    fireEvent.click(screen.getByRole("button", { name: "Sold out" }));
    expect(filter).toHaveBeenCalledWith("sold_out");
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "price" },
    });
    expect(sort).toHaveBeenCalledWith("price");
    fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(reset).toHaveBeenCalledOnce();
  });
  it("announces mobile disclosure state, routes navigation, and handles Escape", () => {
    const menu = vi.fn(),
      nav = vi.fn();
    render(
      <SiteShell
        cartCount={3}
        menuOpen
        onMenuOpenChange={menu}
        onNavigate={nav}
        onCartOpen={noop}
      >
        <p>Content</p>
      </SiteShell>,
    );
    const button = screen.getByRole("button", { name: "Close −" });
    expect(button.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(button, { key: "Escape" });
    expect(menu).toHaveBeenCalledWith(false);
    fireEvent.click(screen.getByRole("link", { name: "All Pieces" }));
    expect(nav).toHaveBeenCalledWith("shop");
    expect(screen.getByRole("link", { name: "Bag, 3 items" })).toBeTruthy();
  });
  it("retains native modified-click navigation", () => {
    const nav = vi.fn();
    render(
      <SiteShell
        cartCount={0}
        menuOpen={false}
        onMenuOpenChange={noop}
        onNavigate={nav}
        onCartOpen={noop}
      >
        Content
      </SiteShell>,
    );
    fireEvent.click(screen.getByRole("link", { name: "All Pieces" }), {
      ctrlKey: true,
    });
    expect(nav).not.toHaveBeenCalled();
  });
  it("displays supplied countdown values and hides them for ended drops", () => {
    const props = {
      drop: { ...drops[2], status: "upcoming" as const },
      products: [],
      onProductSelect: noop,
      onArchive: noop,
      countdown: [{ label: "Hours", value: "14" }],
    };
    const { rerender } = render(<DropView {...props} />);
    expect(
      screen.getByRole("group", { name: "Release begins in" }).textContent,
    ).toContain("14Hours");
    rerender(<DropView {...props} drop={drops[1]} />);
    expect(
      screen.queryByRole("group", { name: "Release begins in" }),
    ).toBeNull();
  });
  it("falls back accessibly for missing or failed images and retries when the source changes", () => {
    const { rerender } = render(<Artwork src="bad.png" alt="A sample" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByText("IMAGE UNAVAILABLE")).toBeTruthy();
    rerender(<Artwork src="new.png" alt="A sample" />);
    expect(screen.getByRole("img").getAttribute("src")).toBe("new.png");
  });
  it("navigates archive cards and exposes real creator URLs", () => {
    const select = vi.fn();
    const { unmount } = render(
      <ArchiveView drops={[drops[1]]} onDropSelect={select} onShop={noop} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Explore The SCP Collection" }));
    expect(select).toHaveBeenCalledWith(drops[1]);
    unmount();
    const archive = render(
      <ArchiveView drops={[]} onDropSelect={noop} onShop={noop} />,
    );
    expect(screen.getByText("The record begins here.")).toBeTruthy();
    archive.unmount();
    render(<AboutView onShop={noop} />);
    expect(screen.getByRole("heading", { name: "Reality is darker than fiction." })).toBeTruthy();
    expect(screen.getByRole("link", { name: "contact@vulgar.example" }).getAttribute("href")).toBe("mailto:contact@vulgar.example");
  });
});
