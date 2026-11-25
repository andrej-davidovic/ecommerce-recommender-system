import { Box, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import YardIcon from "@mui/icons-material/Yard";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import ToysIcon from "@mui/icons-material/Toys";
import CategoryIcon from "@mui/icons-material/Category";
import type { ReactNode } from "react";
import { useCategories } from "@/api/categories";
import { useLocalized } from "@/i18n";

const ICONS: Record<string, ReactNode> = {
  electronics: <DevicesOtherIcon />,
  books: <MenuBookIcon />,
  clothing: <CheckroomIcon />,
  "home & garden": <YardIcon />,
  sports: <SportsBasketballIcon />,
  toys: <ToysIcon />,
};

function iconFor(name: string): ReactNode {
  return ICONS[name.toLowerCase()] ?? <CategoryIcon />;
}

export default function CategoryTiles() {
  const navigate = useNavigate();
  const l = useLocalized();
  const { data: categories } = useCategories();
  if (!categories || categories.length === 0) return null;

  return (
    <Grid container spacing={2}>
      {categories.map((c) => (
        <Grid key={c.id} item xs={6} sm={4} md={2}>
          <Box
            onClick={() => navigate(`/products?category_id=${c.id}`)}
            sx={{
              cursor: "pointer",
              p: 2.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              textAlign: "center",
              transition: "all .2s ease",
              "&:hover": {
                borderColor: "primary.main",
                boxShadow: "0 8px 24px rgba(79,70,229,0.12)",
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                mx: "auto",
                mb: 1,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#eef2ff",
                color: "primary.main",
              }}
            >
              {iconFor(c.name)}
            </Box>
            <Typography variant="subtitle2">{l(c, "name")}</Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}
