import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useCart } from "@/api/cart";
import { useT, useLocaleStore } from "@/i18n";
import type { Locale } from "@/i18n";
import LanguageIcon from "@mui/icons-material/Language";

export default function Navbar() {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const navigate = useNavigate();
  const isAuth = useAuthStore((s) => !!s.accessToken);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = user?.role === "admin";
  const { data: cart } = useCart();
  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate("/");
  };

  const initials = (user?.full_name || user?.email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <AppBar position="sticky">
      <Container>
        <Toolbar disableGutters sx={{ gap: 2, py: 1 }}>
          {}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            component={RouterLink}
            to="/"
            sx={{ textDecoration: "none", color: "text.primary", flexShrink: 0 }}
          >
            <StorefrontIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
              {t.appName}
            </Typography>
          </Stack>

          {}
          <Box
            component="form"
            onSubmit={submitSearch}
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              flexGrow: 1,
              maxWidth: 480,
              bgcolor: "#f1f5f9",
              borderRadius: 2,
              px: 1.5,
            }}
          >
            <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
            <InputBase
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.nav.searchPlaceholder}
              sx={{ ml: 1, flex: 1, py: 0.75, fontSize: 14 }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {}
          <Button component={RouterLink} to="/products" color="inherit">
            {t.nav.products}
          </Button>
          {isAdmin && (
            <Button component={RouterLink} to="/admin" color="inherit">
              {t.nav.admin}
            </Button>
          )}

          {isAuth && (
            <Tooltip title={t.nav.wishlist}>
              <IconButton component={RouterLink} to="/wishlist" color="inherit">
                <FavoriteBorderIcon />
              </IconButton>
            </Tooltip>
          )}

          {}
          <Tooltip title={locale === "sr" ? "English" : "Srpski"}>
            <Button
              size="small"
              color="inherit"
              startIcon={<LanguageIcon />}
              onClick={() => setLocale((locale === "sr" ? "en" : "sr") as Locale)}
              sx={{ minWidth: "auto", textTransform: "none", fontSize: 13 }}
            >
              {locale === "sr" ? "EN" : "SR"}
            </Button>
          </Tooltip>

          <Tooltip title={t.nav.cart}>
            <IconButton component={RouterLink} to="/cart" color="inherit">
              <Badge badgeContent={cartCount} color="primary">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {isAuth ? (
            <>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 0.5 }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 14 }}>
                  {initials}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2">{user?.full_name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem component={RouterLink} to="/profile" onClick={() => setAnchorEl(null)}>
                  {t.nav.profile}
                </MenuItem>
                <MenuItem component={RouterLink} to="/orders" onClick={() => setAnchorEl(null)}>
                  {t.nav.orders}
                </MenuItem>
                <MenuItem component={RouterLink} to="/wishlist" onClick={() => setAnchorEl(null)}>
                  {t.nav.wishlist}
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>{t.nav.logout}</MenuItem>
              </Menu>
            </>
          ) : (
            <Stack direction="row" spacing={1} sx={{ ml: 1 }}>
              <Button component={RouterLink} to="/login" color="inherit">
                {t.nav.login}
              </Button>
              <Button component={RouterLink} to="/register" variant="contained">
                {t.nav.register}
              </Button>
            </Stack>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
