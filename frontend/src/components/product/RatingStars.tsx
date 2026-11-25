import { Box, Rating, Typography } from "@mui/material";

interface Props {
  value: number | null;
  count?: number;
  size?: "small" | "medium";
  showCount?: boolean;
}

export default function RatingStars({
  value,
  count,
  size = "small",
  showCount = true,
}: Props) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Rating
        value={value ?? 0}
        precision={0.5}
        size={size}
        readOnly
      />
      {showCount && (
        <Typography variant="caption" color="text.secondary">
          {value != null ? value.toFixed(1) : "—"}
          {count != null ? ` (${count})` : ""}
        </Typography>
      )}
    </Box>
  );
}
