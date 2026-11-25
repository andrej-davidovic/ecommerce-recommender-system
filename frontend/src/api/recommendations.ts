import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { RecommendationResponse } from "@/types/api";

export function useRecommendations(n = 10, enabled = true) {
  return useQuery({
    queryKey: ["recommendations", n],
    enabled,
    queryFn: async () => {
      const { data } = await api.get<RecommendationResponse>(
        "/recommendations/",
        { params: { n } },
      );
      return data.recommendations;
    },
  });
}

export function usePopular(n = 10, enabled = true) {
  return useQuery({
    queryKey: ["recommendations", "popular", n],
    enabled,
    queryFn: async () => {
      const { data } = await api.get<RecommendationResponse>(
        "/recommendations/popular",
        { params: { n } },
      );
      return data.recommendations;
    },
  });
}

export function useSimilar(productId: string | undefined, n = 8) {
  return useQuery({
    queryKey: ["recommendations", "similar", productId, n],
    enabled: !!productId,
    queryFn: async () => {
      const { data } = await api.get<RecommendationResponse>(
        `/recommendations/similar/${productId}`,
        { params: { n } },
      );
      return data.recommendations;
    },
  });
}

export function useTrackRecommendationClick() {
  return useMutation({
    mutationFn: async (productId: string) => {
      await api.post("/recommendations/track-click", null, {
        params: { product_id: productId },
      });
    },
  });
}
