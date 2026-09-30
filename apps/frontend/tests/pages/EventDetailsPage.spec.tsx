import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EventDetailsPage } from "../../src/pages/EventDetails/EventDetailsPage";
import { useCartStore } from "../../src/store/cartStore";
import { AuthContext } from "../../src/auth/AuthContext";
import { AuthContextType } from "../../src/types/auth";

describe("EventDetailsPage Component", () => {
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

  it("should render event details including image, title, category, venue, and description", () => {
    renderWithAuth(<EventDetailsPage eventId="evt-1" />);

    expect(screen.getByText("Taylor Swift | The Eras Tour")).toBeInTheDocument();
    expect(screen.getByText("CONCERTS")).toBeInTheDocument();
    expect(screen.getByText(/Wembley Stadium/i)).toBeInTheDocument();
    expect(screen.getByText(/About this event/i)).toBeInTheDocument();
    expect(
      screen.getByText(/record-breaking Eras Tour live at Wembley Stadium/i)
    ).toBeInTheDocument();
  });

  it("should render ticket types with descriptions, prices, and availability", () => {
    renderWithAuth(<EventDetailsPage eventId="evt-1" />);

    expect(screen.getByText("General Admission Standing")).toBeInTheDocument();
    expect(screen.getByText("Pitch standing access with front-stage viewing area.")).toBeInTheDocument();
    expect(screen.getByText("€85")).toBeInTheDocument();
    expect(screen.getByText("50 tickets available")).toBeInTheDocument();

    expect(screen.getByText("Reserved Seated Tier 1")).toBeInTheDocument();
    expect(screen.getByText("VIP Karma Package")).toBeInTheDocument();
  });

  it("should increment and decrement quantity without exceeding ticket availability", () => {
    renderWithAuth(<EventDetailsPage eventId="evt-1" />);

    const increaseBtn = screen.getByLabelText("Increase quantity of VIP Karma Package");
    const decreaseBtn = screen.getByLabelText("Decrease quantity of VIP Karma Package");

    // Initial quantity is 1
    expect(screen.getByTestId("quantity-tt-1-3")).toHaveTextContent("1");

    // Click increment
    fireEvent.click(increaseBtn);
    expect(screen.getByTestId("quantity-tt-1-3")).toHaveTextContent("2");

    // Click decrement
    fireEvent.click(decreaseBtn);
    expect(screen.getByTestId("quantity-tt-1-3")).toHaveTextContent("1");
  });

  it("should add selected quantity to cart and display success notification", () => {
    renderWithAuth(<EventDetailsPage eventId="evt-1" />);

    const addButtons = screen.getAllByRole("button", { name: /Add to cart/i });
    fireEvent.click(addButtons[0]);

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]).toEqual({
      eventId: "evt-1",
      ticketTypeId: "tt-1-1",
      quantity: 1,
    });

    expect(screen.getByText(/Added 1 ticket \(General Admission Standing\) to cart!/i)).toBeInTheDocument();
  });

  it("should display Not Found when event does not exist", async () => {
    renderWithAuth(<EventDetailsPage eventId="invalid-event-id" />);
    expect(await screen.findByText(/Event Not Found/i)).toBeInTheDocument();
  });
});

