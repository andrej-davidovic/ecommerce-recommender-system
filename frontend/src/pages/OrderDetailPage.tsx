import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useOrder } from "@/api/orders";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import { useT, useFormatPrice, useLocalized } from "@/i18n";
import type { OrderStatus } from "@/types/api";

const STATUS_COLOR: Record<OrderStatus, "default" | "warning" | "success" | "info" | "error"> = {
  pending: "warning",
  paid: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "error",
};

export default function OrderDetailPage() {
  const t = useT();
  const formatPrice = useFormatPrice();
  const l = useLocalized();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, isError, refetch } = useOrder(id);

  if (isLoading) return <LoadingState />;
  if (isError || !order)
    return (
      <Container sx={{ py: 6 }}>
        <ErrorState onRetry={() => refetch()} />
      </Container>
    );

  return (
    <Container sx={{ py: 4 }} maxWidth="md">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/orders")}
        color="inherit"
        sx={{ mb: 2 }}
      >
        {t.orders.title}
      </Button>

      <Paper
        elevation={0}
        sx={{ p: { xs: 3, sm: 4 }, border: "1px solid", borderColor: "divider" }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {t.orders.orderNumber} #{order.id.slice(0, 8).toUpperCase()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {format(parseISO(order.created_at), "dd.MM.yyyy. HH:mm")}
            </Typography>
          </Box>
          <Chip
            label={t.orders.statusLabels[order.status] ?? order.status}
            color={STATUS_COLOR[order.status]}
          />
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" sx={{ mb: 2 }}>
          {t.orders.items}
        </Typography>

        <Stack spacing={1.5} sx={{ mb: 3 }}>
          {order.items.map((item) => (
            <Stack
              key={item.id}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                p: 1.5,
                bgcolor: "#f8fafc",
                borderRadius: 2,
                cursor: "pointer",
              }}
              onClick={() => navigate(`/products/${item.product_id}`)}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle2">
                  {l(item, "product_name") || "Proizvod"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.quantity} x {formatPrice(item.unit_price)}
                </Typography>
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, ml: 2 }}>
                {formatPrice(item.quantity * item.unit_price)}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6">{t.orders.total}</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {formatPrice(order.total_amount)}
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
