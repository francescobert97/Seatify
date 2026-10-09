import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";
import { AuthProvider } from "./auth/AuthContext";
import { HomePage } from "./pages/Home/HomePage";
import { EventDetailsPage } from "./pages/EventDetails/EventDetailsPage";
import { CheckoutPage } from "./pages/Checkout/CheckoutPage";
import { AccountPage } from "./pages/Account/AccountPage";
import { useCurrentRoute } from "./router/navigation";

export const App: React.FC = () => {
  const { eventId, isCheckout, isAccount } = useCurrentRoute();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        {isAccount ? (
          <AccountPage />
        ) : isCheckout ? (
          <CheckoutPage />
        ) : eventId ? (
          <EventDetailsPage eventId={eventId} />
        ) : (
          <HomePage />
        )}
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
