import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import { Link as RouterLink } from "react-router-dom";
import { useAnalyticsOverview } from "@/api/admin";
import LoadingState from "@/components/common/LoadingState";
import AdminNav from "@/components/layout/AdminNav";
import { useT } from "@/i18n";

export default function AdminDashboardPage() {
  const t = useT();

  const CARDS = [
    {
      key: "total_users" as const,
      label: t.admin.totalUsers,
      icon: <PeopleIcon />,
      color: "#4f46e5",
      link: "/admin/users",
    },
    {
      key: "total_products" as const,
      label: t.admin.totalProducts,
      icon: <InventoryIcon />,
      color: "#0ea5e9",
      link: "/admin/products",
    },
    {
      key: "total_orders" as const,
      label: t.admin.totalOrders,
      icon: <ReceiptLongIcon />,
      color: "#16a34a",
      link: null,
    },
    {
      key: "pending_approvals" as const,
      label: t.admin.pendingApprovals,
      icon: <HourglassBottomIcon />,
      color: "#d97706",
      link: "/admin/users",
    },
  ];
  const { data, isLoading } = useAnalyticsOverview();
  if (isLoading) return <LoadingState />;

  return (
    <Container sx={{ py: 4 }}>
      <AdminNav />
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t.admin.dashboard}
      </Typography>

      <Grid container spacing={3}>
        {CARDS.map((c) => (
          <Grid key={c.key} item xs={6} md={3}>
            <Card
              component={c.link ? RouterLink : "div"}
              {...(c.link ? { to: c.link } : {})}
              sx={{
                textDecoration: "none",
                cursor: c.link ? "pointer" : "default",
                transition: "transform .15s",
                "&:hover": c.link
                  ? { transform: "translateY(-2px)" }
                  : undefined,
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: `${c.color}15`,
                      color: c.color,
                    }}
                  >
                    {c.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      {data?.[c.key] ?? 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {c.label}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
