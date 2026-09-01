import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  InputBase,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface HeroSectionProps {
  onSearch?: (query: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onSelectCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearchSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const popularShortcuts = [
    { label: "Concerts", value: "concerts" },
    { label: "Sports", value: "sports" },
    { label: "Theatre", value: "theatre" },
    { label: "Festivals", value: "festivals" },
  ];

  const handleShortcutClick = (value: string): void => {
    if (onSelectCategory) {
      onSelectCategory(value);
    }
    const element = document.querySelector("#upcoming-events");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Box
      component="section"
      sx={{
        pt: { xs: 8, md: 12 },
        pb: { xs: 8, md: 10 },
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        position: "relative",
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 5 } }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontSize: { xs: "2.25rem", sm: "3rem", md: "3.75rem" },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.15,
              mb: 2,
              letterSpacing: "-0.03em",
            }}
          >
            Discover your next experience
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "1.05rem", md: "1.25rem" },
              maxWidth: 600,
              mx: "auto",
              fontWeight: 400,
            }}
          >
            Find concerts, shows and events you'll love.
          </Typography>
        </Box>

        {/* Search Bar */}
        <Paper
          component="form"
          onSubmit={handleSearchSubmit}
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "center",
            p: { xs: "6px 8px", sm: "8px 12px" },
            border: "2px solid",
            borderColor: "divider",
            borderRadius: 3,
            maxWidth: 680,
            mx: "auto",
            transition: "all 0.2s ease-in-out",
            "&:hover, &:focus-within": {
              borderColor: "primary.main",
              boxShadow: "0 4px 20px rgba(37, 99, 235, 0.12)",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              pl: 1.5,
              pr: 1,
              color: "text.secondary",
            }}
          >
            <SearchIcon fontSize="medium" />
          </Box>
          <InputBase
            sx={{
              ml: 1,
              flex: 1,
              fontSize: { xs: "0.95rem", sm: "1.05rem" },
              color: "text.primary",
            }}
            placeholder="Search events, artists, venues..."
            inputProps={{ "aria-label": "search events, artists, venues" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              px: { xs: 2.5, sm: 3.5 },
              py: { xs: 1, sm: 1.25 },
              fontSize: { xs: "0.9rem", sm: "1rem" },
              fontWeight: 600,
              borderRadius: 2,
              whiteSpace: "nowrap",
            }}
          >
            Search
          </Button>
        </Paper>

        {/* Category Shortcuts */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 1.25,
            mt: 3.5,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              mr: 0.5,
              display: { xs: "none", sm: "inline-block" },
            }}
          >
            Popular:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
            {popularShortcuts.map((shortcut) => (
              <Chip
                key={shortcut.value}
                label={shortcut.label}
                clickable
                onClick={() => handleShortcutClick(shortcut.value)}
                variant="outlined"
                sx={{
                  bgcolor: "background.paper",
                  borderColor: "divider",
                  color: "text.primary",
                  fontSize: "0.875rem",
                  py: 1.75,
                  px: 0.5,
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: "action.hover",
                    borderColor: "primary.light",
                  },
                }}
              />
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

