import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Event } from "../types/event";

export interface CartItem {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
}

export interface CartStore {
  items: CartItem[];
  addItem: (
    eventId: string,
    ticketTypeId: string,
    quantity?: number,
    maxAvailable?: number
  ) => void;
  removeItem: (eventId: string, ticketTypeId: string) => void;
  updateQuantity: (
    eventId: string,
    ticketTypeId: string,
    quantity: number,
    maxAvailable?: number
  ) => void;
  clearCart: () => void;
  getItemCount: () => number;
  calculateTotal: (events: Event[]) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (
        eventId: string,
        ticketTypeId: string,
        quantity: number = 1,
        maxAvailable?: number
      ) => {
        if (quantity <= 0) return;

        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.eventId === eventId && item.ticketTypeId === ticketTypeId
          );

          if (existingIndex > -1) {
            const currentItem = state.items[existingIndex];
            const desiredQuantity = currentItem.quantity + quantity;
            const finalQuantity =
              maxAvailable !== undefined
                ? Math.min(desiredQuantity, maxAvailable)
                : desiredQuantity;

            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...currentItem,
              quantity: finalQuantity,
            };

            return { items: updatedItems };
          }

          const finalQuantity =
            maxAvailable !== undefined
              ? Math.min(quantity, maxAvailable)
              : quantity;

          if (finalQuantity <= 0) {
            return state;
          }

          return {
            items: [
              ...state.items,
              { eventId, ticketTypeId, quantity: finalQuantity },
            ],
          };
        });
      },

      removeItem: (eventId: string, ticketTypeId: string) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.eventId === eventId && item.ticketTypeId === ticketTypeId)
          ),
        }));
      },

      updateQuantity: (
        eventId: string,
        ticketTypeId: string,
        quantity: number,
        maxAvailable?: number
      ) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (item) =>
                  !(
                    item.eventId === eventId &&
                    item.ticketTypeId === ticketTypeId
                  )
              ),
            };
          }

          const finalQuantity =
            maxAvailable !== undefined
              ? Math.min(quantity, maxAvailable)
              : quantity;

          return {
            items: state.items.map((item) =>
              item.eventId === eventId && item.ticketTypeId === ticketTypeId
                ? { ...item, quantity: finalQuantity }
                : item
            ),
          };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      calculateTotal: (events: Event[]) => {
        return get().items.reduce((total, item) => {
          const event = events.find((e) => e.id === item.eventId);
          if (!event) return total;
          const ticket = event.ticketTypes.find(
            (t) => t.id === item.ticketTypeId
          );
          if (!ticket) return total;
          return total + ticket.price * item.quantity;
        }, 0);
      },
    }),
    {
      name: "seatlify-cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

