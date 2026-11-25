import { Box, Chip, Skeleton, Stack, Typography } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import type { RecommendationItem } from "@/types/api";
import { useProductsByIds } from "@/api/products";
import { useT } from "@/i18n";
import ProductCard from "@/components/product/ProductCard";

interface Props {
  title: string;
  subtitle?: string;
  items: RecommendationItem[] | undefined;
  isLoading?: boolean;
  showSourceBadge?: boolean;
  onProductClick?: (productId: string) => void;
}

export default function RecommendationCarousel({
  title,
  subtitle,
  items,
  isLoading,
  showSourceBadge = true,
  onProductClick,
}: Props) {
  const t = useT();
  const ids = (items ?? []).map((i) => i.product_id);
  const productQueries = useProductsByIds(ids);
  const products = productQueries
    .map((q) => q.data)
    .filter((p): p is NonNullable<typeof p> => !!p);

  const loading = isLoading || productQueries.some((q) => q.isLoading);
  const source = items?.[0]?.source;

  if (!loading && products.length === 0) return null;

  return (
    <Box component="section">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AutoAwesomeIcon color="primary" fontSize="small" />
            <Typography variant="h5">{title}</Typography>
            {showSourceBadge && source && (
              <Chip
                size="small"
                variant="outlined"
                color="primary"
                label={t.source[source]}
              />
            )}
          </Stack>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>

      <Box
        sx={{
          display: "flex",
          gap: 2.5,
          overflowX: "auto",
          pb: 1.5,
          scrollSnapType: "x mandatory",
          "&::-webkit-scrollbar": { height: 8 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#cbd5e1",
            borderRadius: 8,
          },
        }}
      >
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Box key={i} sx={{ minWidth: 220, flex: "0 0 auto" }}>
                <Skeleton variant="rounded" height={220} />
                <Skeleton width="80%" sx={{ mt: 1 }} />
                <Skeleton width="40%" />
              </Box>
            ))
          : products.map((p) => (
              <Box
                key={p.id}
                sx={{ minWidth: 220, maxWidth: 220, flex: "0 0 auto", scrollSnapAlign: "start" }}
              >
                <ProductCard product={p} onClickTrack={onProductClick} />
              </Box>
            ))}
      </Box>
    </Box>
  );
}
