import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import type { CartResponse } from "@/types/api";

const CART_KEY = ["cart"];

export function useCart() {
  const isAuth = useAuthStore((s) => !!s.accessToken);
  return useQuery({
    queryKey: CART_KEY,
    enabled: isAuth,
    queryFn: async () => {
      const { data } = await api.get<CartResponse>("/cart/");
      return data;
    },
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { product_id: string; quantity?: number }) => {
      const { data } = await api.post<CartResponse>("/cart/items", {
        product_id: vars.product_id,
        quantity: vars.quantity ?? 1,
      });
      return data;
    },
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { product_id: string; quantity: number }) => {
      const { data } = await api.put<CartResponse>(
        `/cart/items/${vars.product_id}`,
        { quantity: vars.quantity },
      );
      return data;
    },
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product_id: string) => {
      const { data } = await api.delete<CartResponse>(
        `/cart/items/${product_id}`,
      );
      return data;
    },
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<CartResponse>("/cart/");
      return data;
    },
    onSuccess: (data) => qc.setQueryData(CART_KEY, data),
  });
}
