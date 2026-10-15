export type OrderStatus =
  | "pending" // Awaiting initial payment completion
  | "completed" // Successfully paid and confirmed (tickets active)
  | "refund_requested" // Refund requested by user (under review)
  | "refunded" // Refund processed, tickets voided
  | "canceled"; // Payment failed, abandoned checkout, or voided before payment

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

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending Payment",
  completed: "Completed",
  refund_requested: "Refund Requested",
  refunded: "Refunded",
  canceled: "Canceled",
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
  return ORDER_STATUS_LABELS[status] || status;
};

export function isActiveBooking(order: Order, referenceDate: Date = new Date()): boolean {
  return order.status === "completed" && new Date(order.eventDate) >= referenceDate;
}

export function isPastBooking(order: Order, referenceDate: Date = new Date()): boolean {
  return order.status === "completed" && new Date(order.eventDate) < referenceDate;
}
