import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Navbar } from "../../src/components/layout/Navbar";
import { AuthContext } from "../../src/auth/AuthContext";
import { AuthContextType } from "../../src/types/auth";
import { User } from "@supabase/supabase-js";

describe("Navbar Component", () => {
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

  it("should render branding and unauthenticated action buttons", () => {
    render(
      <AuthContext.Provider value={createMockAuthContext()}>
        <Navbar />
      </AuthContext.Provider>
    );

    expect(screen.getAllByText("Seatify").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: /^Log in$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Sign up$/i })).toBeInTheDocument();
  });

  it("should open AuthModal with Log In tab when Log in button is clicked", () => {
    render(
      <AuthContext.Provider value={createMockAuthContext()}>
        <Navbar />
      </AuthContext.Provider>
    );

    const loginBtn = screen.getByRole("button", { name: /^Log in$/i });
    fireEvent.click(loginBtn);

    expect(screen.getByText("Welcome to Seatify")).toBeInTheDocument();
  });

  it("should open AuthModal with Sign Up tab when Sign up button is clicked", () => {
    render(
      <AuthContext.Provider value={createMockAuthContext()}>
        <Navbar />
      </AuthContext.Provider>
    );

    const signupBtn = screen.getAllByRole("button", { name: /^Sign up$/i })[0];
    fireEvent.click(signupBtn);

    expect(screen.getByText("Create your account")).toBeInTheDocument();
  });

  it("should render user avatar, name, and handle sign out when authenticated", async () => {
    const mockSignOut = vi.fn().mockResolvedValue({ error: null });
    const mockUser: User = {
      id: "u1",
      email: "maria.rossi@example.com",
      user_metadata: { firstName: "Maria", lastName: "Rossi" },
      app_metadata: {},
      aud: "authenticated",
      created_at: "",
    };

    render(
      <AuthContext.Provider
        value={createMockAuthContext({
          isAuthenticated: true,
          user: mockUser,
          signOut: mockSignOut,
        })}
      >
        <Navbar />
      </AuthContext.Provider>
    );

    // Should display initials "MR"
    expect(screen.getAllByText("MR")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Maria Rossi")[0]).toBeInTheDocument();

    // Click profile menu
    const profileBtn = screen.getByRole("button", { name: /Maria Rossi/i });
    fireEvent.click(profileBtn);

    // Menu should be open with email and Sign out option
    expect(screen.getAllByText("maria.rossi@example.com")[0]).toBeInTheDocument();
    const signOutItem = screen.getAllByText("Sign out")[0];
    expect(signOutItem).toBeInTheDocument();

    fireEvent.click(signOutItem);
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it("should handle navigation link click", () => {
    const scrollMock = vi.fn();
    const targetElement = document.createElement("div");
    targetElement.id = "upcoming-events";
    targetElement.scrollIntoView = scrollMock;
    document.body.appendChild(targetElement);

    render(
      <AuthContext.Provider value={createMockAuthContext()}>
        <Navbar />
      </AuthContext.Provider>
    );

    const eventsBtn = screen.getByRole("button", { name: /^Events$/i });
    fireEvent.click(eventsBtn);

    expect(scrollMock).toHaveBeenCalled();
    document.body.removeChild(targetElement);
  });

  it("should toggle mobile navigation drawer", () => {
    render(
      <AuthContext.Provider value={createMockAuthContext()}>
        <Navbar />
      </AuthContext.Provider>
    );

    const drawerToggle = screen.getByLabelText("open navigation drawer");
    fireEvent.click(drawerToggle);

    // Drawer should have close button
    const closeBtn = screen.getByLabelText("close drawer");
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
  });
});
