// @vitest-environment happy-dom
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { StorefrontDemo } from "../preview/main";
import { readRoute, routeHref, restoreCart, cartStorageKey } from "../preview/demo-state";

beforeEach(() => {
  localStorage.clear();
  history.replaceState(null, "", "/VULGAR/");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("standalone demo", () => {
  it("preserves the Pages directory in shareable URLs and handles invalid routes", () => {
    expect(routeHref({ page: "product", slug: "russian-sleep-experiment" })).toBe("/VULGAR/?view=product&product=russian-sleep-experiment");
    expect(readRoute("?view=product&product=russian-sleep-experiment")).toEqual({ page: "product", slug: "russian-sleep-experiment" });
    expect(readRoute("?view=unknown")).toEqual({ page: "home" });
  });

  it("restores only valid catalog entries and clamps merged quantities to stock", () => {
    expect(restoreCart("broken")).toEqual([]);
    const restored = restoreCart(JSON.stringify([
      { productId: "smile-dog", variantId: "smile-S", quantity: 4, priceCents: 1 },
      { productId: "smile-dog", variantId: "smile-S", quantity: 4 },
      { productId: "captain-clark", variantId: "captain-S", quantity: 1 },
      { productId: "smile-dog", variantId: "smile-XXL", quantity: 1 },
      { productId: "missing", variantId: "smile-S", quantity: 1 },
      { productId: "russian-sleep-experiment", variantId: "sleep-S", quantity: -1 },
    ]));
    expect(restored).toHaveLength(1);
    expect(restored[0].quantity).toBe(5);
    expect(restored[0].product.priceCents).toBe(3800);
  });

  it("persists the shopping flow across remounts and prevents adding beyond stock", () => {
    history.replaceState(null, "", "/VULGAR/?view=product&product=smile-dog");
    const mounted = render(<StorefrontDemo />);
    fireEvent.click(screen.getByRole("button", { name: "S" }));
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getByRole("button", { name: "Add to bag" }));
    expect((screen.getByRole("button", { name: "Add to bag" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("link", { name: "Bag, 5 items" })).toBeTruthy();
    fireEvent.click(screen.getByRole("link", { name: "Bag, 5 items" }));
    expect(location.search).toBe("?view=cart");
    expect(document.activeElement?.tagName).toBe("MAIN");
    expect(screen.getByText("$190.00", { selector: "strong" })).toBeTruthy();
    mounted.unmount();
    render(<StorefrontDemo />);
    expect(screen.getByRole("link", { name: "Bag, 5 items" })).toBeTruthy();
    expect((screen.getByRole("button", { name: /Increase quantity for/ }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: /Remove Smile Dog/ }));
    expect(screen.getByRole("heading", { name: "Nothing here. Yet." })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(cartStorageKey)!)).toEqual([]);
  });

  it("handles browser history and renders only products belonging to the selected collection", () => {
    render(<StorefrontDemo />);
    history.replaceState(null, "", "/VULGAR/?view=drop&drop=demo-000");
    act(() => window.dispatchEvent(new PopStateEvent("popstate")));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Dead air");
    expect(screen.getByText("Captain Clark")).toBeTruthy();
    expect(screen.queryByText("Smile Dog")).toBeNull();
    history.replaceState(null, "", "/VULGAR/?view=about");
    act(() => window.dispatchEvent(new PopStateEvent("popstate")));
    expect(document.title).toBe("About — VULGAR");
  });

  it("remains usable if browser storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    render(<StorefrontDemo />);
    expect(screen.getByRole("link", { name: "Bag, 0 items" })).toBeTruthy();
  });
});
