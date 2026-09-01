import { ReactNode } from "react";
import { EventCategory } from "./event";

export interface CategoryItem {
  id: string;
  name: string;
  slug: EventCategory;
  icon: ReactNode;
  description?: string;
  eventCount?: number;
}

