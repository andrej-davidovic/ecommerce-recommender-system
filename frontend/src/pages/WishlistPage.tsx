import { Container, Typography } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "@/api/wishlist";
import { useProductsByIds } from "@/api/products";
import LoadingState from "@/components/common/LoadingState";
import EmptyState from "@/components/common/EmptyState";
import ProductGrid from "@/components/product/ProductGrid";
import { useT } from "@/i18n";

export default function WishlistPage() {
  const t = useT();
  const navigate = useNavigate();
  const { data: items, isLoading } = useWishlist();
  const ids = (items ?? []).map((w) => w.product_id);
  const productQueries = useProductsByIds(ids);
  const products = productQueries
    .map((q) => q.data)
    .filter((p): p is NonNullable<typeof p> => !!p);
  const loading = isLoading || productQueries.some((q) => q.isLoading);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        {t.wishlist.title}
      </Typography>
      {products.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t.wishlist.itemCount(products.length)}
        </Typography>
      )}

      {loading ? (
        <LoadingState />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<FavoriteBorderIcon fontSize="inherit" />}
          title={t.wishlist.empty}
          actionLabel={t.wishlist.emptyCta}
          onAction={() => navigate("/products")}
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </Container>
  );
}
