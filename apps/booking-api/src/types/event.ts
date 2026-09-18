export type EventCategory =
  | "concerts"
  | "sports"
  | "theatre"
  | "festivals"
  | "other";

export interface Event {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  venue: string;
  city: string;
  imageUrl: string;
  priceStartingFrom: number;
  currency?: string;
  isFeatured?: boolean;
}

