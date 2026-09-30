import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CartDrawer } from "../../src/components/cart/CartDrawer";
import { useCartStore } from "../../src/store/cartStore";

describe("CartDrawer Component", () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.getState().clearCart();
    vi.restoreAllMocks();
  });

  it("should render empty state when cart has no items", () => {
    const handleClose = vi.fn();
    render(<CartDrawer open={true} onClose={handleClose} />);

    expect(screen.getByText("Your Cart")).toBeInTheDocument();
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Browse Events/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Browse Events/i }));
    expect(handleClose).toHaveBeenCalled();
  });

  it("should render cart items with details, unit price, and subtotal", () => {
    useCartStore.getState().addItem("evt-1", "tt-1-1", 2, 50);

    render(<CartDrawer open={true} onClose={vi.fn()} />);

    expect(screen.getByText("Taylor Swift | The Eras Tour")).toBeInTheDocument();
    expect(screen.getByText("General Admission Standing")).toBeInTheDocument();
    expect(screen.getByText("€85 each")).toBeInTheDocument();
    expect(screen.getByText("Subtotal: €170")).toBeInTheDocument();
    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  it("should increase and decrease item quantity respecting inventory limits", () => {
    // tt-1-3 available is 10
    useCartStore.getState().addItem("evt-1", "tt-1-3", 1, 10);

    render(<CartDrawer open={true} onClose={vi.fn()} />);

    const plusBtn = screen.getByLabelText("Increase quantity");
    fireEvent.click(plusBtn);

    expect(screen.getByText("Subtotal: €590")).toBeInTheDocument();

    const minusBtn = screen.getByLabelText("Decrease quantity");
    fireEvent.click(minusBtn);

    expect(screen.getByText("Subtotal: €295")).toBeInTheDocument();
  });

  it("should remove item when delete icon button is clicked", () => {
    useCartStore.getState().addItem("evt-1", "tt-1-1", 1);
    render(<CartDrawer open={true} onClose={vi.fn()} />);

    const removeBtn = screen.getByLabelText(/Remove General Admission Standing/i);
    fireEvent.click(removeBtn);

    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });

  it("should clear cart when Clear cart button is clicked", () => {
    useCartStore.getState().addItem("evt-1", "tt-1-1", 2);
    useCartStore.getState().addItem("evt-2", "tt-2-1", 1);

    render(<CartDrawer open={true} onClose={vi.fn()} />);

    expect(screen.getByText("3 items")).toBeInTheDocument();

    const clearBtn = screen.getByRole("button", { name: /Clear cart/i });
    fireEvent.click(clearBtn);

    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });

  it("should display disabled Checkout button", () => {
    useCartStore.getState().addItem("evt-1", "tt-1-1", 1);
    render(<CartDrawer open={true} onClose={vi.fn()} />);

    const checkoutBtn = screen.getByRole("button", { name: /Proceed to Checkout/i });
    expect(checkoutBtn).toBeInTheDocument();
    expect(checkoutBtn).toBeDisabled();
  });
});

