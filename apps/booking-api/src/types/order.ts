export type OrderStatus =
  | "pending"          // Awaiting initial payment completion
  | "completed"        // Successfully paid and confirmed; tickets active
  | "refund_requested" // Refund requested by user; under review
  | "refunded"          // Refund processed; tickets voided
  | "canceled";         // Order canceled

export const VALID_ORDER_STATUSES: readonly OrderStatus[] = [
  "pending",
  "completed",
  "refund_requested",
  "refunded",
  "canceled",
] as const;

export function isValidOrderStatus(status: unknown): status is OrderStatus {
  return typeof status === "string" && VALID_ORDER_STATUSES.includes(status as OrderStatus);
}

export interface OrderTicketItem {
  id: string;
  ticketTypeId: string;
  name: string;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  orderReference: string;
  purchaseDate: string; // ISO 8601 string
  status: OrderStatus;
  eventId: string;
  eventName: string;
  eventDate: string; // ISO 8601 string
  venue: string;
  city: string;
  imageUrl?: string | null;
  tickets: OrderTicketItem[];
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Database schema row for orders table in PostgreSQL (snake_case)
 */
export interface OrderDbRow {
  id: string;
  user_id: string;
  order_reference: string;
  purchase_date: string;
  status: OrderStatus;
  event_id: string;
  event_name: string;
  event_date: string;
  venue: string;
  city: string;
  image_url: string | null;
  tickets: OrderTicketItem[];
  total_amount: number | string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderTicketInput {
  ticketTypeId: string;
  quantity?: number;
}

export interface CreateOrderBody {
  eventId: string;
  tickets: CreateOrderTicketInput[];
}

/**
 * Maps PostgreSQL snake_case order row to TypeScript camelCase Order interface
 */
export function mapOrderDbToOrder(row: OrderDbRow): Order {
  return {
    id: row.id,
    userId: row.user_id,
    orderReference: row.order_reference,
    purchaseDate: row.purchase_date,
    status: row.status,
    eventId: row.event_id,
    eventName: row.event_name,
    eventDate: row.event_date,
    venue: row.venue,
    city: row.city,
    imageUrl: row.image_url,
    tickets: Array.isArray(row.tickets) ? row.tickets : [],
    totalAmount:
      typeof row.total_amount === "string"
        ? parseFloat(row.total_amount)
        : Number(row.total_amount),
    currency: row.currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
