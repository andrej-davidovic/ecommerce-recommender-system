import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import type { UserResponse } from "@/types/api";

export function useUpdatePreferences() {
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (category_ids: number[]) => {
      const { data } = await api.put<UserResponse>("/users/me/preferences", {
        category_ids,
      });
      setUser(data);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: async (payload: { full_name?: string; email?: string }) => {
      const { data } = await api.put<UserResponse>("/users/me", payload);
      setUser(data);
      return data;
    },
  });
}
