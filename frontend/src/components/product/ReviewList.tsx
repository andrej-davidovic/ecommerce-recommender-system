import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import type { ReviewResponse } from "@/types/api";
import { useAuthStore } from "@/stores/authStore";
import { useDeleteReview } from "@/api/reviews";
import { useUiStore } from "@/stores/uiStore";
import RatingStars from "./RatingStars";
import ReviewForm from "./ReviewForm";
import EmptyState from "@/components/common/EmptyState";
import { useT } from "@/i18n";

interface Props {
  reviews: ReviewResponse[];
  productId: string;
}

export default function ReviewList({ reviews, productId }: Props) {
  const t = useT();
  const userId = useAuthStore((s) => s.user?.id);
  const notify = useUiStore((s) => s.notify);
  const deleteReview = useDeleteReview();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (reviews.length === 0) {
    return <EmptyState title={t.product.noReviews} />;
  }

  const handleDelete = (reviewId: string) => {
    if (!confirm(t.reviews.deleteConfirm)) return;
    deleteReview.mutate(
      { reviewId, productId },
      {
        onSuccess: () => notify(t.reviews.deleted),
        onError: () => notify(t.common.error, "error"),
      },
    );
  };

  return (
    <Stack spacing={2} divider={<Divider flexItem />}>
      {reviews.map((r) => {
        const name = r.user_name || "Korisnik";
        const isOwner = userId === r.user_id;

        if (editingId === r.id) {
          return (
            <ReviewForm
              key={r.id}
              productId={productId}
              existing={r}
              onDone={() => setEditingId(null)}
            />
          );
        }

        return (
          <Box key={r.id}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "primary.light",
                  fontSize: 14,
                }}
              >
                {name[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle2">{name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(parseISO(r.created_at), "dd.MM.yyyy.")}
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <RatingStars value={r.rating} showCount={false} />
              {isOwner && (
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title={t.reviews.editReview}>
                    <IconButton
                      size="small"
                      onClick={() => setEditingId(r.id)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t.reviews.delete}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(r.id)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
            </Stack>
            {r.comment && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ pl: 6.5 }}
              >
                {r.comment}
              </Typography>
            )}
          </Box>
        );
      })}
    </Stack>
  );
}
