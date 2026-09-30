export type EventCategory =
  | "concerts"
  | "sports"
  | "theatre"
  | "festivals"
  | "other";

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  available: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  venue: string;
  city: string;
  imageUrl: string;
  ticketTypes: TicketType[];
  currency?: string;
  isFeatured?: boolean;
}
