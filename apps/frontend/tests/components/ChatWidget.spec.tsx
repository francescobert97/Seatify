import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ChatWidget } from "../../src/components/chat/ChatWidget";
import { useChatStore } from "../../src/store/chatStore";
import { MOCK_ORDERS } from "../../src/data/mockOrders";
import { App } from "../../src/App";
import { supabase } from "../../src/auth/supabase";
import * as navigation from "../../src/router/navigation";

describe("ChatWidget — Global AI Support Chat", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useChatStore.getState().reset();
  });

  describe("Widget Controls & Overlay States", () => {
    it("should render floating button in closed state by default", () => {
      render(<ChatWidget />);

      const openBtn = screen.getByRole("button", { name: /open ai support chat/i });
      expect(openBtn).toBeInTheDocument();
      expect(screen.queryByRole("region", { name: /ai support chat panel/i })).not.toBeInTheDocument();
    });

    it("should open overlay chat panel when floating button is clicked", () => {
      render(<ChatWidget />);

      const openBtn = screen.getByRole("button", { name: /open ai support chat/i });
      fireEvent.click(openBtn);

      expect(screen.getByRole("region", { name: /ai support chat panel/i })).toBeInTheDocument();
      expect(screen.getByText("Seatify AI Support")).toBeInTheDocument();
      expect(screen.getByText(/Offline • Preview/i)).toBeInTheDocument();
      expect(screen.getByText(/AI assistant is not connected yet/i)).toBeInTheDocument();
    });

    it("should support minimizing, restoring, and closing the chat panel", () => {
      render(<ChatWidget />);

      // Open chat
      fireEvent.click(screen.getByRole("button", { name: /open ai support chat/i }));
      expect(screen.getByRole("region", { name: /ai support chat panel/i })).toBeInTheDocument();

      // Minimize
      const minimizeBtn = screen.getByRole("button", { name: /minimize chat/i });
      fireEvent.click(minimizeBtn);

      expect(screen.queryByRole("region", { name: /ai support chat panel/i })).not.toBeInTheDocument();
      expect(screen.getByLabelText(/minimized ai chat/i)).toBeInTheDocument();
      expect(screen.getByText("AI Support")).toBeInTheDocument();

      // Restore
      const restoreBtn = screen.getByRole("button", { name: /restore chat/i });
      fireEvent.click(restoreBtn);

      expect(screen.getByRole("region", { name: /ai support chat panel/i })).toBeInTheDocument();

      // Close
      const closeBtn = screen.getByRole("button", { name: /close chat/i });
      fireEvent.click(closeBtn);

      expect(screen.queryByRole("region", { name: /ai support chat panel/i })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /open ai support chat/i })).toBeInTheDocument();
    });

    it("should support reopening the panel while preserving previous messages", () => {
      render(<ChatWidget />);

      // Open
      fireEvent.click(screen.getByRole("button", { name: /open ai support chat/i }));

      // Type and send a message
      const input = screen.getByLabelText("chat message input");
      fireEvent.change(input, { target: { value: "Can you help me with ticket transfers?" } });
      fireEvent.click(screen.getByRole("button", { name: /send message/i }));

      expect(screen.getByText("Can you help me with ticket transfers?")).toBeInTheDocument();

      // Close
      fireEvent.click(screen.getByRole("button", { name: /close chat/i }));
      expect(screen.queryByText("Can you help me with ticket transfers?")).not.toBeInTheDocument();

      // Reopen
      fireEvent.click(screen.getByRole("button", { name: /open ai support chat/i }));
      expect(screen.getByText("Can you help me with ticket transfers?")).toBeInTheDocument();
    });

    it("should toggle chat state and clear messages via store actions", () => {
      const store = useChatStore.getState();

      // Initially closed
      expect(useChatStore.getState().isOpen).toBe(false);

      // toggleChat opens it
      act(() => {
        store.toggleChat();
      });
      expect(useChatStore.getState().isOpen).toBe(true);

      // minimize then toggle restores it
      act(() => {
        store.minimizeChat();
      });
      expect(useChatStore.getState().isMinimized).toBe(true);
      act(() => {
        store.toggleChat();
      });
      expect(useChatStore.getState().isMinimized).toBe(false);

      // toggleChat when open closes it
      act(() => {
        store.toggleChat();
      });
      expect(useChatStore.getState().isOpen).toBe(false);

      // clearMessages
      act(() => {
        store.clearMessages();
      });
      expect(useChatStore.getState().messages).toEqual([]);
    });
  });

  describe("Message Input & Offline Indication", () => {
    it("should clearly indicate assistant is not connected yet and not fabricate fake AI replies", () => {
      render(<ChatWidget />);

      fireEvent.click(screen.getByRole("button", { name: /open ai support chat/i }));

      // Banner clearly warns assistant is offline
      expect(
        screen.getByText(
          /AI assistant is not connected yet. Live responses and booking actions are currently unavailable/i
        )
      ).toBeInTheDocument();

      // Initial message count
      const initialMessageCount = useChatStore.getState().messages.length;

      // Send a user question
      const input = screen.getByLabelText("chat message input");
      fireEvent.change(input, { target: { value: "Please refund my booking" } });
      fireEvent.click(screen.getByRole("button", { name: /send message/i }));

      // Only the user's message is added; no fake AI response or fake refund is fabricated
      const currentMessages = useChatStore.getState().messages;
      expect(currentMessages.length).toBe(initialMessageCount + 1);
      expect(currentMessages[currentMessages.length - 1].sender).toBe("user");
      expect(currentMessages[currentMessages.length - 1].text).toBe("Please refund my booking");
      expect(screen.queryByText(/Your refund has been processed/i)).not.toBeInTheDocument();
    });

    it("should handle Enter key submission and prevent sending empty messages", () => {
      render(<ChatWidget />);

      fireEvent.click(screen.getByRole("button", { name: /open ai support chat/i }));

      const input = screen.getByLabelText("chat message input");
      const sendBtn = screen.getByRole("button", { name: /send message/i });

      // Send button disabled when empty
      expect(sendBtn).toBeDisabled();

      // Whitespace only
      fireEvent.change(input, { target: { value: "   " } });
      expect(sendBtn).toBeDisabled();

      // Pressing enter with whitespace does not add message
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
      expect(useChatStore.getState().messages.length).toBe(1);

      // Valid text and Enter key
      fireEvent.change(input, { target: { value: "Hello Seatify" } });
      expect(sendBtn).toBeEnabled();
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

      expect(screen.getByText("Hello Seatify")).toBeInTheDocument();
      expect(input).toHaveValue("");
    });
  });

  describe("Manage Booking Integration & Order Context", () => {
    it("should display order context when opened with a booking", () => {
      const order = MOCK_ORDERS[0];

      act(() => {
        useChatStore.getState().openWithBooking(order);
      });

      render(<ChatWidget />);

      expect(screen.getByRole("region", { name: /ai support chat panel/i })).toBeInTheDocument();
      expect(screen.getByText(`Selected Booking: ${order.orderReference}`)).toBeInTheDocument();
      expect(screen.getByText(order.eventName)).toBeInTheDocument();
      expect(screen.getByText(`${order.venue}, ${order.city}`)).toBeInTheDocument();
      expect(screen.getByText(/2 tickets/i)).toBeInTheDocument();
      expect(screen.getByText(/tkt-2026-001-1, tkt-2026-001-2/i)).toBeInTheDocument();
      expect(screen.getByText(`€${order.totalAmount}`)).toBeInTheDocument();
    });

    it("should update order context if chat is already open and a different order is selected", () => {
      const order1 = MOCK_ORDERS[0];
      const order2 = MOCK_ORDERS[1];

      // Open with order 1
      act(() => {
        useChatStore.getState().openWithBooking(order1);
      });

      const { rerender } = render(<ChatWidget />);
      expect(screen.getByText(`Selected Booking: ${order1.orderReference}`)).toBeInTheDocument();

      // Update to order 2 while already open
      act(() => {
        useChatStore.getState().openWithBooking(order2);
      });

      rerender(<ChatWidget />);
      expect(screen.queryByText(`Selected Booking: ${order1.orderReference}`)).not.toBeInTheDocument();
      expect(screen.getByText(`Selected Booking: ${order2.orderReference}`)).toBeInTheDocument();
      expect(screen.getByText(order2.eventName)).toBeInTheDocument();
    });

    it("should allow clearing the active booking context while keeping chat open", () => {
      const order = MOCK_ORDERS[0];

      act(() => {
        useChatStore.getState().openWithBooking(order);
      });

      render(<ChatWidget />);
      expect(screen.getByText(`Selected Booking: ${order.orderReference}`)).toBeInTheDocument();

      const clearBtn = screen.getByRole("button", { name: /clear booking context/i });
      fireEvent.click(clearBtn);

      expect(screen.queryByText(`Selected Booking: ${order.orderReference}`)).not.toBeInTheDocument();
      expect(useChatStore.getState().activeBooking).toBeNull();
      expect(screen.getByRole("region", { name: /ai support chat panel/i })).toBeInTheDocument();
    });

    it("should show order reference badge in minimized state when booking is active", () => {
      const order = MOCK_ORDERS[0];

      act(() => {
        useChatStore.getState().openWithBooking(order);
        useChatStore.getState().minimizeChat();
      });

      render(<ChatWidget />);
      expect(screen.getByText(order.orderReference)).toBeInTheDocument();
    });
  });

  describe("Session Persistence Across Route Changes", () => {
    it("should preserve chat open state, messages, and booking context when routing changes in App", async () => {
      vi.spyOn(supabase.auth, "getSession").mockResolvedValue({
        data: { session: null },
        error: null,
      });
      vi.spyOn(supabase.auth, "onAuthStateChange").mockReturnValue({
        data: { subscription: { id: "1", callback: vi.fn(), unsubscribe: vi.fn() } },
      });

      // Start on Home route
      window.history.pushState({}, "", "/");

      render(<App />);

      // Open chat and send message
      fireEvent.click(screen.getByRole("button", { name: /open ai support chat/i }));
      const input = screen.getByLabelText("chat message input");
      fireEvent.change(input, { target: { value: "Persisting across route changes test" } });
      fireEvent.click(screen.getByRole("button", { name: /send message/i }));

      expect(screen.getByText("Persisting across route changes test")).toBeInTheDocument();

      // Associate with booking
      act(() => {
        useChatStore.getState().openWithBooking(MOCK_ORDERS[0]);
      });

      expect(screen.getByText(`Selected Booking: ${MOCK_ORDERS[0].orderReference}`)).toBeInTheDocument();

      // Change route to /checkout without unmounting App layout
      act(() => {
        navigation.navigate("/checkout");
      });

      // Verify the chat widget is STILL open, with the same message and booking context intact
      expect(screen.getByRole("region", { name: /ai support chat panel/i })).toBeInTheDocument();
      expect(screen.getByText("Persisting across route changes test")).toBeInTheDocument();
      expect(screen.getByText(`Selected Booking: ${MOCK_ORDERS[0].orderReference}`)).toBeInTheDocument();

      // Change route to /account
      act(() => {
        navigation.navigate("/account");
      });

      // Still open and preserved
      expect(screen.getByRole("region", { name: /ai support chat panel/i })).toBeInTheDocument();
      expect(screen.getByText("Persisting across route changes test")).toBeInTheDocument();
      expect(screen.getByText(`Selected Booking: ${MOCK_ORDERS[0].orderReference}`)).toBeInTheDocument();
    });
  });
});
