import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";
import type { TokenResponse, UserResponse } from "@/types/api";

interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  category_ids: number[];
}

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await api.post<UserResponse>(
        "/auth/register",
        payload,
      );
      return data;
    },
  });
}

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (creds: { email: string; password: string }) => {
      
      const form = new URLSearchParams();
      form.append("username", creds.email);
      form.append("password", creds.password);

      const { data } = await api.post<TokenResponse>("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      setTokens(data.access_token, data.refresh_token);

      const me = await api.get<UserResponse>("/auth/me");
      setUser(me.data);
      return me.data;
    },
  });
}

export function useMe(enabled: boolean) {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ["me"],
    enabled,
    queryFn: async () => {
      const { data } = await api.get<UserResponse>("/auth/me");
      setUser(data);
      return data;
    },
  });
}
