import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { useNavigate } from "react-router-dom";
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/api/cart";
import ProductImage from "@/components/product/ProductImage";
import LoadingState from "@/components/common/LoadingState";
import EmptyState from "@/components/common/EmptyState";
import { useT, useFormatPrice, useLocalized } from "@/i18n";

export default function CartPage() {
  const t = useT();
  const formatPrice = useFormatPrice();
  const l = useLocalized();
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  if (isLoading) return <LoadingState />;

  if (!cart || cart.items.length === 0) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          {t.cart.title}
        </Typography>
        <EmptyState
          icon={<ShoppingCartOutlinedIcon fontSize="inherit" />}
          title={t.cart.empty}
          actionLabel={t.cart.emptyCta}
          onAction={() => navigate("/products")}
        />
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">{t.cart.title}</Typography>
        <Button
          color="inherit"
          startIcon={<DeleteOutlineIcon />}
          onClick={() => clearCart.mutate()}
          disabled={clearCart.isPending}
        >
          {t.cart.clear}
        </Button>
      </Stack>

      <Box sx={{ display: "flex", gap: 4, flexDirection: { xs: "column", md: "row" }, alignItems: "flex-start" }}>
        {}
        <Stack spacing={2} sx={{ flexGrow: 1, width: "100%" }}>
          {cart.items.map((item) => (
            <Paper
              key={item.id}
              elevation={0}
              sx={{ p: 2, border: "1px solid", borderColor: "divider", display: "flex", gap: 2, alignItems: "center" }}
            >
              <Box
                sx={{ width: 84, flexShrink: 0, cursor: "pointer" }}
                onClick={() => navigate(`/products/${item.product_id}`)}
              >
                <ProductImage src={item.product_image_url} alt={l(item, "product_name")} rounded />
              </Box>

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/products/${item.product_id}`)}
                >
                  {l(item, "product_name")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatPrice(item.product_price)}
                </Typography>
              </Box>

              {}
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton
                  size="small"
                  onClick={() =>
                    item.quantity > 1
                      ? updateItem.mutate({ product_id: item.product_id, quantity: item.quantity - 1 })
                      : removeItem.mutate(item.product_id)
                  }
                  sx={{ border: "1px solid", borderColor: "divider" }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography sx={{ minWidth: 24, textAlign: "center", fontWeight: 600 }}>
                  {item.quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => updateItem.mutate({ product_id: item.product_id, quantity: item.quantity + 1 })}
                  sx={{ border: "1px solid", borderColor: "divider" }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Typography sx={{ minWidth: 90, textAlign: "right", fontWeight: 700 }}>
                {formatPrice((item.product_price ?? 0) * item.quantity)}
              </Typography>

              <IconButton onClick={() => removeItem.mutate(item.product_id)} color="error">
                <DeleteOutlineIcon />
              </IconButton>
            </Paper>
          ))}
        </Stack>

        {}
        <Paper
          elevation={0}
          sx={{ p: 3, border: "1px solid", borderColor: "divider", width: { xs: "100%", md: 320 }, flexShrink: 0, position: { md: "sticky" }, top: 88 }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t.cart.total}
          </Typography>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography color="text.secondary">{t.cart.total}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {formatPrice(cart.total)}
            </Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => navigate("/checkout")}
          >
            {t.cart.checkout}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
