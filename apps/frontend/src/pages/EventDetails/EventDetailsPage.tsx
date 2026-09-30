import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { Event, TicketType } from "../../types/event";
import { formatEventDate } from "../../utils/date-formatter";
import { useCartStore } from "../../store/cartStore";
import { useFetch } from "../../hooks/useFetch";
import { MOCK_EVENTS } from "../../data/mockEvents";
import { navigate } from "../../router/navigation";

interface EventDetailsPageProps {
  eventId: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  concerts: { bg: "#EFF6FF", text: "#1D4ED8" },
  sports: { bg: "#ECFDF5", text: "#047857" },
  theatre: { bg: "#FAF5FF", text: "#7E22CE" },
  festivals: { bg: "#FFFBEB", text: "#B45309" },
  other: { bg: "#F1F5F9", text: "#475569" },
};

export const EventDetailsPage: React.FC<EventDetailsPageProps> = ({
  eventId,
}) => {
  const { isLoading, error, execute } = useFetch<Event>();
  const [event, setEvent] = useState<Event | null>(() => {
    return MOCK_EVENTS.find((e) => e.id === eventId) || null;
  });

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    // Attempt to fetch fresh event details from backend
    void execute(`/events/${eventId}`).then((res) => {
      if (res) {
        setEvent(res);
      } else {
        // Fallback to local mock data if available
        const fallback = MOCK_EVENTS.find((e) => e.id === eventId);
        if (fallback) {
          setEvent(fallback);
        }
      }
    });
  }, [eventId, execute]);

  // Initialize quantities to 1 for each ticket type when event loads
  useEffect(() => {
    if (event?.ticketTypes) {
      const initial: Record<string, number> = {};
      event.ticketTypes.forEach((ticket) => {
        initial[ticket.id] = ticket.available > 0 ? 1 : 0;
      });
      setQuantities(initial);
    }
  }, [event]);

  const handleQuantityChange = (ticket: TicketType, delta: number) => {
    setQuantities((prev) => {
      const current = prev[ticket.id] || (ticket.available > 0 ? 1 : 0);
      const updated = current + delta;
      const finalQuantity = Math.max(1, Math.min(updated, ticket.available));
      return { ...prev, [ticket.id]: finalQuantity };
    });
  };

  const handleAddToCart = (ticket: TicketType) => {
    if (!event) return;
    const qty = quantities[ticket.id] || 1;
    if (qty <= 0 || ticket.available <= 0) return;

    addItem(event.id, ticket.id, qty, ticket.available);
    setSnackbarMessage(
      `Added ${qty} ${qty === 1 ? "ticket" : "tickets"} (${ticket.name}) to cart!`
    );
    setSnackbarOpen(true);
  };

  if (isLoading && !event) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <Container sx={{ py: 12, textAlign: "center", flexGrow: 1 }}>
          <CircularProgress size={48} />
          <Typography sx={{ mt: 2 }} color="text.secondary">
            Loading event details...
          </Typography>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <Container sx={{ py: 10, textAlign: "center", flexGrow: 1 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
            Event Not Found
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 3, maxWidth: 500, mx: "auto" }}>
              Event not found or failed to load.
            </Alert>
          )}
          <Button
            startIcon={<ArrowBackIcon />}
            variant="contained"
            onClick={() => navigate("/")}
          >
            Back to events
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  const categoryStyle =
    CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <Navbar />

      <Box component="main" sx={{ flexGrow: 1, py: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">
          {/* Navigation Back Link */}
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/")}
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { color: "primary.main", bgcolor: "transparent" },
              }}
            >
              Back to events
            </Button>
          </Box>

          <Grid container spacing={4}>
            {/* Left Column: Image, Header & Description */}
            <Grid item xs={12} md={7}>
              {/* Event Image */}
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 3,
                  overflow: "hidden",
                  width: "100%",
                  height: { xs: 260, sm: 380 },
                  mb: 3,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                }}
              >
                <Box
                  component="img"
                  src={event.imageUrl}
                  alt={event.title}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    zIndex: 1,
                  }}
                >
                  <Chip
                    label={event.category.toUpperCase()}
                    sx={{
                      bgcolor: categoryStyle.bg,
                      color: categoryStyle.text,
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      borderRadius: 1.5,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  />
                </Box>
              </Box>

              {/* Event Title & Meta */}
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                  letterSpacing: "-0.02em",
                  mb: 2,
                  fontSize: { xs: "1.75rem", md: "2.25rem" },
                }}
              >
                {event.title}
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 1.5, sm: 3 }}
                sx={{ mb: 4, color: "text.secondary" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarTodayOutlinedIcon
                    sx={{ fontSize: "1.1rem", color: "primary.main" }}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatEventDate(event.date)}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOnOutlinedIcon
                    sx={{ fontSize: "1.1rem", color: "primary.main" }}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {event.venue}, {event.city}
                  </Typography>
                </Box>
              </Stack>

              {/* Full Description */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                  About this event
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.8, whiteSpace: "pre-line" }}
                >
                  {event.description}
                </Typography>
              </Paper>
            </Grid>

            {/* Right Column: Ticket Selection */}
            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3 },
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  position: { md: "sticky" },
                  top: { md: 96 },
                }}
              >
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{ fontWeight: 800, mb: 0.5 }}
                >
                  Select Tickets
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Choose your preferred ticket type and quantity
                </Typography>

                <Stack spacing={2.5}>
                  {event.ticketTypes.map((ticket) => {
                    const qty = quantities[ticket.id] || 1;
                    const isSoldOut = ticket.available <= 0;

                    return (
                      <Card
                        key={ticket.id}
                        variant="outlined"
                        sx={{
                          borderRadius: 2.5,
                          borderColor:
                            qty > 0 && !isSoldOut ? "primary.main" : "divider",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 1,
                            }}
                          >
                            <Box sx={{ pr: 1 }}>
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 700, lineHeight: 1.2 }}
                              >
                                {ticket.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "inline-block",
                                  mt: 0.5,
                                  color: isSoldOut ? "error.main" : "text.secondary",
                                  fontWeight: isSoldOut ? 700 : 500,
                                }}
                              >
                                {isSoldOut
                                  ? "Sold out"
                                  : `${ticket.available} tickets available`}
                              </Typography>
                            </Box>

                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 800,
                                color: "primary.main",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {event.currency || "€"}
                              {ticket.price}
                            </Typography>
                          </Box>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2, fontSize: "0.85rem" }}
                          >
                            {ticket.description}
                          </Typography>

                          <Divider sx={{ mb: 2 }} />

                          {/* Quantity Selector & Add to Cart Action */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1.5,
                            }}
                          >
                            {/* Quantity Controls */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 2,
                                px: 0.5,
                                py: 0.25,
                              }}
                            >
                              <IconButton
                                size="small"
                                disabled={isSoldOut || qty <= 1}
                                onClick={() => handleQuantityChange(ticket, -1)}
                                aria-label={`Decrease quantity of ${ticket.name}`}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>

                              <Typography
                                data-testid={`quantity-${ticket.id}`}
                                sx={{
                                  px: 1.5,
                                  fontWeight: 700,
                                  minWidth: 28,
                                  textAlign: "center",
                                  userSelect: "none",
                                }}
                              >
                                {qty}
                              </Typography>

                              <IconButton
                                size="small"
                                disabled={isSoldOut || qty >= ticket.available}
                                onClick={() => handleQuantityChange(ticket, 1)}
                                aria-label={`Increase quantity of ${ticket.name}`}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            {/* Add to Cart Button */}
                            <Button
                              variant="contained"
                              disabled={isSoldOut}
                              startIcon={<ShoppingCartOutlinedIcon />}
                              onClick={() => handleAddToCart(ticket)}
                              sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                borderRadius: 2,
                                px: 2,
                                py: 0.85,
                                flexGrow: 1,
                                boxShadow: "none",
                              }}
                            >
                              {isSoldOut ? "Sold Out" : "Add to cart"}
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Snackbar notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          icon={<CheckCircleOutlineIcon fontSize="inherit" />}
          sx={{ width: "100%", borderRadius: 2, fontWeight: 600 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Footer />
    </Box>
  );
};
