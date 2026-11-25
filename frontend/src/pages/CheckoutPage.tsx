import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useCart } from "@/api/cart";
import { useCreateOrder } from "@/api/orders";
import { useConfirmPayment, useCreatePaymentIntent } from "@/api/payments";
import LoadingState from "@/components/common/LoadingState";
import EmptyState from "@/components/common/EmptyState";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { useT, useFormatPrice, useLocalized } from "@/i18n";

type CheckoutStep = "review" | "paying" | "success" | "error";

export default function CheckoutPage() {
  const t = useT();
  const formatPrice = useFormatPrice();
  const l = useLocalized();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { data: cart, isLoading } = useCart();
  const createOrder = useCreateOrder();
  const createIntent = useCreatePaymentIntent();
  const confirmPayment = useConfirmPayment();
  const [step, setStep] = useState<CheckoutStep>("review");
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <LoadingState />;

  
  if (step === "review" && (!cart || cart.items.length === 0)) {
    return (
      <Container sx={{ py: 6 }}>
        <EmptyState
          icon={<ShoppingCartOutlinedIcon fontSize="inherit" />}
          title={t.checkout.cartEmpty}
          actionLabel={t.cart.emptyCta}
          onAction={() => navigate("/products")}
        />
      </Container>
    );
  }

  if (step === "success") {
    return (
      <Container sx={{ py: 8 }} maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CheckCircleOutlineIcon
            color="success"
            sx={{ fontSize: 64, mb: 2 }}
          />
          <Typography variant="h4" sx={{ mb: 1 }}>
            {t.checkout.success}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {t.checkout.successMessage}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              component={RouterLink}
              to="/orders"
              variant="contained"
              size="large"
            >
              {t.checkout.viewOrders}
            </Button>
            <Button
              component={RouterLink}
              to="/products"
              variant="outlined"
              size="large"
            >
              {t.checkout.continueShopping}
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setError(null);
    setStep("paying");

    try {
      
      const order = await createOrder.mutateAsync();

      const intent = await createIntent.mutateAsync(order.id);

      const card = elements.getElement(CardElement);
      if (!card) {
        setError(t.checkout.paymentError);
        setStep("error");
        return;
      }

      const result = await stripe.confirmCardPayment(intent.client_secret, {
        payment_method: { card },
        return_url: `${window.location.origin}/orders`,
      });

      if (result.error) {
        setError(result.error.message ?? t.checkout.paymentError);
        setStep("error");
      } else {
        
        await confirmPayment.mutateAsync(order.id);
        setStep("success");
      }
    } catch (err: unknown) {
      const detail =
        err instanceof Error && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : undefined;
      setError(detail ?? t.checkout.paymentError);
      setStep("error");
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t.checkout.title}
      </Typography>

      <Grid container spacing={4}>
        {}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t.checkout.cardDetails}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t.checkout.subtitle}
            </Typography>
            <Box
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                mb: 3,
              }}
            >
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      fontFamily: "Inter, sans-serif",
                      color: "#0f172a",
                      "::placeholder": { color: "#94a3b8" },
                    },
                    invalid: { color: "#dc2626" },
                  },
                }}
              />
            </Box>

            {(step === "error" || error) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={
                step === "paying" ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <LockIcon />
                )
              }
              onClick={handlePay}
              disabled={step === "paying" || !stripe}
            >
              {step === "paying"
                ? t.checkout.processing
                : `${t.checkout.payNow} — ${formatPrice(cart?.total)}`}
            </Button>
          </Paper>
        </Grid>

        {}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              position: { md: "sticky" },
              top: 88,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t.checkout.orderSummary}
            </Typography>
            <Stack spacing={1.5}>
              {(cart?.items ?? []).map((item) => (
                <Stack
                  key={item.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="body2" noWrap>
                      {l(item, "product_name")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.quantity} x {formatPrice(item.product_price)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, ml: 2 }}>
                    {formatPrice((item.product_price ?? 0) * item.quantity)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle1">{t.cart.total}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatPrice(cart?.total)}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
