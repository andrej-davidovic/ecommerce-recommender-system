import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProduct } from "@/api/products";
import { useReviews } from "@/api/reviews";
import { useSimilar, useTrackRecommendationClick } from "@/api/recommendations";
import { useAddToCart } from "@/api/cart";
import { useToggleWishlist, useWishlistIds } from "@/api/wishlist";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import RatingStars from "@/components/product/RatingStars";
import ProductImage from "@/components/product/ProductImage";
import ReviewList from "@/components/product/ReviewList";
import ReviewForm from "@/components/product/ReviewForm";
import RecommendationCarousel from "@/components/recommendations/RecommendationCarousel";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import { useT, useFormatPrice, useLocalized } from "@/i18n";

export default function ProductDetailPage() {
  const t = useT();
  const formatPrice = useFormatPrice();
  const l = useLocalized();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAuth = useAuthStore((s) => !!s.accessToken);
  const user = useAuthStore((s) => s.user);
  const notify = useUiStore((s) => s.notify);

  const { data: product, isLoading, isError, refetch } = useProduct(id);
  const { data: reviews } = useReviews(id);
  const { data: similar, isLoading: similarLoading } = useSimilar(id);
  const trackClick = useTrackRecommendationClick();
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const wishlistIds = useWishlistIds();
  const [tab, setTab] = useState(0);

  if (isLoading) return <LoadingState />;
  if (isError || !product)
    return (
      <Container sx={{ py: 6 }}>
        <ErrorState onRetry={() => refetch()} />
      </Container>
    );

  const inWishlist = wishlistIds.has(product.id);
  const outOfStock = product.stock_quantity <= 0;

  const handleAdd = () => {
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

  const handleWishlist = () => {
    if (!isAuth) {
      navigate("/login");
      return;
    }
    toggleWishlist.mutate({ product_id: product.id, inWishlist });
  };

  return (
    <Container sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
        color="inherit"
      >
        {t.common.back}
      </Button>

      <Grid container spacing={5}>
        <Grid item xs={12} md={6}>
          <ProductImage src={product.image_url} alt={l(product, "name")} ratio="1 / 1" rounded />
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Box>
              <Chip
                label={l(product.category, "name")}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mb: 1 }}
              />
              <Typography variant="h4">{l(product, "name")}</Typography>
            </Box>

            <Stack direction="row" alignItems="center" spacing={2}>
              <RatingStars value={product.average_rating} count={product.review_count} size="medium" />
            </Stack>

            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {formatPrice(product.price)}
            </Typography>

            <Box>
              {outOfStock ? (
                <Chip label={t.product.outOfStock} color="default" />
              ) : product.stock_quantity <= 5 ? (
                <Chip label={t.product.onlyLeft(product.stock_quantity)} color="warning" variant="outlined" />
              ) : (
                <Chip label={t.product.inStock} color="success" variant="outlined" />
              )}
            </Box>

            {product.tags.length > 0 && (
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {product.tags.map((tag) => (
                  <Chip key={tag.id} label={`#${tag.name}`} size="small" variant="outlined" />
                ))}
              </Stack>
            )}

            <Divider />

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddShoppingCartIcon />}
                onClick={handleAdd}
                disabled={outOfStock || addToCart.isPending}
                sx={{ flexGrow: 1 }}
              >
                {t.product.addToCart}
              </Button>
              <IconButton
                onClick={handleWishlist}
                sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
              >
                {inWishlist ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      {}
      <Box sx={{ mt: 6 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tab label={t.product.description} />
          <Tab label={t.product.reviewCount(product.review_count)} />
        </Tabs>
        <Box sx={{ py: 3 }}>
          {tab === 0 && (
            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-line", maxWidth: 760 }}>
              {l(product, "description")}
            </Typography>
          )}
          {tab === 1 && (
            <Stack spacing={3}>
              {isAuth && !reviews?.some((r) => r.user_id === user?.id) && (
                <ReviewForm productId={product.id} />
              )}
              <ReviewList reviews={reviews ?? []} productId={product.id} />
            </Stack>
          )}
        </Box>
      </Box>

      {}
      <Box sx={{ mt: 6 }}>
        <RecommendationCarousel
          title={t.product.similarProducts}
          items={similar}
          isLoading={similarLoading}
          showSourceBadge={false}
          onProductClick={isAuth ? (pid) => trackClick.mutate(pid) : undefined}
        />
      </Box>
    </Container>
  );
}
