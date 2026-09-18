import { Event } from "../types/event.js";

export interface EventRepository {
  findAll(): Promise<Event[]>;
  findById(id: string): Promise<Event | null>;
}

