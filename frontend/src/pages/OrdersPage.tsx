import {
  Box,
  Chip,
  Container,
  Pagination,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useOrders } from "@/api/orders";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import { useT, useFormatPrice } from "@/i18n";
import type { OrderStatus } from "@/types/api";

const STATUS_COLOR: Record<OrderStatus, "default" | "warning" | "success" | "info" | "error"> = {
  pending: "warning",
  paid: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "error",
};

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const t = useT();
  const formatPrice = useFormatPrice();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useOrders(page, PAGE_SIZE);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t.orders.title}
      </Typography>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={<ReceiptLongIcon fontSize="inherit" />}
          title={t.orders.empty}
          actionLabel={t.orders.emptyCta}
          onAction={() => navigate("/products")}
        />
      ) : (
        <>
          <Stack spacing={2}>
            {data.items.map((order) => (
              <Paper
                key={order.id}
                elevation={0}
                onClick={() => navigate(`/orders/${order.id}`)}
                sx={{
                  p: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  cursor: "pointer",
                  transition: "all .2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 4px 16px rgba(79,70,229,0.08)",
                  },
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ sm: "center" }}
                  spacing={1}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {t.orders.orderNumber} #{order.id.slice(0, 8).toUpperCase()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(parseISO(order.created_at), "dd.MM.yyyy. HH:mm")}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                      label={t.orders.statusLabels[order.status] ?? order.status}
                      color={STATUS_COLOR[order.status]}
                      size="small"
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, minWidth: 100, textAlign: "right" }}>
                      {formatPrice(order.total_amount)}
                    </Typography>
                  </Stack>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {order.items.length} stavki
                </Typography>
              </Paper>
            ))}
          </Stack>

          {totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
              />
            </Stack>
          )}
        </>
      )}
    </Container>
  );
}
