import { OrderTicketItem } from "./order";

export interface ChatMessage {
  id: string;
  sender: "user" | "system";
  text: string;
  timestamp: string;
}

export interface BookingChatContext {
  orderId: string;
  orderReference: string;
  eventName: string;
  eventDate: string;
  venue: string;
  city: string;
  totalAmount: number;
  currency: string;
  ticketCount: number;
  tickets: OrderTicketItem[];
}
