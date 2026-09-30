import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "../../src/store/cartStore";
import { MOCK_EVENTS } from "../../src/data/mockEvents";

describe("Zustand Cart Store", () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.getState().clearCart();
  });

  it("should initialize with an empty cart", () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.getItemCount()).toBe(0);
  });

  it("should add item to cart and calculate item count", () => {
    const store = useCartStore.getState();
    store.addItem("evt-1", "tt-1-1", 2, 50);

    const updated = useCartStore.getState();
    expect(updated.items).toHaveLength(1);
    expect(updated.items[0]).toEqual({
      eventId: "evt-1",
      ticketTypeId: "tt-1-1",
      quantity: 2,
    });
    expect(updated.getItemCount()).toBe(2);
  });

  it("should increment quantity when adding existing item", () => {
    const store = useCartStore.getState();
    store.addItem("evt-1", "tt-1-1", 2, 10);
    store.addItem("evt-1", "tt-1-1", 3, 10);

    const updated = useCartStore.getState();
    expect(updated.items).toHaveLength(1);
    expect(updated.items[0].quantity).toBe(5);
    expect(updated.getItemCount()).toBe(5);
  });

  it("should not exceed maxAvailable when adding items", () => {
    const store = useCartStore.getState();
    store.addItem("evt-1", "tt-1-1", 8, 10);
    store.addItem("evt-1", "tt-1-1", 5, 10);

    const updated = useCartStore.getState();
    expect(updated.items[0].quantity).toBe(10);
  });

  it("should not add item if quantity is zero or negative", () => {
    const store = useCartStore.getState();
    store.addItem("evt-1", "tt-1-1", 0, 10);
    store.addItem("evt-1", "tt-1-2", -2, 10);

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("should update quantity of an item", () => {
    const store = useCartStore.getState();
    store.addItem("evt-1", "tt-1-1", 2, 20);
    store.updateQuantity("evt-1", "tt-1-1", 5, 20);

    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it("should cap quantity to maxAvailable when updating quantity", () => {
    const store = useCartStore.getState();
    store.addItem("evt-1", "tt-1-1", 2, 10);
    store.updateQuantity("evt-1", "tt-1-1", 25, 10);

    expect(useCartStore.getState().items[0].quantity).toBe(10);
  });

  it("should remove item when updated quantity is zero or negative", () => {
    const store = useCartStore.getState();
    store.addItem("evt-1", "tt-1-1", 2);
    store.updateQuantity("evt-1", "tt-1-1", 0);

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("should remove item from cart", () => {
    const store = useCartStore.getState();
    store.addItem("evt-1", "tt-1-1", 2);
    store.addItem("evt-1", "tt-1-2", 1);
    expect(useCartStore.getState().items).toHaveLength(2);

    store.removeItem("evt-1", "tt-1-1");
    const updated = useCartStore.getState();
    expect(updated.items).toHaveLength(1);
    expect(updated.items[0].ticketTypeId).toBe("tt-1-2");
  });

  it("should clear the entire cart", () => {
    const store = useCartStore.getState();
    store.addItem("evt-1", "tt-1-1", 2);
    store.addItem("evt-2", "tt-2-1", 3);
    expect(useCartStore.getState().getItemCount()).toBe(5);

    store.clearCart();
    expect(useCartStore.getState().items).toEqual([]);
    expect(useCartStore.getState().getItemCount()).toBe(0);
  });

  it("should calculate total price accurately given event list", () => {
    const store = useCartStore.getState();
    // evt-1, tt-1-1 price is 85 * 2 = 170
    // evt-2, tt-2-1 price is 120 * 1 = 120
    // Total should be 290
    store.addItem("evt-1", "tt-1-1", 2);
    store.addItem("evt-2", "tt-2-1", 1);

    const total = useCartStore.getState().calculateTotal(MOCK_EVENTS);
    expect(total).toBe(290);
  });

  it("should persist items to localStorage", () => {
    const store = useCartStore.getState();
    store.addItem("evt-1", "tt-1-1", 3);

    const raw = localStorage.getItem("seatlify-cart-storage");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.items).toEqual([
      { eventId: "evt-1", ticketTypeId: "tt-1-1", quantity: 3 },
    ]);
  });
});

