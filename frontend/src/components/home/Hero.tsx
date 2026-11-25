import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useT } from "@/i18n";

export default function Hero() {
  const t = useT();
  const isAuth = useAuthStore((s) => !!s.accessToken);
  return (
    <Box
      sx={{
        background:
          "radial-gradient(1000px 500px at 15% -20%, #e0e7ff, transparent), linear-gradient(180deg, #ffffff, #f8fafc)",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={3} sx={{ maxWidth: 640 }}>
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1.05 }}
          >
            {t.home.heroTitle}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            {t.home.heroSubtitle}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button component={RouterLink} to="/products" variant="contained" size="large">
              {t.home.heroCta}
            </Button>
            {!isAuth && (
              <Button component={RouterLink} to="/register" variant="outlined" size="large">
                {t.home.heroCtaSecondary}
              </Button>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
