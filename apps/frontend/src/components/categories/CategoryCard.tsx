import React from "react";
import { Card, CardActionArea, CardContent, Typography, Box } from "@mui/material";
import { CategoryItem } from "../../types/category";

interface CategoryCardProps {
  category: CategoryItem;
  isSelected?: boolean;
  onSelect?: (slug: CategoryItem["slug"]) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected = false,
  onSelect,
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: isSelected ? "primary.main" : "divider",
        bgcolor: isSelected ? "rgba(37, 99, 235, 0.04)" : "background.paper",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-3px)",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        },
      }}
    >
      <CardActionArea
        onClick={() => onSelect?.(category.slug)}
        sx={{
          height: "100%",
          p: { xs: 2, sm: 2.5 },
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            bgcolor: isSelected ? "primary.main" : "action.hover",
            color: isSelected ? "#ffffff" : "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
            transition: "all 0.2s ease-in-out",
          }}
        >
          {category.icon}
        </Box>
        <CardContent sx={{ p: 0, width: "100%" }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1rem", sm: "1.1rem" },
              color: "text.primary",
              mb: 0.5,
            }}
          >
            {category.name}
          </Typography>
          {category.description && (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: "0.825rem",
                lineHeight: 1.4,
                display: { xs: "none", sm: "block" },
              }}
            >
              {category.description}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

