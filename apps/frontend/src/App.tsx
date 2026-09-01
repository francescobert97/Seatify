import React from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Typography,
} from "@mui/material";
import { HealthCheck } from "./components/HealthCheck";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#f5f7fb",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            py: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}
            >
              Seatify
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Event Discovery & Reservation Platform
            </Typography>
          </Box>

          <HealthCheck />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;

