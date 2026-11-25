import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { OrderResponse, PaymentIntentResponse } from "@/types/api";

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await api.post<PaymentIntentResponse>(
        "/payments/create-intent",
        null,
        { params: { order_id: orderId } },
      );
      return data;
    },
  });
}

export function useConfirmPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await api.post<OrderResponse>(
        "/payments/confirm",
        null,
        { params: { order_id: orderId } },
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
