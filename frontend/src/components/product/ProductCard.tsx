import {
  Box,
  Card,
  CardActionArea,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { useNavigate } from "react-router-dom";
import type { ProductResponse } from "@/types/api";
import { useT, useFormatPrice, useLocalized } from "@/i18n";
import RatingStars from "./RatingStars";
import ProductImage from "./ProductImage";
import { useAuthStore } from "@/stores/authStore";
import { useAddToCart } from "@/api/cart";
import { useToggleWishlist, useWishlistIds } from "@/api/wishlist";
import { useUiStore } from "@/stores/uiStore";

export default function ProductCard({
  product,
  onClickTrack,
}: {
  product: ProductResponse;
  onClickTrack?: (productId: string) => void;
}) {
  const t = useT();
  const formatPrice = useFormatPrice();
  const l = useLocalized();
  const navigate = useNavigate();
  const isAuth = useAuthStore((s) => !!s.accessToken);
  const notify = useUiStore((s) => s.notify);
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const wishlistIds = useWishlistIds();
  const inWishlist = wishlistIds.has(product.id);
  const outOfStock = product.stock_quantity <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuth) {
      navigate("/login");
      return;
    }
    addToCart.mutate(
      { product_id: product.id, quantity: 1 },
      {
        onSuccess: () => notify(t.cart.itemAdded),
        onError: () => notify(t.common.error, "error"),
      },
    );
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist.mutate({ product_id: product.id, inWishlist });
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": { boxShadow: "0 8px 24px rgba(15,23,42,0.10)", transform: "translateY(-2px)" },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardActionArea onClick={() => { onClickTrack?.(product.id); navigate(`/products/${product.id}`); }}>
          <ProductImage src={product.image_url} alt={l(product, "name")} />
        </CardActionArea>
        {isAuth && (
          <Tooltip title={inWishlist ? t.product.removeFromWishlist : t.product.addToWishlist}>
            <IconButton
              onClick={handleWishlist}
              size="small"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: "rgba(255,255,255,0.9)",
                "&:hover": { bgcolor: "#fff" },
              }}
            >
              {inWishlist ? (
                <FavoriteIcon fontSize="small" color="error" />
              ) : (
                <FavoriteBorderIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}
        {outOfStock && (
          <Chip
            label={t.product.outOfStock}
            size="small"
            color="default"
            sx={{ position: "absolute", top: 8, left: 8, bgcolor: "rgba(255,255,255,0.92)" }}
          />
        )}
      </Box>

      <Stack spacing={0.75} sx={{ p: 1.75, flexGrow: 1 }}>
        <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
          {l(product.category, "name")}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            lineHeight: 1.25,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 40,
            cursor: "pointer",
          }}
          onClick={() => { onClickTrack?.(product.id); navigate(`/products/${product.id}`); }}
        >
          {l(product, "name")}
        </Typography>
        <RatingStars value={product.average_rating} count={product.review_count} />
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {formatPrice(product.price)}
          </Typography>
          <Tooltip title={t.product.addToCart}>
            <span>
              <IconButton
                color="primary"
                onClick={handleAdd}
                disabled={outOfStock || addToCart.isPending}
                sx={{ bgcolor: "primary.main", color: "#fff", "&:hover": { bgcolor: "primary.dark" } }}
              >
                <AddShoppingCartIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Card>
  );
}
