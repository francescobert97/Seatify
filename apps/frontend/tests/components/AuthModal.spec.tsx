import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AuthModal } from "../../src/components/auth/AuthModal";
import { AuthContext } from "../../src/auth/AuthContext";
import { AuthContextType, AuthError } from "../../src/types/auth";

describe("AuthModal Component",() => {
  let mockSignIn: Mock<AuthContextType["signIn"]>;
  let mockSignUp: Mock<AuthContextType["signUp"]>;
  let mockOnClose: Mock<() => void>;
  const createMockAuthContext = (overrides?: Partial<AuthContextType>): AuthContextType => ({
    user: null,
    session: null,
    isLoading: false,
    isAuthenticated: false,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: vi.fn(),
    signInWithOAuth: vi.fn(),
    getAccessToken: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    mockSignIn = vi.fn<AuthContextType["signIn"]>();
    mockSignUp = vi.fn<AuthContextType["signUp"]>();
    mockOnClose = vi.fn();
  });

  const renderWithAuth = (props: { open: boolean; onClose: () => void; initialTab?: "login" | "signup" }) => {
    return render(
      <AuthContext.Provider value={createMockAuthContext()}>
        <AuthModal {...props} />
      </AuthContext.Provider>
    );
  };

  it("should not render dialog content when open is false", () => {
    renderWithAuth({ open: false, onClose: mockOnClose });
    expect(screen.queryByText("Welcome to Seatify")).not.toBeInTheDocument();
  });

  it("should render Log In tab by default when open is true", () => {
    renderWithAuth({ open: true, onClose: mockOnClose });
    expect(screen.getByText("Welcome to Seatify")).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Log In$/i })).toBeInTheDocument();
  });

  it("should switch between Log In and Sign Up tabs", () => {
    renderWithAuth({ open: true, onClose: mockOnClose });

    // Switch to Sign Up
    const signUpTab = screen.getByRole("tab", { name: /Sign Up/i });
    fireEvent.click(signUpTab);

    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Account/i })).toBeInTheDocument();

    // Switch back to Log In
    const logInTab = screen.getByRole("tab", { name: /Log In/i });
    fireEvent.click(logInTab);

    expect(screen.getByText("Welcome to Seatify")).toBeInTheDocument();
  });

  it("should show error on Log In with empty fields", () => {
    renderWithAuth({ open: true, onClose: mockOnClose });

    const submitBtn = screen.getByRole("button", { name: /^Log In$/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText("Please enter both email and password.")).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("should call signIn and close modal on success", async () => {
    mockSignIn.mockResolvedValueOnce({ error: null });

    renderWithAuth({ open: true, onClose: mockOnClose });

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /^Log In$/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("test@example.com", "password123");
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("should display error message on Log In failure", async () => {
    const errorMessage ={ error: {name: 'InvalidLogin', message: "Invalid login credentials" } }
    mockSignIn.mockResolvedValueOnce({ error: {name: 'InvalidLogin', message: "Invalid login credentials" } });

    renderWithAuth({ open: true, onClose: mockOnClose });

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "wrongpassword" } });

    fireEvent.click(screen.getByRole("button", { name: /^Log In$/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid login credentials")).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it("should validate password length on Sign Up (< 6 characters)", () => {
    renderWithAuth({ open: true, onClose: mockOnClose, initialTab: "signup" });

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "new@example.com" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "123" } });

    fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

    expect(screen.getByText("Password must be at least 6 characters.")).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("should call signUp with metadata and show success alert", async () => {
    vi.useFakeTimers();
    try {
      mockSignUp.mockResolvedValueOnce({error: null, user: { id: "123", user_metadata: { firstName: "John", lastName: "Doe" }, aud: "authenticated", app_metadata: {}, created_at: new Date().getDate.toString() } });

      renderWithAuth({ open: true, onClose: mockOnClose, initialTab: "signup" });

      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "John" } });
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "Doe" } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: "john@example.com" } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "securepass123" } });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));
      });

      expect(mockSignUp).toHaveBeenCalledWith("john@example.com", "securepass123", {
        firstName: "John",
        lastName: "Doe",
      });
      expect(screen.getByText(/Account created successfully/i)).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(mockOnClose).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("should trigger onClose when close icon button is clicked", () => {
    renderWithAuth({ open: true, onClose: mockOnClose });

    const closeBtn = screen.getByLabelText("close");
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
