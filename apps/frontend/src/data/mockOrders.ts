import { Order } from "../types/order";

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord-2026-001",
    orderReference: "STF-94821-2026",
    purchaseDate: "2026-08-20T14:32:00",
    status: "confirmed",
    eventId: "evt-1",
    eventName: "Taylor Swift | The Eras Tour",
    eventDate: "2026-09-12T19:30:00",
    venue: "Wembley Stadium",
    city: "London, UK",
    imageUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    tickets: [
      {
        id: "tkt-2026-001-1",
        ticketTypeId: "tt-1-1",
        name: "General Admission Standing",
        price: 85,
      },
      {
        id: "tkt-2026-001-2",
        ticketTypeId: "tt-1-1",
        name: "General Admission Standing",
        price: 85,
      },
    ],
    totalAmount: 170,
    currency: "€",
  },
  {
    id: "ord-2026-002",
    orderReference: "STF-78194-2026",
    purchaseDate: "2026-09-02T11:15:00",
    status: "confirmed",
    eventId: "evt-2",
    eventName: "UEFA Champions League Final",
    eventDate: "2026-10-04T21:00:00",
    venue: "Allianz Arena",
    city: "Munich, Germany",
    imageUrl:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    tickets: [
      {
        id: "tkt-2026-002-1",
        ticketTypeId: "tt-2-2",
        name: "Category 2 Longside",
        price: 240,
      },
    ],
    totalAmount: 240,
    currency: "€",
  },
  {
    id: "ord-2026-003",
    orderReference: "STF-62310-2026",
    purchaseDate: "2026-07-10T09:45:00",
    status: "completed",
    eventId: "evt-3",
    eventName: "Coldplay | Music of the Spheres World Tour",
    eventDate: "2026-08-01T20:00:00",
    venue: "Stadio Olimpico",
    city: "Rome, Italy",
    imageUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    tickets: [
      {
        id: "tkt-2026-003-1",
        ticketTypeId: "tt-3-1",
        name: "Prato Gold Standing",
        price: 110,
      },
      {
        id: "tkt-2026-003-2",
        ticketTypeId: "tt-3-1",
        name: "Prato Gold Standing",
        price: 110,
      },
    ],
    totalAmount: 220,
    currency: "€",
  },
  {
    id: "ord-2026-004",
    orderReference: "STF-41092-2026",
    purchaseDate: "2026-06-18T16:20:00",
    status: "cancelled",
    eventId: "evt-4",
    eventName: "Tomorrowland 2026",
    eventDate: "2026-07-24T12:00:00",
    venue: "De Schorre",
    city: "Boom, Belgium",
    imageUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
    tickets: [
      {
        id: "tkt-2026-004-1",
        ticketTypeId: "tt-4-1",
        name: "Full Madness Pass",
        price: 360,
      },
    ],
    totalAmount: 360,
    currency: "€",
  },
];

export const MOCK_DEFAULT_USER_PROFILE = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
};
