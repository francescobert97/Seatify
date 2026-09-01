import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { CATEGORIES } from "../../data/categories";
import { CategoryCard } from "./CategoryCard";
import { EventCategory } from "../../types/event";

interface CategorySectionProps {
  selectedCategory?: EventCategory | "all";
  onSelectCategory?: (category: EventCategory | "all") => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const handleCategoryClick = (slug: EventCategory): void => {
    if (selectedCategory === slug) {
      onSelectCategory?.("all");
    } else {
      onSelectCategory?.(slug);
    }
  };

  return (
    <Box
      id="categories"
      component="section"
      sx={{
        py: { xs: 6, md: 9 },
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: { xs: 3.5, md: 4.5 } }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.65rem", sm: "2rem", md: "2.25rem" },
              color: "text.primary",
              letterSpacing: "-0.02em",
            }}
          >
            Explore by category
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(5, 1fr)",
            },
            gap: { xs: 2, sm: 2.5 },
          }}
        >
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.slug}
              onSelect={handleCategoryClick}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};

