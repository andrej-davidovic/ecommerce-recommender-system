import { Box, Paper, Stack, Typography } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useT } from "@/i18n";

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: Props) {
  const t = useT();
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        background:
          "radial-gradient(1200px 600px at 50% -10%, #eef2ff, #f8fafc 60%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          component={RouterLink}
          to="/"
          sx={{ textDecoration: "none", color: "text.primary", mb: 3, justifyContent: "center" }}
        >
          <StorefrontIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {t.appName}
          </Typography>
        </Stack>
        <Typography variant="h5" align="center">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 0.5, mb: 3 }}>
          {subtitle}
        </Typography>
        {children}
      </Paper>
    </Box>
  );
}
