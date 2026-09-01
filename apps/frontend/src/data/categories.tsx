import MusicNoteOutlinedIcon from "@mui/icons-material/MusicNoteOutlined";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import TheaterComedyOutlinedIcon from "@mui/icons-material/TheaterComedyOutlined";
import CelebrationOutlinedIcon from "@mui/icons-material/CelebrationOutlined";
import LocalActivityOutlinedIcon from "@mui/icons-material/LocalActivityOutlined";
import { CategoryItem } from "../types/category";

export const CATEGORIES: CategoryItem[] = [
  {
    id: "cat-1",
    name: "Concerts",
    slug: "concerts",
    icon: <MusicNoteOutlinedIcon fontSize="large" />,
    description: "Live music, world tours, and acoustic sessions",
    eventCount: 142,
  },
  {
    id: "cat-2",
    name: "Sports",
    slug: "sports",
    icon: <SportsSoccerOutlinedIcon fontSize="large" />,
    description: "Football, basketball, motorsports, and matches",
    eventCount: 88,
  },
  {
    id: "cat-3",
    name: "Theatre",
    slug: "theatre",
    icon: <TheaterComedyOutlinedIcon fontSize="large" />,
    description: "Musicals, comedy shows, and stage plays",
    eventCount: 54,
  },
  {
    id: "cat-4",
    name: "Festivals",
    slug: "festivals",
    icon: <CelebrationOutlinedIcon fontSize="large" />,
    description: "Multi-day open air music and arts festivals",
    eventCount: 29,
  },
  {
    id: "cat-5",
    name: "Other",
    slug: "other",
    icon: <LocalActivityOutlinedIcon fontSize="large" />,
    description: "Conferences, exhibitions, and special events",
    eventCount: 37,
  },
];
