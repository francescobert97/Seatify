import { Event } from "../types/event.js";
import { EventRepository } from "./eventRepository.js";
import { MOCK_EVENTS } from "../data/mockEvents.js";

export class MockEventRepository implements EventRepository {
  private events: Event[];

  constructor(initialEvents: Event[] = MOCK_EVENTS) {
    this.events = [...initialEvents];
  }

  async findAll(): Promise<Event[]> {
    return [...this.events];
  }

  async findById(id: string): Promise<Event | null> {
    const event = this.events.find((e) => e.id === id);
    return event ? { ...event } : null;
  }
}

