import {
  Box,
  Container,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
  Button,
  useMediaQuery,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useProducts } from "@/api/products";
import { useCategories } from "@/api/categories";
import ProductGrid from "@/components/product/ProductGrid";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import { useT, useLocalized } from "@/i18n";
import type { ProductQuery } from "@/types/api";

const PAGE_SIZE = 12;

type SortKey = "newest" | "price_asc" | "price_desc" | "name";

const SORT_MAP: Record<SortKey, Pick<ProductQuery, "sort_by" | "sort_order">> = {
  newest: { sort_by: "created_at", sort_order: "desc" },
  price_asc: { sort_by: "price", sort_order: "asc" },
  price_desc: { sort_by: "price", sort_order: "desc" },
  name: { sort_by: "name", sort_order: "asc" },
};

export default function ProductsPage() {
  const t = useT();
  const l = useLocalized();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories } = useCategories();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const search = searchParams.get("search") ?? "";
  const categoryId = searchParams.get("category_id");
  const sort = (searchParams.get("sort") as SortKey) ?? "newest";
  const page = Number(searchParams.get("page") ?? "1");

  const query: ProductQuery = useMemo(
    () => ({
      page,
      page_size: PAGE_SIZE,
      search: search || undefined,
      category_id: categoryId ? Number(categoryId) : undefined,
      ...SORT_MAP[sort],
    }),
    [page, search, categoryId, sort],
  );

  const { data, isLoading, isError, refetch } = useProducts(query);

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    });
    
    if (!("page" in patch)) next.set("page", "1");
    setSearchParams(next);
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const hasActiveFilters = !!categoryId || !!search;

  const filterControls = (
    <Stack spacing={2.5} sx={{ width: { xs: 240, md: 230 }, flexShrink: 0 }}>
      <Typography variant="h6">{t.products.filters}</Typography>

      <FormControl fullWidth size="small">
        <InputLabel>{t.products.category}</InputLabel>
        <Select
          label={t.products.category}
          value={categoryId ?? ""}
          onChange={(e) => update({ category_id: e.target.value || null })}
        >
          <MenuItem value="">{t.products.allCategories}</MenuItem>
          {categories?.map((c) => (
            <MenuItem key={c.id} value={String(c.id)}>
              {l(c, "name")}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel>{t.products.sortBy}</InputLabel>
        <Select
          label={t.products.sortBy}
          value={sort}
          onChange={(e) => update({ sort: e.target.value })}
        >
          <MenuItem value="newest">{t.products.sortNewest}</MenuItem>
          <MenuItem value="price_asc">{t.products.sortPriceAsc}</MenuItem>
          <MenuItem value="price_desc">{t.products.sortPriceDesc}</MenuItem>
          <MenuItem value="name">{t.products.sortName}</MenuItem>
        </Select>
      </FormControl>

      {hasActiveFilters && (
        <Button
          variant="text"
          onClick={() => setSearchParams(new URLSearchParams())}
        >
          {t.products.clearFilters}
        </Button>
      )}
    </Stack>
  );

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">{t.products.title}</Typography>
          {search && (
            <Typography variant="body2" color="text.secondary">
              „{search}"
            </Typography>
          )}
          {data && (
            <Typography variant="body2" color="text.secondary">
              {t.products.resultsCount(data.total)}
            </Typography>
          )}
        </Box>
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(true)}>
            <TuneIcon />
          </IconButton>
        )}
      </Stack>

      <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
        {!isMobile && filterControls}

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              title={t.products.empty}
              actionLabel={hasActiveFilters ? t.products.clearFilters : undefined}
              onAction={
                hasActiveFilters
                  ? () => setSearchParams(new URLSearchParams())
                  : undefined
              }
            />
          ) : (
            <>
              <ProductGrid products={data.items} />
              {totalPages > 1 && (
                <Stack alignItems="center" sx={{ mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, p) => update({ page: String(p) })}
                    color="primary"
                  />
                </Stack>
              )}
            </>
          )}
        </Box>
      </Box>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ p: 3 }}>{filterControls}</Box>
      </Drawer>
    </Container>
  );
}
