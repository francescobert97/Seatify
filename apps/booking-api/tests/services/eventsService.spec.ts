import { describe, it, expect } from "vitest";
import { EventsService } from "../../src/services/eventsService.js";
import { MockEventRepository } from "../../src/repositories/mockEventRepository.js";
import { Event } from "../../src/types/event.js";

describe("EventsService", () => {
  const mockEvents: Event[] = [
    {
      id: "past-evt",
      title: "Past Show",
      category: "theatre",
      date: "2025-01-10T20:00:00",
      venue: "Old Theatre",
      city: "London",
      imageUrl: "https://example.com/past.jpg",
      priceStartingFrom: 30,
    },
    {
      id: "future-evt-1",
      title: "Future Concert",
      category: "concerts",
      date: "2026-09-12T19:30:00",
      venue: "Wembley Stadium",
      city: "London",
      imageUrl: "https://example.com/future1.jpg",
      priceStartingFrom: 85,
    },
    {
      id: "future-evt-2",
      title: "Summer Festival",
      category: "festivals",
      date: "2026-07-26T14:00:00",
      venue: "Festival Park",
      city: "Boom",
      imageUrl: "https://example.com/range.jpg",
      priceStartingFrom: 150,
    },
    {
      id: "unparseable-evt",
      title: "Mystery Event",
      category: "other",
      date: "To be announced",
      venue: "TBA",
      city: "Rome",
      imageUrl: "https://example.com/mystery.jpg",
      priceStartingFrom: 10,
    },
  ];

  it("should return only active events relative to reference date", async () => {
    const repo = new MockEventRepository(mockEvents);
    const service = new EventsService(repo);

    // Reference date set to mid 2026 (after past-evt, before future events)
    const referenceDate = new Date("2026-06-01T00:00:00Z");
    const activeEvents = await service.getActiveEvents(referenceDate);

    const activeIds = activeEvents.map((e) => e.id);
    expect(activeIds).toContain("future-evt-1");
    expect(activeIds).toContain("future-evt-2");
    expect(activeIds).toContain("unparseable-evt"); // unparseable kept as active
    expect(activeIds).not.toContain("past-evt");
  });

  it("should return empty array when all events are in the past", async () => {
    const datedOnlyRepo = new MockEventRepository(mockEvents.slice(0, 3));
    const datedOnlyService = new EventsService(datedOnlyRepo);

    const farFutureDate = new Date("2030-01-01T00:00:00Z");
    const activeEvents = await datedOnlyService.getActiveEvents(farFutureDate);
    expect(activeEvents).toEqual([]);
  });

  it("should retrieve event by id", async () => {
    const repo = new MockEventRepository(mockEvents);
    const service = new EventsService(repo);

    const event = await service.getEventById("future-evt-1");
    expect(event).not.toBeNull();
    expect(event?.title).toBe("Future Concert");

    const nonExistent = await service.getEventById("does-not-exist");
    expect(nonExistent).toBeNull();
  });

  it("should correctly identify an unparseable date as active", () => {
    const repo = new MockEventRepository([]);
    const service = new EventsService(repo);

    const unparseable: Event = {
      id: "tba",
      title: "TBA",
      category: "other",
      date: "To be announced",
      venue: "TBA",
      city: "TBA",
      imageUrl: "",
      priceStartingFrom: 0,
    };
    expect(service.isEventActive(unparseable, new Date("2030-01-01"))).toBe(true);
  });

  it("should correctly identify a past ISO date as inactive", () => {
    const repo = new MockEventRepository([]);
    const service = new EventsService(repo);

    const past: Event = {
      id: "past",
      title: "Past",
      category: "other",
      date: "2020-01-01T00:00:00",
      venue: "V",
      city: "C",
      imageUrl: "",
      priceStartingFrom: 0,
    };
    expect(service.isEventActive(past, new Date("2026-01-01"))).toBe(false);
  });
});
