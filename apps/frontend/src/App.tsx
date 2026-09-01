import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";
import { HomePage } from "./pages/Home/HomePage";

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HomePage />
    </ThemeProvider>
  );
};

export default App;
