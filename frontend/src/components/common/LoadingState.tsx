import { Box, CircularProgress, Typography } from "@mui/material";
import { useT } from "@/i18n";

export default function LoadingState({ label }: { label?: string }) {
  const t = useT();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        py: 8,
        color: "text.secondary",
      }}
    >
      <CircularProgress />
      <Typography variant="body2">{label ?? t.common.loading}</Typography>
    </Box>
  );
}
