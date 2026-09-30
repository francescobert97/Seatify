import { Event } from "../types/event";

export const MOCK_EVENTS: Event[] = [
  {
    id: "evt-1",
    title: "Taylor Swift | The Eras Tour",
    description:
      "Experience Taylor Swift's record-breaking Eras Tour live at Wembley Stadium. Spanning 18 years of music and 10 iconic albums, this unforgettable three-hour extravaganza features stunning visuals, state-of-the-art staging, and mesmerizing acoustic surprise songs in front of 90,000 fans.",
    category: "concerts",
    date: "2026-09-12T19:30:00",
    venue: "Wembley Stadium",
    city: "London, UK",
    imageUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    ticketTypes: [
      {
        id: "tt-1-1",
        name: "General Admission Standing",
        description: "Pitch standing access with front-stage viewing area.",
        price: 85,
        available: 50,
      },
      {
        id: "tt-1-2",
        name: "Reserved Seated Tier 1",
        description: "Lower tier prime reserved seating with optimal stage sightlines.",
        price: 135,
        available: 30,
      },
      {
        id: "tt-1-3",
        name: "VIP Karma Package",
        description:
          "Early venue entry, exclusive VIP tour laminate, and commemorative merchandise package.",
        price: 295,
        available: 10,
      },
    ],
    currency: "€",
    isFeatured: true,
  },
  {
    id: "evt-2",
    title: "UEFA Champions League Final",
    description:
      "The pinnacle of European club football returns to Munich. Witness the continent's two best teams battle for supreme continental glory in an electrifying atmosphere under the Allianz Arena floodlights.",
    category: "sports",
    date: "2026-10-04T21:00:00",
    venue: "Allianz Arena",
    city: "Munich, Germany",
    imageUrl:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    ticketTypes: [
      {
        id: "tt-2-1",
        name: "Category 3 Upper Tier",
        description: "Upper tier panoramic seating behind the goals.",
        price: 120,
        available: 25,
      },
      {
        id: "tt-2-2",
        name: "Category 2 Longside",
        description: "Mid-tier sideline seating with comprehensive pitch perspective.",
        price: 240,
        available: 15,
      },
      {
        id: "tt-2-3",
        name: "Category 1 Central Club",
        description: "Prime lower tier sideline seats with lounge and hospitality access.",
        price: 450,
        available: 8,
      },
    ],
    currency: "€",
    isFeatured: true,
  },
  {
    id: "evt-3",
    title: "The Phantom of the Opera",
    description:
      "Andrew Lloyd Webber's timeless and romantic masterpiece mesmerizes audiences at London's historic His Majesty's Theatre. Marvel at the dramatic chandelier drop, haunting musical numbers, and stunning period costumes.",
    category: "theatre",
    date: "2026-09-18T20:00:00",
    venue: "His Majesty's Theatre",
    city: "London, UK",
    imageUrl:
      "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80",
    ticketTypes: [
      {
        id: "tt-3-1",
        name: "Balcony Restricted View",
        description: "Upper level balcony seating offering great acoustic experience.",
        price: 45,
        available: 20,
      },
      {
        id: "tt-3-2",
        name: "Royal Circle Premium",
        description: "First elevated tier with clear central stage views.",
        price: 95,
        available: 18,
      },
      {
        id: "tt-3-3",
        name: "Stalls Orchestra Front",
        description: "Ground level seats in rows D-K for immersive close-up stage intimacy.",
        price: 130,
        available: 12,
      },
    ],
    currency: "€",
  },
  {
    id: "evt-4",
    title: "Tomorrowland 2026: The Elixir of Life",
    description:
      "Step into the magical realm of Tomorrowland in Boom, Belgium. Uniting hundreds of thousands of electronic music lovers from over 200 nations, this edition showcases legendary DJs across 16 fantastical stages surrounded by fairy-tale natural landscapes.",
    category: "festivals",
    date: "2026-07-26T14:00:00",
    venue: "De Schorre Park",
    city: "Boom, Belgium",
    imageUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    ticketTypes: [
      {
        id: "tt-4-1",
        name: "Full Madness Pass (General)",
        description: "Weekend festival grounds access with entrance to all regular stages.",
        price: 175,
        available: 40,
      },
      {
        id: "tt-4-2",
        name: "Full Madness Comfort (VIP)",
        description:
          "Access to dedicated VIP decks, premium beverage bars, and fast-track entrance.",
        price: 340,
        available: 15,
      },
      {
        id: "tt-4-3",
        name: "Magnificent Greens Camping Package",
        description:
          "Weekend pass combined with DreamVille camping access and exclusive morning events.",
        price: 420,
        available: 8,
      },
    ],
    currency: "€",
    isFeatured: true,
  },
  {
    id: "evt-5",
    title: "Hans Zimmer Live World Tour",
    description:
      "Multiple Academy Award-winning composer Hans Zimmer performs his most breathtaking cinematic suites live with a symphonic orchestra, dynamic choir, and rock band. Experience sweeping themes from Gladiator, Inception, Interstellar, The Dark Knight, and Dune.",
    category: "concerts",
    date: "2026-11-15T20:30:00",
    venue: "Accor Arena",
    city: "Paris, France",
    imageUrl:
      "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
    ticketTypes: [
      {
        id: "tt-5-1",
        name: "Grand Stand Tier 2",
        description: "Standard elevated arena seating with wide acoustic soundstage.",
        price: 65,
        available: 35,
      },
      {
        id: "tt-5-2",
        name: "Lower Bowl Premium",
        description: "Lower bowl seating close to the orchestra conductor and choir.",
        price: 110,
        available: 22,
      },
      {
        id: "tt-5-3",
        name: "Floor Platinum",
        description:
          "Front rows on the arena floor with crystal-clear direct sound and VIP gift bag.",
        price: 180,
        available: 10,
      },
    ],
    currency: "€",
  },
  {
    id: "evt-6",
    title: "NBA Global Games: Paris Match",
    description:
      "World-class professional basketball lands in the French capital as two premier NBA franchises go head-to-head in a regular-season clash. Experience NBA entertainment, mascot stunts, celebrity appearances, and rim-rocking action live in Paris.",
    category: "sports",
    date: "2027-01-21T20:00:00",
    venue: "Accor Arena",
    city: "Paris, France",
    imageUrl:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
    ticketTypes: [
      {
        id: "tt-6-1",
        name: "Upper Level Standard",
        description: "Upper bowl tier seating with unobstructed court view.",
        price: 95,
        available: 28,
      },
      {
        id: "tt-6-2",
        name: "Lower Bowl Sideline",
        description: "Lower bowl seats close to the team benches.",
        price: 190,
        available: 16,
      },
      {
        id: "tt-6-3",
        name: "Courtside Row 2 VIP",
        description:
          "Exclusive second-row courtside seats with pre-game shootaround access and hospitality lounge.",
        price: 550,
        available: 4,
      },
    ],
    currency: "€",
  },
];
