import React, { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  Paper,
  CardMedia,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import { useCartStore } from "../../store/cartStore";
import { Event } from "../../types/event";
import { MOCK_EVENTS } from "../../data/mockEvents";
import { useFetch } from "../../hooks/useFetch";
import { navigate } from "../../router/navigation";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const { items, updateQuantity, removeItem, clearCart, calculateTotal, getItemCount } =
    useCartStore();

  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const { execute } = useFetch<Event[]>();

  useEffect(() => {
    if (open) {
      void execute("/events").then((res) => {
        if (res && res.length > 0) {
          setEvents(res);
        }
      });
    }
  }, [open, execute]);

  const totalCount = getItemCount();
  const totalPrice = calculateTotal(events);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 420 },
          display: "flex",
          flexDirection: "column",
          p: 0,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ShoppingBagOutlinedIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Your Cart
          </Typography>
          <Typography
            variant="body2"
            sx={{
              bgcolor: "action.hover",
              px: 1,
              py: 0.25,
              borderRadius: 1.5,
              fontWeight: 700,
              fontSize: "0.8rem",
            }}
          >
            {totalCount} {totalCount === 1 ? "item" : "items"}
          </Typography>
        </Box>

        <IconButton onClick={onClose} aria-label="Close cart" size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Cart Content */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2.5 }}>
        {items.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "60vh",
              textAlign: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                bgcolor: "action.hover",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
              }}
            >
              <ShoppingBagOutlinedIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 260 }}>
              Looks like you haven't added any event tickets yet.
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                onClose();
                navigate("/");
              }}
              sx={{ mt: 1, textTransform: "none", fontWeight: 700, borderRadius: 2 }}
            >
              Browse Events
            </Button>
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {items.map((item) => {
              const event = events.find((e) => e.id === item.eventId);
              const ticket = event?.ticketTypes.find((t) => t.id === item.ticketTypeId);

              const title = event?.title || `Event #${item.eventId}`;
              const ticketName = ticket?.name || `Ticket #${item.ticketTypeId}`;
              const unitPrice = ticket?.price ?? 0;
              const subtotal = unitPrice * item.quantity;
              const maxAvailable = ticket?.available;
              const currency = event?.currency || "€";

              return (
                <Paper
                  key={`${item.eventId}-${item.ticketTypeId}`}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: "background.paper",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    {event?.imageUrl && (
                      <CardMedia
                        component="img"
                        image={event.imageUrl}
                        alt={title}
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 2,
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                    )}

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box sx={{ pr: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              lineHeight: 1.3,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={title}
                          >
                            {title}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.25, fontWeight: 500 }}
                          >
                            {ticketName}
                          </Typography>
                        </Box>

                        <Tooltip title="Remove item">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeItem(item.eventId, item.ticketTypeId)}
                            aria-label={`Remove ${ticketName}`}
                            sx={{ p: 0.5 }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* Price & Quantity Controls */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mt: 1.5,
                        }}
                      >
                        {/* Quantity Stepper */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1.5,
                            px: 0.25,
                            py: 0.1,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              updateQuantity(
                                item.eventId,
                                item.ticketTypeId,
                                item.quantity - 1,
                                maxAvailable
                              )
                            }
                            aria-label="Decrease quantity"
                            sx={{ p: 0.5 }}
                          >
                            <RemoveIcon sx={{ fontSize: "0.85rem" }} />
                          </IconButton>

                          <Typography
                            variant="body2"
                            sx={{
                              px: 1,
                              fontWeight: 700,
                              minWidth: 20,
                              textAlign: "center",
                            }}
                          >
                            {item.quantity}
                          </Typography>

                          <IconButton
                            size="small"
                            disabled={maxAvailable !== undefined && item.quantity >= maxAvailable}
                            onClick={() =>
                              updateQuantity(
                                item.eventId,
                                item.ticketTypeId,
                                item.quantity + 1,
                                maxAvailable
                              )
                            }
                            aria-label="Increase quantity"
                            sx={{ p: 0.5 }}
                          >
                            <AddIcon sx={{ fontSize: "0.85rem" }} />
                          </IconButton>
                        </Box>

                        {/* Unit price & Subtotal */}
                        <Box sx={{ textAlign: "right" }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                            {currency}{unitPrice} each
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary" }}>
                            Subtotal: {currency}{subtotal}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Footer / Summary */}
      {items.length > 0 && (
        <Box
          sx={{
            p: 2.5,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Subtotal
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              €{totalPrice}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              mb: 2.5,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Total
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main" }}>
              €{totalPrice}
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            {/* Visibly disabled Checkout button */}
            <Tooltip title="Checkout is currently disabled" arrow>
              <span>
                <Button
                  variant="contained"
                  fullWidth
                  disabled
                  sx={{
                    py: 1.25,
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                >
                  Proceed to Checkout
                </Button>
              </span>
            </Tooltip>

            {/* Clear Cart Button */}
            <Button
              variant="text"
              color="inherit"
              size="small"
              startIcon={<DeleteSweepOutlinedIcon />}
              onClick={clearCart}
              sx={{
                color: "text.secondary",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { color: "error.main", bgcolor: "transparent" },
              }}
            >
              Clear cart
            </Button>
          </Stack>
        </Box>
      )}
    </Drawer>
  );
};
