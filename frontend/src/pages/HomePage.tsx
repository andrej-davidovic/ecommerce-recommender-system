import { Box, Container, Skeleton, Stack, Typography } from "@mui/material";
import Hero from "@/components/home/Hero";
import CategoryTiles from "@/components/home/CategoryTiles";
import RecommendationCarousel from "@/components/recommendations/RecommendationCarousel";
import ProductGrid from "@/components/product/ProductGrid";
import { useAuthStore } from "@/stores/authStore";
import { usePopular, useRecommendations, useTrackRecommendationClick } from "@/api/recommendations";
import { useProducts } from "@/api/products";
import { useT } from "@/i18n";

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h5">{title}</Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

export default function HomePage() {
  const t = useT();
  const isAuth = useAuthStore((s) => !!s.accessToken);
  const trackClick = useTrackRecommendationClick();

  const recommendations = useRecommendations(10, isAuth);
  const hasPersonalized =
    !recommendations.isLoading &&
    recommendations.data &&
    recommendations.data.length > 0;
  const popular = usePopular(10, !isAuth || hasPersonalized === false);
  const newArrivals = useProducts({
    page: 1,
    page_size: 8,
    sort_by: "created_at",
    sort_order: "desc",
  });

  return (
    <Box>
      <Hero />

      <Container sx={{ py: 6 }}>
        <Stack spacing={7}>
          {}
          {isAuth && hasPersonalized ? (
            <RecommendationCarousel
              title={t.home.recommendedForYou}
              subtitle={t.home.recommendedSubtitle}
              items={recommendations.data}
              isLoading={recommendations.isLoading}
              onProductClick={(id) => trackClick.mutate(id)}
            />
          ) : isAuth && recommendations.isLoading ? (
            <RecommendationCarousel
              title={t.home.recommendedForYou}
              subtitle={t.home.recommendedSubtitle}
              items={undefined}
              isLoading
            />
          ) : (
            <RecommendationCarousel
              title={t.home.popular}
              subtitle={t.home.popularSubtitle}
              items={popular.data}
              isLoading={popular.isLoading}
              showSourceBadge={false}
              onProductClick={isAuth ? (id) => trackClick.mutate(id) : undefined}
            />
          )}

          {}
          <Box>
            <SectionHeader title={t.home.categories} subtitle={t.home.categoriesSubtitle} />
            <CategoryTiles />
          </Box>

          {}
          <Box>
            <SectionHeader title={t.home.newArrivals} subtitle={t.home.newArrivalsSubtitle} />
            {newArrivals.isLoading ? (
              <Stack direction="row" spacing={2.5}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Box key={i} sx={{ flex: 1 }}>
                    <Skeleton variant="rounded" height={220} />
                    <Skeleton width="70%" sx={{ mt: 1 }} />
                  </Box>
                ))}
              </Stack>
            ) : (
              newArrivals.data && <ProductGrid products={newArrivals.data.items} />
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
