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

export const getStartingPrice = (event: Event): number => {
  if (!event.ticketTypes || event.ticketTypes.length === 0) {
    return 0;
  }
  return Math.min(...event.ticketTypes.map((t) => t.price));
};
