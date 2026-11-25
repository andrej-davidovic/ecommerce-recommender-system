import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import type { WishlistItemResponse } from "@/types/api";

const WISHLIST_KEY = ["wishlist"];

export function useWishlist() {
  const isAuth = useAuthStore((s) => !!s.accessToken);
  return useQuery({
    queryKey: WISHLIST_KEY,
    enabled: isAuth,
    queryFn: async () => {
      const { data } = await api.get<WishlistItemResponse[]>("/wishlist/");
      return data;
    },
  });
}

export function useWishlistIds(): Set<string> {
  const { data } = useWishlist();
  return new Set((data ?? []).map((w) => w.product_id));
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { product_id: string; inWishlist: boolean }) => {
      if (vars.inWishlist) {
        await api.delete(`/wishlist/${vars.product_id}`);
      } else {
        await api.post(`/wishlist/${vars.product_id}`);
      }
      return vars;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: WISHLIST_KEY }),
  });
}
