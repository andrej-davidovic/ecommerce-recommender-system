import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/stores/authStore";
import type { TokenResponse } from "@/types/api";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

function flushQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((p) => {
    if (token) p.resolve(token);
    else p.reject(error);
  });
  pendingQueue = [];
}

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    const { refreshToken, setTokens, logout } = useAuthStore.getState();

    const url = original?.url ?? "";
    const isAuthEndpoint =
      url.includes("/auth/refresh") || url.includes("/auth/login");

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token: string) => {
              original._retry = true;
              original.headers = {
                ...original.headers,
                Authorization: `Bearer ${token}`,
              };
              resolve(api(original));
            },
            reject,
          });
        });
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post<TokenResponse>(
          `${API_URL}/auth/refresh`,
          { refresh_token: refreshToken },
        );
        setTokens(data.access_token, data.refresh_token);
        flushQueue(null, data.access_token);
        original.headers = {
          ...original.headers,
          Authorization: `Bearer ${data.access_token}`,
        };
        return api(original);
      } catch (refreshErr) {
        flushQueue(refreshErr, null);
        logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export function extractApiError(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  }
  return fallback;
}
