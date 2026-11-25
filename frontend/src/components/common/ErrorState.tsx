import { Box, Button, Typography } from "@mui/material";
import { useT } from "@/i18n";

interface Props {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  const t = useT();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
        py: 6,
        color: "text.secondary",
      }}
    >
      <Typography variant="body1" color="error">
        {message ?? t.common.error}
      </Typography>
      {onRetry && (
        <Button variant="outlined" onClick={onRetry}>
          {t.common.retry}
        </Button>
      )}
    </Box>
  );
}
