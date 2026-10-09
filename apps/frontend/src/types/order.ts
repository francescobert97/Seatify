export type OrderStatus = "confirmed" | "completed" | "cancelled";

export interface OrderTicketItem {
  id: string;
  ticketTypeId: string;
  name: string;
  price: number;
}

export interface Order {
  id: string;
  orderReference: string;
  purchaseDate: string; // ISO 8601 string
  status: OrderStatus;
  eventId: string;
  eventName: string;
  eventDate: string; // ISO 8601 string
  venue: string;
  city: string;
  imageUrl?: string;
  tickets: OrderTicketItem[];
  totalAmount: number;
  currency: string;
}
