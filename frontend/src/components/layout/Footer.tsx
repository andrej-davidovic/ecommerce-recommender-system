import { Box, Container, Stack, Typography } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useT } from "@/i18n";

export default function Footer() {
  const t = useT();
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        py: 4,
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Container>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <StorefrontIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1">{t.appName}</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {t.footer.madeFor}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            © {t.appName}. {t.footer.rights}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
