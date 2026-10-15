import { create } from "zustand";
import { ChatMessage, BookingChatContext } from "../types/chat";
import { Order } from "../types/order";

export interface ChatStore {
  isOpen: boolean;
  isMinimized: boolean;
  activeBooking: BookingChatContext | null;
  messages: ChatMessage[];
  inputValue: string;

  openChat: () => void;
  closeChat: () => void;
  minimizeChat: () => void;
  restoreChat: () => void;
  toggleChat: () => void;
  openWithBooking: (order: Order) => void;
  clearBookingContext: () => void;
  sendMessage: (text: string) => void;
  setInputValue: (value: string) => void;
  clearMessages: () => void;
  reset: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-init-welcome",
    sender: "system",
    text: "Welcome to Seatify AI Support! How can we assist you today?",
    timestamp: new Date().toISOString(),
  },
];

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  isMinimized: false,
  activeBooking: null,
  messages: INITIAL_MESSAGES,
  inputValue: "",

  openChat: () =>
    set({
      isOpen: true,
      isMinimized: false,
    }),

  closeChat: () =>
    set({
      isOpen: false,
      isMinimized: false,
    }),

  minimizeChat: () =>
    set({
      isMinimized: true,
    }),

  restoreChat: () =>
    set({
      isOpen: true,
      isMinimized: false,
    }),

  toggleChat: () =>
    set((state) => {
      if (!state.isOpen) {
        return { isOpen: true, isMinimized: false };
      }
      if (state.isMinimized) {
        return { isMinimized: false };
      }
      return { isOpen: false };
    }),

  openWithBooking: (order: Order) =>
    set({
      isOpen: true,
      isMinimized: false,
      activeBooking: {
        orderId: order.id,
        orderReference: order.orderReference,
        eventName: order.eventName,
        eventDate: order.eventDate,
        venue: order.venue,
        city: order.city,
        totalAmount: order.totalAmount,
        currency: order.currency,
        ticketCount: order.tickets.length,
        tickets: order.tickets,
      },
    }),

  clearBookingContext: () =>
    set({
      activeBooking: null,
    }),

  sendMessage: (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sender: "user",
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      inputValue: "",
    }));
  },

  setInputValue: (value: string) =>
    set({
      inputValue: value,
    }),

  clearMessages: () =>
    set({
      messages: [],
    }),

  reset: () =>
    set({
      isOpen: false,
      isMinimized: false,
      activeBooking: null,
      messages: INITIAL_MESSAGES,
      inputValue: "",
    }),
}));
