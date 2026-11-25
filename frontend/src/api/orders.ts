import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { OrderResponse, PaginatedResponse } from "@/types/api";

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<OrderResponse>("/orders/");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useOrders(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["orders", page, pageSize],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<OrderResponse>>(
        "/orders/",
        { params: { page, page_size: pageSize } },
      );
      return data;
    },
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["order", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get<OrderResponse>(`/orders/${id}`);
      return data;
    },
  });
}
