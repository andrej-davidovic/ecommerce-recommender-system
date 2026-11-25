import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ReviewResponse } from "@/types/api";

export function useReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data } = await api.get<ReviewResponse[]>(
        `/products/${productId}/reviews`,
        { params: { page: 1, page_size: 50 } },
      );
      return data;
    },
  });
}

export function useCreateReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { rating: number; comment?: string }) => {
      const { data } = await api.post<ReviewResponse>(
        `/products/${productId}/reviews`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
      qc.invalidateQueries({ queryKey: ["product", productId] });
    },
  });
}

export function useUpdateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      reviewId: string;
      productId: string;
      payload: { rating?: number; comment?: string };
    }) => {
      const { data } = await api.put<ReviewResponse>(
        `/reviews/${vars.reviewId}`,
        vars.payload,
      );
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["reviews", vars.productId] });
      qc.invalidateQueries({ queryKey: ["product", vars.productId] });
    },
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { reviewId: string; productId: string }) => {
      await api.delete(`/reviews/${vars.reviewId}`);
      return vars;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["reviews", vars.productId] });
      qc.invalidateQueries({ queryKey: ["product", vars.productId] });
    },
  });
}
