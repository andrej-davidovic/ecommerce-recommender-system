import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ModelTrainingIcon from "@mui/icons-material/ModelTraining";
import { format, parseISO } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAlgorithmStatus, useRetrain } from "@/api/admin";
import LoadingState from "@/components/common/LoadingState";
import AdminNav from "@/components/layout/AdminNav";
import { useUiStore } from "@/stores/uiStore";
import { useT } from "@/i18n";

export default function AdminMetricsPage() {
  const t = useT();
  const { data: status, isLoading } = useAlgorithmStatus();
  const retrain = useRetrain();
  const notify = useUiStore((s) => s.notify);

  const handleRetrain = () => {
    retrain.mutate(undefined, {
      onSuccess: () => notify(t.admin.retrained),
      onError: () => notify(t.common.error, "error"),
    });
  };

  if (isLoading) return <LoadingState />;

  const chartData = [
    { name: "Korisnici", value: status?.num_users ?? 0 },
    { name: "Proizvodi", value: status?.num_products ?? 0 },
    { name: "Preporuke", value: status?.total_recommendations ?? 0 },
  ];

  return (
    <Container sx={{ py: 4 }}>
      <AdminNav />
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4">{t.admin.metrics}</Typography>
        <Button
          variant="contained"
          startIcon={
            retrain.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <RefreshIcon />
            )
          }
          onClick={handleRetrain}
          disabled={retrain.isPending}
        >
          {retrain.isPending ? t.admin.retraining : t.admin.retrain}
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{ p: 3, border: "1px solid", borderColor: "divider", height: "100%" }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
              <ModelTrainingIcon color="primary" />
              <Typography variant="h6">{t.admin.algorithmStatus}</Typography>
            </Stack>

            <Stack spacing={2}>
              <InfoRow
                label={t.admin.status}
                value={
                  <Chip
                    label={status?.status === "active" ? t.admin.active : t.admin.notTrained}
                    color={status?.status === "active" ? "success" : "default"}
                    size="small"
                  />
                }
              />
              {status?.algorithm && (
                <InfoRow label={t.admin.algorithm} value={status.algorithm} />
              )}
              <InfoRow
                label={t.admin.trainedAt}
                value={
                  status?.trained_at
                    ? format(parseISO(status.trained_at), "dd.MM.yyyy. HH:mm")
                    : t.admin.notTrained
                }
              />
              <InfoRow
                label={t.admin.totalUsers}
                value={status?.num_users ?? "—"}
              />
              <InfoRow
                label={t.admin.totalProducts}
                value={status?.num_products ?? "—"}
              />
              <InfoRow
                label={t.admin.totalRecommendations}
                value={status?.total_recommendations ?? "—"}
              />
              {status?.click_through_rate != null && (
                <InfoRow
                  label={t.admin.clickThroughRate}
                  value={`${status.click_through_rate.toFixed(2)}%`}
                />
              )}
              {status?.message && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {status.message}
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        {}
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t.admin.overview}
              </Typography>
              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" fontSize={13} />
                    <YAxis fontSize={13} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="subtitle2">
        {typeof value === "object" ? value : String(value)}
      </Typography>
    </Stack>
  );
}
