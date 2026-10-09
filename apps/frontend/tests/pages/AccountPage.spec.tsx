import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AccountPage, CustomerAreaContent } from "../../src/pages/Account/AccountPage";
import { MyOrdersSection } from "../../src/pages/Account/MyOrdersSection";
import { AccountSettingsSection } from "../../src/pages/Account/AccountSettingsSection";
import { AuthContext } from "../../src/auth/AuthContext";
import { AuthContextType } from "../../src/types/auth";
import { User } from "@supabase/supabase-js";
import { MOCK_ORDERS } from "../../src/data/mockOrders";
import * as navigation from "../../src/router/navigation";

describe("AccountPage & Customer Area", () => {
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

  const mockAuthenticatedUser: User = {
    id: "user-123",
    email: "alex.smith@example.com",
    user_metadata: { firstName: "Alex", lastName: "Smith" },
    app_metadata: {},
    aud: "authenticated",
    created_at: "2026-01-01T00:00:00Z",
  };

  const renderWithAuth = (ui: React.ReactElement, authOverrides?: Partial<AuthContextType>) => {
    return render(
      <AuthContext.Provider value={createMockAuthContext(authOverrides)}>
        {ui}
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Route Protection & Header", () => {
    it("should render Sign In Required card when user is not authenticated", () => {
      renderWithAuth(<AccountPage />, { isAuthenticated: false });

      expect(screen.getByText("Sign In Required")).toBeInTheDocument();
      expect(
        screen.getByText("Please sign in to access your customer area and manage your orders.")
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^Sign In$/i })).toBeInTheDocument();
      expect(screen.queryByText(/Welcome back/i)).not.toBeInTheDocument();
    });

    it("should render customer area with user initials, name, and email when authenticated", () => {
      renderWithAuth(<AccountPage />, {
        isAuthenticated: true,
        user: mockAuthenticatedUser,
      });

      expect(screen.getAllByText("Alex Smith").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("alex.smith@example.com").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("AS").length).toBeGreaterThanOrEqual(1); // Initials
      expect(screen.getByText(/Welcome back, Alex!/i)).toBeInTheDocument();
    });

    it("should use fallback mock data if authenticated user has no metadata name", () => {
      const userWithoutMeta: User = {
        ...mockAuthenticatedUser,
        user_metadata: {},
        email: "solo@example.com",
      };

      renderWithAuth(<CustomerAreaContent />, {
        isAuthenticated: true,
        user: userWithoutMeta,
      });

      // Default mock profile firstName is Jane, lastName Doe
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      expect(screen.getByText("solo@example.com")).toBeInTheDocument();
    });
  });

  describe("Section Navigation", () => {
    it("should switch between Overview, My Orders, and Account Settings tabs", () => {
      renderWithAuth(<CustomerAreaContent />, {
        isAuthenticated: true,
        user: mockAuthenticatedUser,
      });

      // Initially on Overview
      expect(screen.getByText(/Welcome back, Alex!/i)).toBeInTheDocument();
      expect(screen.getByText("Total Orders")).toBeInTheDocument();

      // Click My Orders tab
      const ordersTab = screen.getByRole("tab", { name: /My Orders/i });
      fireEvent.click(ordersTab);
      expect(screen.getByText(/Review your ticket bookings/i)).toBeInTheDocument();

      // Click Account Settings tab
      const settingsTab = screen.getByRole("tab", { name: /Account Settings/i });
      fireEvent.click(settingsTab);
      expect(screen.getByText("Personal Information")).toBeInTheDocument();

      // Click Overview tab back
      const overviewTab = screen.getByRole("tab", { name: /Overview/i });
      fireEvent.click(overviewTab);
      expect(screen.getByText(/Welcome back, Alex!/i)).toBeInTheDocument();
    });

    it("should navigate to My Orders when 'View all orders' is clicked in Overview", () => {
      renderWithAuth(<CustomerAreaContent />, {
        isAuthenticated: true,
        user: mockAuthenticatedUser,
      });

      const viewAllBtn = screen.getByRole("button", { name: /View all orders/i });
      fireEvent.click(viewAllBtn);

      expect(screen.getByText(/Review your ticket bookings/i)).toBeInTheDocument();
    });

    it("should navigate to Account Settings when 'Edit Settings' is clicked in Overview", () => {
      renderWithAuth(<CustomerAreaContent />, {
        isAuthenticated: true,
        user: mockAuthenticatedUser,
      });

      const editSettingsBtn = screen.getByRole("button", { name: /Edit Settings/i });
      fireEvent.click(editSettingsBtn);

      expect(screen.getByText("Personal Information")).toBeInTheDocument();
    });

    it("should open order details dialog when 'View Details' is clicked in Recent Orders", () => {
      renderWithAuth(<CustomerAreaContent />, {
        isAuthenticated: true,
        user: mockAuthenticatedUser,
      });

      const viewDetailsButtons = screen.getAllByRole("button", { name: /View Details/i });
      expect(viewDetailsButtons.length).toBeGreaterThan(0);
      fireEvent.click(viewDetailsButtons[0]);

      // Opens dialog
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Order Details")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Manage Booking/i })).toBeDisabled();
    });
  });

  describe("My Orders Section", () => {
    it("should list mock orders with references, dates, venue, tickets and totals", () => {
      renderWithAuth(
        <MyOrdersSection
          orders={MOCK_ORDERS}
          selectedOrder={null}
          onSelectOrder={vi.fn()}
        />
      );

      // Verify first order details
      expect(screen.getByText("Taylor Swift | The Eras Tour")).toBeInTheDocument();
      expect(screen.getByText(/STF-94821-2026/i)).toBeInTheDocument();
      expect(screen.getByText(/Wembley Stadium, London, UK/i)).toBeInTheDocument();
      expect(screen.getAllByText(/2 tickets/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("€170")).toBeInTheDocument();
      expect(screen.getAllByText("CONFIRMED").length).toBeGreaterThan(0);
    });

    it("should filter orders by status tabs", () => {
      renderWithAuth(
        <MyOrdersSection
          orders={MOCK_ORDERS}
          selectedOrder={null}
          onSelectOrder={vi.fn()}
        />
      );

      // Total orders
      expect(screen.getByText("Taylor Swift | The Eras Tour")).toBeInTheDocument();
      expect(screen.getByText("Tomorrowland 2026")).toBeInTheDocument();

      // Filter by Confirmed
      const confirmedTab = screen.getByRole("tab", { name: /Confirmed/i });
      fireEvent.click(confirmedTab);
      expect(screen.getByText("Taylor Swift | The Eras Tour")).toBeInTheDocument();
      expect(screen.queryByText("Tomorrowland 2026")).not.toBeInTheDocument();

      // Filter by Cancelled
      const cancelledTab = screen.getByRole("tab", { name: /Cancelled/i });
      fireEvent.click(cancelledTab);
      expect(screen.queryByText("Taylor Swift | The Eras Tour")).not.toBeInTheDocument();
      expect(screen.getByText("Tomorrowland 2026")).toBeInTheDocument();
    });

    it("should display empty state with Browse Events button when no orders match", () => {
      const navigateSpy = vi.spyOn(navigation, "navigate").mockImplementation(() => {});

      renderWithAuth(
        <MyOrdersSection
          orders={[]}
          selectedOrder={null}
          onSelectOrder={vi.fn()}
        />
      );

      expect(screen.getByText("No orders found")).toBeInTheDocument();
      const browseBtn = screen.getByRole("button", { name: /Browse Events/i });
      fireEvent.click(browseBtn);
      expect(navigateSpy).toHaveBeenCalledWith("/");
    });

    it("should display order details modal with tickets breakdown and disabled Manage Booking button", () => {
      const handleSelectOrder = vi.fn();
      const testOrder = MOCK_ORDERS[0];

      renderWithAuth(
        <MyOrdersSection
          orders={MOCK_ORDERS}
          selectedOrder={testOrder}
          onSelectOrder={handleSelectOrder}
        />
      );

      // Modal content
      expect(screen.getByText("Order Details")).toBeInTheDocument();
      expect(screen.getAllByText(testOrder.orderReference).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(testOrder.eventName).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("General Admission Standing").length).toBe(2);
      expect(screen.getByText("Ticket ID: tkt-2026-001-1")).toBeInTheDocument();
      expect(screen.getByText("Ticket ID: tkt-2026-001-2")).toBeInTheDocument();

      // Manage Booking button verification
      const manageBtn = screen.getByRole("button", { name: /Manage Booking/i });
      expect(manageBtn).toBeInTheDocument();
      expect(manageBtn).toBeDisabled();
      expect(manageBtn).toHaveAttribute("data-order-id", testOrder.id);
      expect(manageBtn).toHaveAttribute("data-order-ref", testOrder.orderReference);

      // Close modal
      const closeBtn = screen.getByRole("button", { name: /close order details/i });
      fireEvent.click(closeBtn);
      expect(handleSelectOrder).toHaveBeenCalledWith(null);
    });
  });

  describe("Account Settings Section", () => {
    it("should display initial profile information and toggle into edit mode", () => {
      renderWithAuth(
        <AccountSettingsSection
          initialProfile={{
            firstName: "Alex",
            lastName: "Smith",
            email: "alex.smith@example.com",
          }}
        />
      );

      expect(screen.getByDisplayValue("Alex")).toBeDisabled();
      expect(screen.getByDisplayValue("Smith")).toBeDisabled();
      expect(screen.getByDisplayValue("alex.smith@example.com")).toBeDisabled();

      // Click Edit
      const editBtn = screen.getByRole("button", { name: /Edit Information/i });
      fireEvent.click(editBtn);

      expect(screen.getByDisplayValue("Alex")).toBeEnabled();
      expect(screen.getByRole("button", { name: /Save Changes/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    });

    it("should validate required fields and email format before saving", () => {
      renderWithAuth(
        <AccountSettingsSection
          initialProfile={{
            firstName: "Alex",
            lastName: "Smith",
            email: "alex.smith@example.com",
          }}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /Edit Information/i }));

      const firstNameInput = screen.getByLabelText("First Name");
      const lastNameInput = screen.getByLabelText("Last Name");
      const emailInput = screen.getByLabelText("Email Address");
      const saveBtn = screen.getByRole("button", { name: /Save Changes/i });

      // Clear first name
      fireEvent.change(firstNameInput, { target: { value: "   " } });
      fireEvent.click(saveBtn);
      expect(screen.getByText("First name is required")).toBeInTheDocument();

      // Restore first name and clear last name
      fireEvent.change(firstNameInput, { target: { value: "Alex" } });
      fireEvent.change(lastNameInput, { target: { value: "" } });
      fireEvent.click(saveBtn);
      expect(screen.getByText("Last name is required")).toBeInTheDocument();

      // Restore last name and enter invalid email
      fireEvent.change(lastNameInput, { target: { value: "Smith" } });
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.click(saveBtn);
      expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    });

    it("should save changes to local state and display notice", () => {
      renderWithAuth(
        <AccountSettingsSection
          initialProfile={{
            firstName: "Alex",
            lastName: "Smith",
            email: "alex.smith@example.com",
          }}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /Edit Information/i }));

      const firstNameInput = screen.getByLabelText("First Name");
      fireEvent.change(firstNameInput, { target: { value: "Alexander" } });

      const saveBtn = screen.getByRole("button", { name: /Save Changes/i });
      fireEvent.click(saveBtn);

      // Exits edit mode and shows updated name
      expect(screen.getByDisplayValue("Alexander")).toBeDisabled();
      expect(
        screen.getByText(/Profile changes saved to your current session/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/modifications are kept in local state only/i)
      ).toBeInTheDocument();
    });

    it("should revert changes on Cancel", () => {
      renderWithAuth(
        <AccountSettingsSection
          initialProfile={{
            firstName: "Alex",
            lastName: "Smith",
            email: "alex.smith@example.com",
          }}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /Edit Information/i }));

      const firstNameInput = screen.getByLabelText("First Name");
      fireEvent.change(firstNameInput, { target: { value: "ChangedName" } });

      const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
      fireEvent.click(cancelBtn);

      // Reverts back to Alex
      expect(screen.getByDisplayValue("Alex")).toBeDisabled();
      expect(screen.queryByDisplayValue("ChangedName")).not.toBeInTheDocument();
    });
  });
});
