import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { Event } from "../../types/event";

interface EventCardProps {
  event: Event;
  onClick?: (event: Event) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  concerts: { bg: "#EFF6FF", text: "#1D4ED8" },
  sports: { bg: "#ECFDF5", text: "#047857" },
  theatre: { bg: "#FAF5FF", text: "#7E22CE" },
  festivals: { bg: "#FFFBEB", text: "#B45309" },
  other: { bg: "#F1F5F9", text: "#475569" },
};

export const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const categoryStyle = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other;

  return (
    <Card
      elevation={0}
      onClick={() => onClick?.(event)}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.25s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
          borderColor: "primary.light",
          "& .event-card-img": {
            transform: "scale(1.04)",
          },
        },
      }}
    >
      {/* Event Image & Badge */}
      <Box sx={{ position: "relative", overflow: "hidden", paddingTop: "56.25%" /* 16:9 */ }}>
        <CardMedia
          component="img"
          image={event.imageUrl}
          alt={event.title}
          className="event-card-img"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease-in-out",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 1,
          }}
        >
          <Chip
            label={event.category.toUpperCase()}
            size="small"
            sx={{
              bgcolor: categoryStyle.bg,
              color: categoryStyle.text,
              fontWeight: 700,
              fontSize: "0.7rem",
              letterSpacing: "0.04em",
              borderRadius: 1.5,
              backdropFilter: "blur(4px)",
            }}
          />
        </Box>
      </Box>

      {/* Event Details */}
      <CardContent
        sx={{
          p: 2.5,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 700,
              fontSize: "1.1rem",
              lineHeight: 1.35,
              color: "text.primary",
              mb: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.7rem",
            }}
          >
            {event.title}
          </Typography>

          <Stack spacing={1} sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
              <CalendarTodayOutlinedIcon sx={{ fontSize: "0.95rem", color: "primary.main" }} />
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                {event.date}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
              <LocationOnOutlinedIcon sx={{ fontSize: "0.95rem", color: "text.secondary" }} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 400,
                  fontSize: "0.85rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {event.venue}, {event.city}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Pricing Footer */}
        <Box
          sx={{
            pt: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
            Starting from
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              fontSize: "1.05rem",
            }}
          >
            {event.currency || "€"}{event.priceStartingFrom}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

