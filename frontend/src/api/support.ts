import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ChatResponse } from "@/types/api";

export function useSendChatMessage() {
  return useMutation({
    mutationFn: async (payload: { message: string; product_id?: string }) => {
      const { data } = await api.post<ChatResponse>("/support/chat", payload);
      return data;
    },
  });
}
