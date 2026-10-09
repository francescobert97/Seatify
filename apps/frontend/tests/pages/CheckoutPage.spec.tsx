import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CheckoutPage, MockPaymentForm } from "../../src/pages/Checkout/CheckoutPage";
import { useCartStore } from "../../src/store/cartStore";
import { AuthContext } from "../../src/auth/AuthContext";
import { AuthContextType } from "../../src/types/auth";
import { httpClient } from "../../src/services/httpClient";
import * as navigation from "../../src/router/navigation";

describe("CheckoutPage Component", () => {
  const createMockAuthContext = (overrides?: Partial<AuthContextType>): AuthContextType => ({
    user: null,
    session: null,
    isLoading: false,
    isAuthenticated: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    signInWithOAuth: vi.fn(),
    getAccessToken: vi.fn(),
    ...overrides,
  });

  const renderWithAuth = (ui: React.ReactElement) => {
    return render(
      <AuthContext.Provider value={createMockAuthContext()}>
        {ui}
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    localStorage.clear();
    useCartStore.getState().clearCart();
    vi.restoreAllMocks();
  });

  it("should render empty cart view when there are no items in cart", () => {
    const navigateSpy = vi.spyOn(navigation, "navigate").mockImplementation(() => {});
    renderWithAuth(<CheckoutPage />);

    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByText(/You don't have any tickets in your cart/i)).toBeInTheDocument();

    const browseBtn = screen.getByRole("button", { name: /Browse Events/i });
    fireEvent.click(browseBtn);
    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("should render order summary and payment form when cart has items", () => {
    useCartStore.getState().addItem("evt-1", "tt-1-1", 2); // Taylor Swift: 2 x 85 = 170
    renderWithAuth(<CheckoutPage />);

    expect(screen.getByText("Checkout")).toBeInTheDocument();
    expect(screen.getByText("Order Summary")).toBeInTheDocument();
    expect(screen.getByText("Taylor Swift | The Eras Tour")).toBeInTheDocument();
    expect(screen.getByText("General Admission Standing")).toBeInTheDocument();
    expect(screen.getByText(/Qty: 2 × €85/i)).toBeInTheDocument();
    expect(screen.getAllByText("€170")).toHaveLength(2);

    // Payment section
    expect(screen.getByText("Payment")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Confirm & Pay €170/i })).toBeInTheDocument();
  });

  it("should navigate back to events when Back to Events button is clicked", () => {
    const navigateSpy = vi.spyOn(navigation, "navigate").mockImplementation(() => {});
    useCartStore.getState().addItem("evt-1", "tt-1-1", 1);
    renderWithAuth(<CheckoutPage />);

    const backBtn = screen.getByRole("button", { name: /Back to Events/i });
    fireEvent.click(backBtn);
    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("should successfully process payment, clear cart, and display confirmation screen", async () => {
    useCartStore.getState().addItem("evt-1", "tt-1-1", 2);

    const postSpy = vi.spyOn(httpClient, "post").mockResolvedValueOnce({
      message: "Payment processed successfully",
      payment: {
        paymentId: "mock_pay_test_999",
        status: "succeeded",
        amount: 170,
        currency: "EUR",
        createdAt: "2026-10-07T10:00:00Z",
      },
    });

    renderWithAuth(<CheckoutPage />);

    const payButton = screen.getByRole("button", { name: /Confirm & Pay €170/i });
    fireEvent.click(payButton);

    expect(postSpy).toHaveBeenCalledWith(
      "/api/payments",
      {
        items: [
          {
            eventId: "evt-1",
            ticketTypeId: "tt-1-1",
            quantity: 2,
          },
        ],
        currency: "EUR",
      }
    );

    // Confirmation screen
    await waitFor(() => {
      expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
    });
    expect(screen.getByText("mock_pay_test_999")).toBeInTheDocument();
    expect(screen.getByText("SUCCEEDED")).toBeInTheDocument();

    // Cart store should be cleared
    expect(useCartStore.getState().items).toHaveLength(0);

    // Clicking Back to Events from confirmation screen
    const navigateSpy = vi.spyOn(navigation, "navigate").mockImplementation(() => {});
    const returnHomeBtn = screen.getByRole("button", { name: /Back to Events/i });
    fireEvent.click(returnHomeBtn);
    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("should display error message when payment request fails", async () => {
    useCartStore.getState().addItem("evt-1", "tt-1-1", 1);

    vi.spyOn(httpClient, "post").mockRejectedValueOnce(
      new Error("Payment gateway temporarily unavailable")
    );

    renderWithAuth(<CheckoutPage />);

    const payButton = screen.getByRole("button", { name: /Confirm & Pay/i });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(screen.getByText("Payment gateway temporarily unavailable")).toBeInTheDocument();
    });

    // Cart must not be cleared on failure
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it("should handle invalid response from payment provider", async () => {
    useCartStore.getState().addItem("evt-1", "tt-1-1", 1);
    vi.spyOn(httpClient, "post").mockResolvedValueOnce({
      message: "Unexpected response format",
    });

    renderWithAuth(<CheckoutPage />);
    const payButton = screen.getByRole("button", { name: /Confirm & Pay/i });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid response from payment provider")).toBeInTheDocument();
    });
  });

  it("should handle non-Error exception gracefully", async () => {
    useCartStore.getState().addItem("evt-1", "tt-1-1", 1);
    vi.spyOn(httpClient, "post").mockRejectedValueOnce("Unknown crash");

    renderWithAuth(<CheckoutPage />);
    const payButton = screen.getByRole("button", { name: /Confirm & Pay/i });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to process payment. Please try again.")).toBeInTheDocument();
    });
  });

  it("should handle unknown event and ticket fallback in order summary", () => {
    useCartStore.getState().addItem("unknown-event-id", "unknown-ticket-id", 1);
    renderWithAuth(<CheckoutPage />);

    expect(screen.getByText("unknown-event-id")).toBeInTheDocument();
    expect(screen.getByText("unknown-ticket-id")).toBeInTheDocument();
  });

  it("should render MockPaymentForm with processing state and error alert", () => {
    const handlePay = vi.fn();
    const { rerender } = render(
      <MockPaymentForm
        totalAmount={50}
        currency="€"
        isProcessing={true}
        errorMessage="Card declined"
        onConfirmPayment={handlePay}
      />
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByText("Card declined")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();

    rerender(
      <MockPaymentForm
        totalAmount={50}
        currency="€"
        isProcessing={false}
        errorMessage={null}
        onConfirmPayment={handlePay}
      />
    );
    expect(screen.getByRole("button", { name: /Confirm & Pay €50/i })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: /Confirm & Pay €50/i }));
    expect(handlePay).toHaveBeenCalled();
  });
});

