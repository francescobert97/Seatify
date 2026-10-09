import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  Stack,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { useCartStore } from "../../store/cartStore";
import { useFetch } from "../../hooks/useFetch";
import { MOCK_EVENTS } from "../../data/mockEvents";
import { Event } from "../../types/event";
import { httpClient } from "../../services/httpClient";
import { navigate } from "../../router/navigation";

export interface PaymentSuccessData {
  paymentId: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
}

export interface PaymentResponse {
  message: string;
  payment: PaymentSuccessData;
}

export interface MockPaymentFormProps {
  totalAmount: number;
  currency: string;
  isProcessing: boolean;
  errorMessage: string | null;
  onConfirmPayment: () => void;
}

/**
 * Temporary MockPaymentForm component.
 * Architecture Note: CheckoutPage is permanent; this component represents the temporary
 * payment UI and can be replaced with StripePaymentForm in the future without modifying
 * the order summary or checkout workflow.
 */
export const MockPaymentForm: React.FC<MockPaymentFormProps> = ({
  totalAmount,
  currency,
  isProcessing,
  errorMessage,
  onConfirmPayment,
}) => {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <LockOutlinedIcon fontSize="small" color="primary" />
        Payment
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Complete your order securely. Click below to confirm and process your payment.
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Button
        variant="contained"
        fullWidth
        size="large"
        disabled={isProcessing}
        onClick={onConfirmPayment}
        sx={{
          py: 1.5,
          fontWeight: 700,
          fontSize: "1rem",
          borderRadius: 2,
          textTransform: "none",
        }}
      >
        {isProcessing ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          `Confirm & Pay ${currency}${totalAmount}`
        )}
      </Button>
    </Card>
  );
};

export const CheckoutPage: React.FC = () => {
  const { items, calculateTotal, clearCart } = useCartStore();
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const { execute } = useFetch<Event[]>();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentSuccessData | null>(null);

  useEffect(() => {
    void execute("/events").then((res) => {
      if (res && res.length > 0) {
        setEvents(res);
      }
    });
  }, [execute]);

  const totalPrice = calculateTotal(events);

  const handleConfirmPayment = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await httpClient.post<PaymentResponse>("/api/payments", {
        items: items.map((item) => ({
          eventId: item.eventId,
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
        })),
        currency: "EUR",
      });

      if (response && response.payment) {
        setPaymentSuccess(response.payment);
        clearCart();
      } else {
        throw new Error("Invalid response from payment provider");
      }
    } catch (err: unknown) {
      const errorText =
        err instanceof Error ? err.message : "Failed to process payment. Please try again.";
      setErrorMessage(errorText);
    } finally {
      setIsProcessing(false);
    }
  };

  // 1. Success confirmation state
  if (paymentSuccess) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#FAFAFA" }}>
        <Navbar />
        <Container maxWidth="sm" sx={{ py: 10, textAlign: "center", flexGrow: 1 }}>
          <Paper
            elevation={0}
            sx={{
              p: 5,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 72, mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Thank you for your purchase. Your tickets have been confirmed.
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Stack spacing={1.5} sx={{ textAlign: "left", mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Payment Reference:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {paymentSuccess.paymentId}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "success.main" }}>
                  {paymentSuccess.status.toUpperCase()}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => navigate("/")}
              sx={{
                py: 1.25,
                fontWeight: 700,
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              Back to Events
            </Button>
          </Paper>
        </Container>
        <Footer />
      </Box>
    );
  }

  // 2. Empty cart state
  if (items.length === 0) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#FAFAFA" }}>
        <Navbar />
        <Container maxWidth="sm" sx={{ py: 12, textAlign: "center", flexGrow: 1 }}>
          <Paper
            elevation={0}
            sx={{
              p: 5,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <ShoppingBagOutlinedIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You don&apos;t have any tickets in your cart to checkout.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/")}
              sx={{
                fontWeight: 700,
                borderRadius: 2,
                textTransform: "none",
                px: 3,
              }}
            >
              Browse Events
            </Button>
          </Paper>
        </Container>
        <Footer />
      </Box>
    );
  }

  // 3. Checkout review & payment view
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#FAFAFA" }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 6, flexGrow: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{
            mb: 3,
            color: "text.secondary",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": { color: "primary.main" },
          }}
        >
          Back to Events
        </Button>

        <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
          Checkout
        </Typography>

        <Grid container spacing={4}>
          {/* Order Summary Column */}
          <Grid item xs={12} md={7}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                p: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
                Order Summary
              </Typography>

              <Stack spacing={2} divider={<Divider />}>
                {items.map((item) => {
                  const event = events.find((e) => e.id === item.eventId);
                  const ticket = event?.ticketTypes.find((t) => t.id === item.ticketTypeId);

                  const title = event ? event.title : item.eventId;
                  const ticketName = ticket ? ticket.name : item.ticketTypeId;
                  const unitPrice = ticket ? ticket.price : 0;
                  const itemSubtotal = unitPrice * item.quantity;
                  const currency = event?.currency || "€";

                  return (
                    <Box
                      key={`${item.eventId}-${item.ticketTypeId}`}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        py: 0.5,
                      }}
                    >
                      <Box sx={{ pr: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          {ticketName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          Qty: {item.quantity} × {currency}{unitPrice}
                        </Typography>
                      </Box>

                      <Typography variant="subtitle2" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                        {currency}{itemSubtotal}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Total
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main" }}>
                  €{totalPrice}
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Payment Column */}
          <Grid item xs={12} md={5}>
            <MockPaymentForm
              totalAmount={totalPrice}
              currency="€"
              isProcessing={isProcessing}
              errorMessage={errorMessage}
              onConfirmPayment={handleConfirmPayment}
            />
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
};
