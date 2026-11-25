import { Box, Button, Rating, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useCreateReview, useUpdateReview } from "@/api/reviews";
import { useUiStore } from "@/stores/uiStore";
import { useT } from "@/i18n";
import type { ReviewResponse } from "@/types/api";

interface Props {
  productId: string;
  existing?: ReviewResponse;
  onDone?: () => void;
}

export default function ReviewForm({ productId, existing, onDone }: Props) {
  const t = useT();
  const [rating, setRating] = useState<number>(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const notify = useUiStore((s) => s.notify);
  const create = useCreateReview(productId);
  const update = useUpdateReview();
  const isEdit = !!existing;
  const isPending = create.isPending || update.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    const payload = { rating, comment: comment.trim() || undefined };

    if (isEdit) {
      update.mutate(
        { reviewId: existing.id, productId, payload },
        {
          onSuccess: () => {
            notify(t.reviews.updated);
            onDone?.();
          },
          onError: () => notify(t.common.error, "error"),
        },
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          notify(t.reviews.submitted);
          setRating(0);
          setComment("");
          onDone?.();
        },
        onError: () => notify(t.common.error, "error"),
      });
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        bgcolor: "#f8fafc",
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
        {isEdit ? t.reviews.editReview : t.reviews.writeReview}
      </Typography>
      <Stack spacing={2}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {t.reviews.yourRating}
          </Typography>
          <Rating
            value={rating}
            onChange={(_, v) => v && setRating(v)}
            size="large"
          />
        </Box>
        <TextField
          label={t.reviews.comment}
          multiline
          rows={3}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Stack direction="row" spacing={1}>
          <Button
            type="submit"
            variant="contained"
            disabled={rating === 0 || isPending}
          >
            {isEdit ? t.reviews.update : t.reviews.submit}
          </Button>
          {isEdit && onDone && (
            <Button onClick={onDone} color="inherit">
              {t.common.cancel}
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
